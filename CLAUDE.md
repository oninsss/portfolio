@AGENTS.md

## Claude Code workflow

`AGENTS.md` above is the source of truth for stack, design, content, security,
verification, and Git rules. Follow it.

### Working style

- **Inspect before editing.** Read the target file and its neighbours first.
- **Explain the approach** before any non-trivial implementation.
- **Keep changes focused.** No drive-by refactors, no unrequested files.
- **Reuse existing patterns** and components before creating new ones.
- After implementing, **run verification** (`npm run lint` + read the output,
  `npm run typecheck`, `npm run build` when routing/config/types changed) and
  report the real output. There is no test runner installed yet — say so rather
  than implying tests passed.
- For any UI change, verify with **Playwright MCP** (screenshots + interaction).
  Never assume how something looks.
- Use the `code-reviewer` subagent after any meaningful feature or non-trivial change.
- Address legitimate review findings, then **run verification again**.
- Ignore review findings that are style nitpicks or speculation; the linter owns style.

### Subagents

Available in this repository (`.claude/agents/`):

- `code-reviewer` — fresh-context diff review. Never modifies files.
- `frontend-developer` — Next.js App Router + React + TypeScript + Tailwind CSS work.
  shadcn/ui is **not** installed; do not add it unless explicitly asked.

### MCP

Servers configured in `.mcp.json`. Only `playwright` is configured for now.

### Skills

- Only use skills that are actually installed in the current session.
- **Never claim to have used a skill that is not installed.**
- Do not install third-party skills unless the human developer explicitly asks.

### Git

Read-only Git only (`status`, `diff`, `log`). Never commit, push, amend, reset,
rebase, force-push, release, or open/merge PRs — see AGENTS.md §8.
