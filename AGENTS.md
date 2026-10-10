# AGENTS.md

Rules for AI assistants working in this repository.
Claude-specific workflow lives in `CLAUDE.md`, which imports this file.

## 1. Project purpose

A one-page personal portfolio website for **onins (Antoniño Bonagua), Full Stack
Developer**.

Names: the visitor-visible name is `profile.name`, lowercase **"onins"** by
design. The professional full name, `profile.fullName` ("Antoniño Bonagua"), is
used only in metadata: the page title, Open Graph, the share image, and JSON-LD
(where `name` is the full name and `alternateName` is "onins"). Do not capitalise
the visible name, and do not use `fullName` in visible UI.

Positioning: **"a modern resume redesigned as a website"** (an interactive modern resume).

It must NOT become:

- a generic developer portfolio template
- a dashboard
- a SaaS landing page
- a terminal interface
- a futuristic developer UI
- an excessive card grid
- a text-heavy portfolio

Sections, in order: introduction, experience, projects, certifications, tech
stack, contact. Projects are compact and expandable. The one signature
interaction is the guide robot (see `design/DESIGN.md` §14).

**Current phase: first version built; preparing to launch.** The design in
`design/DESIGN.md` is implemented and is the source of truth for how the site
looks and behaves. Do not redesign it, add sections, or change behavior unless
asked. Remaining launch work is content from the developer (see `README.md`),
deployment, and verification.

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
| zod | 4.x (contact-form validation) |

- Next.js 16 **App Router** + React 19 + TypeScript 5 (strict)
- Tailwind CSS **v4** (CSS-first config: `@import "tailwindcss"` + `@theme` in
  `src/app/globals.css` — there is **no** `tailwind.config.*` and **no**
  `postcss.config.*`; the Tailwind loader is wired in `next.config.ts`)
- npm (single package at the repository root — no monorepo, no `backend/`/`frontend/` split)
- ESLint flat config (`eslint.config.mjs`) + `next typegen && tsc --noEmit` typechecking
- Contact form: a Server Action (`src/app/actions.ts`) that validates with Zod and sends through the Resend REST API with `fetch` (no email SDK)
- Playwright MCP for UI verification
- **shadcn/ui: not installed (optional).** Do not install unless explicitly asked.
- **Vitest: not installed (optional).** Do not install unless explicitly asked.

Commands (run from the repository root):

```bash
npm install        # install dependencies
npm run dev        # next dev
npm run build      # next build
npm run lint       # eslint (flat config, whole project)
npm run typecheck  # next typegen + tsc --noEmit
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

`design/DESIGN.md` describes the implemented design (tokens, typography,
layout, motion, the robot). Match it. The accent color, the photo, and the hero
lead lines are provisional; do not change them without being asked. Do not invent
new design tokens or a second accent.

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
- Server-only variables: `RESEND_API_KEY`, `CONTACT_TO_EMAIL`,
  `CONTACT_FROM_EMAIL`, `CONTACT_PUBLIC_EMAIL`. They must never get a `NEXT_PUBLIC_` prefix, be logged,
  or reach a client component. `NEXT_PUBLIC_SITE_URL` (the public site address)
  is the only intentionally public variable. All are documented in `README.md`.
- The developer's email address must never appear in source, in the rendered
  HTML, or in a client bundle (this repository is public). The public contact
  address is `CONTACT_PUBLIC_EMAIL`; the `getPublicEmail` Server Action returns
  it on the visitor's first hover, focus, touch, or menu open, and
  `components/contact/public-email.ts` caches it. It is a different variable
  from `CONTACT_TO_EMAIL`, which stays private. Never hardcode either address,
  and never use the developer's personal address as the Git commit email: use
  the GitHub noreply address.
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
  - `src/app/`: routes, root layout, `globals.css`, the contact Server Action
    (`actions.ts`), and the metadata files (`sitemap.ts`, `robots.ts`,
    `not-found.tsx`, `opengraph-image.tsx`, icons).
  - `src/components/`, grouped by feature: `assistant/` (the robot and boot
    screen), `contact/`, `hero/`, `sections/` (page sections), `layout/`
    (header, footer, rail, theme), `shared/` (icons, links, JSON-LD).
  - `src/content/`: all factual content, one file per domain (`profile`,
    `experience`, `projects`, `certifications`, `skills`, `links`) plus
    `types.ts`, re-exported from `index.ts`. Import it as `@/content`.
  - `src/lib/`: site configuration (`site.ts`), the contact module
    (`contact/limits.ts` is client-safe; `contact/server.ts` is server-only),
    `evidence.ts`, and the robot's logic in `lib/assistant/`.
  - `public/`: the photo, `badges/`, and the résumé PDF. `design/`: DESIGN.md.
  There are no `hooks/` or `types/` folders; add one only when something real
  needs it.
- All site content lives in `src/content/`. Components read from it; do not
  hardcode content in components. It is also the single source of facts for any
  future résumé.
- Never import `@/lib/contact/server`, `@/lib/contributions`, or anything that
  reads secrets from a Client Component. Client code may import
  `@/lib/contact/limits` only.
- Any decision that adds a dependency, a service, or a new layer needs a
  short written justification first.

## 10. SEO and sharing (implemented)

In place, and to be kept correct as content changes:

- Metadata API in `src/app/layout.tsx`: title, description (both built from
  `content.ts`), canonical, Open Graph, Twitter/X cards.
- `src/lib/site.ts` is the single source of the site URL: `NEXT_PUBLIC_SITE_URL`,
  else Vercel's `VERCEL_PROJECT_PRODUCTION_URL`, else none. With no URL, the
  canonical, `og:url`, sitemap entries, and JSON-LD `url` are omitted rather than
  invented. Never hardcode a domain.
- `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/not-found.tsx`.
- `src/app/opengraph-image.tsx` (generated share image), `src/app/icon.svg`,
  `src/app/apple-icon.png`, `src/app/favicon.ico`.
- `src/components/shared/json-ld.tsx`: `Person` and `WebSite`, only from facts already
  shown on the page. Do not add facts that are not in `content.ts`.
- `verification.google` in `src/app/layout.tsx` is the public Google Search Console
  ownership token (not a secret). Keep it, or Search Console may unverify the site.
- One `h1`, an unbroken heading order, descriptive link text and image alt text.
- No keyword stuffing, and no claims that structured data guarantees rich
  results or ranking.

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
- `npm run typecheck` runs `next typegen` first because `LayoutProps` and the
  route types are generated; plain `tsc` fails on a fresh clone.
- Tailwind v4 scans source text for class candidates, comments included, so
  ordinary words in comments ("inline", "grow") can generate unused utilities.
- Writing `.env*` files is blocked by this project's permission rules. The
  developer creates those by hand; document variables in `README.md`.
- Test the production build with the browser tab in the foreground. A
  backgrounded headless tab throttles rendering, which makes view transitions
  and animations look far slower than they are.
- **Stale `.next` cache:** a production `next build` run while `next dev` is
  writing/reusing `.next` can emit bundles that predate your source edits (seen
  as a production CSS file still containing the *old* accent color). Never
  trust a production build that follows a live dev session. To verify
  production: stop the dev server, `rm -rf .next`, run a fresh
  `npm run build`, then confirm the emitted output actually contains the
  current source changes (e.g. grep the built `.css` for the new value) before
  `npm run start`.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
