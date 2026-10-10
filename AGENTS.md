# AGENTS.md

Rules for AI assistants working in this repository.
Claude-specific workflow lives in `CLAUDE.md`, which imports this file.

## 1. Project purpose

A one-page personal portfolio website for **Antoniño, Full Stack Developer**.

Positioning: **"a modern resume redesigned as a website"** (an interactive modern resume).

It must NOT become:

- a generic developer portfolio template
- a dashboard
- a SaaS landing page
- a terminal interface
- a futuristic developer UI
- an excessive card grid
- a text-heavy portfolio

Eventual sections: introduction, selected projects, experience, grouped skills,
education, short about, contact links. Projects will be compact and expandable,
with external links. One signature interaction is planned, but its design has
**not** been decided yet — never invent or implement it.

**Current phase: environment setup only.** The application is not scaffolded yet.
Do not build any portfolio UI, pages, components, or content until the human
developer explicitly starts the implementation phase.

## 2. Stack

Actual installed versions (see `package.json` / `package-lock.json`):

| Package | Version |
|---|---|
| next | 16.4.0 |
| react / react-dom | 19.3.0 |
| typescript | 5.9.3 |
| tailwindcss | 4.3.3 (loaded via `@tailwindcss/turbopack`) |
| eslint | 9.39.5 |
| eslint-config-next | 16.4.0 |

- Next.js 16 **App Router** + React 19 + TypeScript 5 (strict)
- Tailwind CSS **v4** (CSS-first config: `@import "tailwindcss"` + `@theme` in
  `src/app/globals.css` — there is **no** `tailwind.config.*` and **no**
  `postcss.config.*`; the Tailwind loader is wired in `next.config.ts`)
- npm (single package at the repository root — no monorepo, no `backend/`/`frontend/` split)
- ESLint flat config (`eslint.config.mjs`) + `tsc --noEmit` typechecking
- Playwright MCP for UI verification
- **shadcn/ui: not installed (optional).** Do not install unless explicitly asked.
- **Vitest: not installed (optional).** Do not install unless explicitly asked.

Commands (run from the repository root):

```bash
npm install        # install dependencies
npm run dev        # next dev
npm run build      # next build
npm run lint       # eslint (flat config, whole project)
npm run typecheck  # tsc --noEmit
```

There is no `npm test` script yet. If a script does not exist, say so —
do not pretend it ran.

Note: `npm run lint` currently exits `0` even when it prints warnings, because
`eslint-config-next` sets these rules to warning severity. Judge lint by its
**output**, not only by its exit code.

## 3. Development principles

- Inspect before editing. Read the existing file and its neighbours first.
- Explain the approach before any non-trivial implementation.
- Keep changes focused on the task at hand.
- Reuse existing patterns, helpers, and components before adding new ones.
- Prefer the simplest solution that satisfies the requirement.
- Do not add a dependency without a concrete reason.
- Use semantic HTML (`header`, `nav`, `main`, `section`, `article`, `footer`, lists, real headings).
- Prefer Server Components. Use Client Components only where interactivity, browser-only APIs, or state require it.
- Keep client-side JavaScript minimal.
- Validate untrusted or external input with Zod where validation is appropriate.
- Do not create documentation files that were not requested.

## 4. Design principles

The visual direction is "interactive modern resume": editorial, calm, readable,
typography-led, restrained.

Avoid:

- excessive cards and card grids
- dashboard layouts
- decorative grid backgrounds
- excessive gradients, glow, glassmorphism
- fake statistics
- excessive badges and metadata
- giant paragraphs
- unnecessary animation

Requirements:

- must support **light, dark, and system** themes
- must be responsive across small phones through large desktops
- must be accessible (keyboard, focus states, contrast, reduced motion)
- animations must respect `prefers-reduced-motion`

The exact visual design is **not finalized**. `design/DESIGN.md`,
`docs/product-spec.md`, `docs/architecture.md`, and `docs/ui-spec.md` will be
added later. Do not invent a final design system or invent design tokens ahead
of those documents.

