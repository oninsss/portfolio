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

- Next.js (App Router) + React + TypeScript
- Tailwind CSS + shadcn/ui
- npm (single package at the repository root — no monorepo, no `backend/`/`frontend/` split)
- ESLint + TypeScript typechecking
- Vitest where unit logic is worth testing
- Playwright MCP for UI verification

Commands (run from the repository root, once the app is scaffolded):

```bash
npm install        # install dependencies
npm run dev        # dev server
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm test           # Vitest (only once configured)
```

If a script does not exist yet, say so — do not pretend it ran.

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

1. Run `npm run lint`.
2. Run `npm run typecheck`.
3. Run tests when applicable (`npm test`).
4. If any UI changed, verify it with **Playwright MCP** (real screenshots and
   interaction), not by assumption.
5. Report the **actual** output/results of each check.

Never claim a test, lint, typecheck, or UI check passed without actually running it.
If a check could not be run, say exactly that.

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
- App Router only. Keep route structure shallow — this is a one-page site.
- Server Components by default; Client Components only for real interactivity.
- Data is static/local for now: no database, no API layer, no CMS unless a
  later spec explicitly requires one.
- No state management library until a concrete need appears.
- No component library beyond shadcn/ui.
- Prefer plain Tailwind utilities over custom abstraction layers.
- Keep file structure boring and predictable:
  `app/`, `src/components/`, `src/lib/`, `public/`.
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

- The repository is not a Git repository yet; the human initializes and commits Git.
- `package.json` and the Next.js app are scaffolded separately, before implementation begins.
- The lint hook (`.claude/hooks/lint-file.mjs`) silently skips files until an
  ESLint config exists in the repository.
