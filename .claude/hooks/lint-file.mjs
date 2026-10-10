#!/usr/bin/env node
// Post-edit hook: run ESLint (--fix) on the file that was just edited.
//
// Single-package repository (Next.js at the repo root). There is no
// backend/ or frontend/ split here.
//
// Behaviour:
//   - reads the edited file path from the hook JSON payload on stdin
//   - ignores unsupported extensions and non-project directories
//   - skips quietly while the project has no ESLint config yet
//   - runs `eslint --fix <file>` from the repository root
//   - exits 2 (so the agent sees it) when ESLint reports problems
import { readFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";

// --- 1. detect the edited file ---------------------------------------------
let file = "";
try {
  const input = JSON.parse(readFileSync(0, "utf8"));
  file = input?.tool_input?.file_path ?? input?.tool_input?.path ?? "";
} catch {
  process.exit(0); // no usable payload: nothing to lint
}
if (!file) process.exit(0);

// --- 2. ignore unsupported extensions --------------------------------------
if (!/\.(js|jsx|ts|tsx|mjs|cjs)$/.test(file)) process.exit(0);

const root = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const abs = path.resolve(root, file);
const rel = path.relative(root, abs);

// Outside the repository, or inside generated/tooling directories: skip.
if (rel.startsWith("..") || path.isAbsolute(rel)) process.exit(0);
const parts = rel.split(path.sep);
if (parts.some((p) => ["node_modules", ".next", ".git", ".claude", ".playwright-mcp"].includes(p))) {
  process.exit(0);
}

// --- 3. skip quietly when the project is not set up yet ---------------------
if (!existsSync(path.join(root, "package.json"))) process.exit(0);

const hasEslintConfig = [
  "eslint.config.js",
  "eslint.config.mjs",
  "eslint.config.cjs",
  "eslint.config.ts",
  ".eslintrc",
  ".eslintrc.js",
  ".eslintrc.cjs",
  ".eslintrc.json",
  ".eslintrc.yml",
  ".eslintrc.yaml",
].some((cfg) => existsSync(path.join(root, cfg)));

if (!hasEslintConfig) {
  console.error(`[lint-file] skipped ${rel}: no ESLint config found in the repository yet.`);
  process.exit(0);
}

// --- 4. run ESLint on the edited file ---------------------------------------
const r = spawnSync("npx", ["--no-install", "eslint", "--fix", rel], {
  cwd: root,
  encoding: "utf8",
  shell: true,
});

if (r.error) {
  console.error(`[lint-file] failed to run ESLint: ${r.error.message}`);
  process.exit(0); // tooling problems must not block the agent
}

// `eslint` exits 1 on lint errors, 2 on config/internal errors.
// Exit code 2 feeds the messages back to the agent so it can fix them.
if (r.status !== 0) {
  console.error(r.stdout ?? "");
  console.error(r.stderr ?? "");
  process.exit(2);
}

process.exit(0);