## 5. Content rules

- **Never invent content.** No invented project details, metrics, technologies,
  achievements, employers, dates, awards, testimonials, or statistics.
- Do not invent placeholder project cards, fake numbers, or filler bios.
- Content comes from the human developer or an approved spec document.
- If required content is missing, ask for it instead of making it up.
- Keep copy short and specific. Prefer one precise sentence over a paragraph.

## 6. Security rules

- Never hardcode secrets. Read them from environment variables.
- Never read or print `.env`, `.env.*`, or `secrets/**` unless the task
  explicitly and legitimately requires it.
- Never commit secrets, tokens, keys, or credentials.
- Treat external/untrusted input as hostile: validate it (Zod) before use.
- Do not add authentication, payments, or user-data handling without an
  explicit requirement and a review pass.

## 7. Verification rules

Before saying a task is complete:

1. Run `npm run lint` and read its output (warnings do not change the exit code).
2. Run `npm run typecheck`.
3. Run `npm run build` when routing, layout, config, or types changed.
4. Run tests when applicable. **No test runner is installed yet** — if none
   exists, say the tests were not applicable instead of implying they passed.
5. If any UI changed, verify it with **Playwright MCP** (real screenshots and
   interaction), not by assumption.
6. Report the **actual** output/results of each check.

Never claim a test, lint, typecheck, build, or UI check passed without actually
running it. If a check could not be run, say exactly that.

## 8. Git restrictions

**All history-changing Git operations are performed manually by the human developer.**

The assistant MUST NOT:

- `git commit` / create commits
- `git push`
- amend commits
- `git reset` (any history-altering reset)
- `git rebase`, `git stash drop`, or any history rewrite
- force-push
- create releases
- create or merge pull requests
- otherwise modify Git history

Allowed (read-only): `git status`, `git diff`, `git log`, `git show`, `git branch`.
Leave all committing, pushing, and history management to the human.

## 9. Architecture decision guidelines

- One Next.js application at the repository root. No separate backend package.
- App Router only, routes live in `src/app/`. Keep route structure shallow —
  this is a one-page site.
- Server Components by default; Client Components only for real interactivity.
- Data is static/local for now: no database, no API layer, no CMS unless a
  later spec explicitly requires one.
- No state management library until a concrete need appears.
- Component libraries: **none installed today**. shadcn/ui is optional and may
  only be added on explicit request. Never add a second UI library.
- Prefer plain Tailwind utilities over custom abstraction layers.
- Keep file structure boring and predictable:
  `src/app/` (routes + `layout.tsx`, `page.tsx`, `globals.css`),
  `src/components/`, `src/lib/`, `public/`. Only `src/app/` and `public/`
  exist so far — create the others when the implementation phase needs them.
- Any decision that adds a dependency, a service, or a new layer needs a
  short written justification first.

## 10. SEO (implementation requirement — do NOT implement yet)

Recorded here as a requirement for the implementation phase. Do not add any of
this during the setup phase:

- Next.js Metadata API: `title`, `description`, canonical URL
- Open Graph metadata, Twitter/X metadata
- `sitemap`, `robots.txt`
- semantic HTML with a correct heading hierarchy
- descriptive link text, descriptive image alt text
- optimized images
- appropriate `Person` structured data / JSON-LD
- no keyword stuffing

## 11. Gotchas

<!-- Add non-obvious things here as you hit them. -->

- Git is initialized; the human does all committing and history management.
- The lint hook (`.claude/hooks/lint-file.mjs`) locates the owning `package.json`
  by walking up from the edited file, so it works from the repo root.
- This project's ESLint rules are configured at **warning** severity, so
  `npx eslint` exits `0` even when it reports problems. The hook therefore
  exits `2` on warnings as well as errors. Read the output, not just the code.
- `.claude/hooks/lint-file.mjs` silently skips files until an ESLint config exists.
- shadcn/ui and Vitest are **optional and not installed**. Do not add them
  unless explicitly asked.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
