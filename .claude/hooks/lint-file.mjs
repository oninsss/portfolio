#!/usr/bin/env node
// Post-edit hook: run ESLint (--fix) on the file that was just edited.
//
// Single Next.js package. The hook does NOT assume the app lives at the repo
// root: it walks up from the edited file to the nearest package.json, so it
// keeps working if the app sits in a subdirectory.
//
// Behaviour:
//   - reads the edited file path from the hook JSON payload on stdin
//   - ignores unsupported extensions and non-project directories
//   - skips quietly while no ESLint config exists yet
//   - runs `eslint --fix <file>` from the owning package directory
//   - exits 2 whenever ESLint reports a problem (error OR warning) so the
//     agent sees it. This project configures its rules as "warn", so a plain
//     non-zero-exit check would never surface anything.
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
const IGNORED = ["node_modules", ".next", ".git", ".claude", ".playwright-mcp", "out", "build", "coverage"];
if (parts.some((p) => IGNORED.includes(p))) process.exit(0);

// --- 3. find the package that owns this file --------------------------------
const rootAbs = path.resolve(root);
let pkgDir = path.dirname(abs);
let found = null;
while (true) {
  if (existsSync(path.join(pkgDir, "package.json"))) {
    found = pkgDir;
    break;
  }
  const here = path.resolve(pkgDir);
  if (here === rootAbs) break; // repository root already checked
  if (!here.startsWith(rootAbs + path.sep)) break; // would leave the repo
  const parent = path.dirname(here);
  if (parent === here) break; // filesystem root
  pkgDir = parent;
}
if (!found) {
  console.error(`[lint-file] skipped ${rel}: no package.json found above this file.`);
  process.exit(0);
}
const pkgRoot = found;

const ESLINT_CONFIGS = [
  "eslint.config.js",
  "eslint.config.mjs",
  "eslint.config.cjs",
  "eslint.config.ts",
  "eslint.config.mts",
  "eslint.config.cts",
  ".eslintrc",
  ".eslintrc.js",
  ".eslintrc.cjs",
  ".eslintrc.json",
  ".eslintrc.yml",
  ".eslintrc.yaml",
];
const hasEslintConfig = ESLINT_CONFIGS.some((cfg) => existsSync(path.join(pkgRoot, cfg)));
if (!hasEslintConfig) {
  console.error(`[lint-file] skipped ${rel}: no ESLint config in ${path.relative(root, pkgRoot) || "."}.`);
  process.exit(0);
}

// --- 4. run ESLint on the edited file ---------------------------------------
const target = path.relative(pkgRoot, abs);
const r = spawnSync("npx", ["--no-install", "eslint", "--fix", target], {
  cwd: pkgRoot,
  encoding: "utf8",
  shell: true,
});

if (r.error) {
  console.error(`[lint-file] failed to run ESLint: ${r.error.message}`);
  process.exit(0); // tooling problems must not block the agent
}

const out = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim();

// `eslint` exits non-zero on errors, but this project's rules are warnings
// (severity 1), so it exits 0 with problems on screen. Surface both.
const reportedProblem = /\b(error|warning)\b\s/i.test(out) && /\d+:\d+/.test(out);

if (r.status !== 0 || reportedProblem) {
  console.error(out);
  process.exit(2);
}

process.exit(0);
