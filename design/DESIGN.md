# DESIGN.md — Portfolio Design

Status: **implemented (first version).** This document describes the design as it
is built. It records decisions; it is not a brief for a new concept. Where
something is provisional it says so in [Provisional](#17-provisional).

Related: `AGENTS.md` (rules), `CLAUDE.md` (workflow), `README.md` (setup).

---

## 1. Identity

A **modern résumé redesigned as a website**: a real developer's résumé that
happens to be a well-designed page. The content and the engineering work carry
the personality; the visual design and the one signature interaction support it.

It is deliberately not a template, a landing page, a dashboard, a terminal
interface, or a visual-design showcase.

---

## 2. Page structure

One page, one `h1`. Sections in order:

| # | Section | Id | Notes |
|---|---|---|---|
| 1 | Introduction | `introduction` | Hero, stack strip, contact icons, résumé button |
| 2 | Experience | `experience` | Compact résumé-style entries |
| 3 | Projects | `projects` | Compact, expandable |
| 4 | Certifications | `certifications` | Credential cards, 6 shown, rest behind a disclosure |
| 5 | Tech Stack | `tech-stack` | Technologies against the projects that used them |
| 6 | Contact | `contact` | Form plus direct email options |

A footer closes the page. Each section is a hairline top rule with a small
square marker and a mono label on the left (a short note beneath it), content on
the right. On narrow screens the label stacks above the content.

---

## 3. Introduction

- Photo on the left (portrait, rounded, hairline border, gently zoomed), name as
  the `h1` with the robot mark beside it, role underneath.
- Fact chips: background, location, local time there (with the UTC offset and a
  24-hour day bar), and availability. Each appears only if it has a value.
- A rotating lead sentence (five lines, each held for several seconds) with
  progress ticks and a pause control.
- Below a hairline: the **stack strip** (§4), then GitHub / LinkedIn / Email as
  square icon tiles with hover labels, and the résumé button.
- The email address is never written into the page or the source. It is fetched
  from the server the first time a visitor hovers, focuses, or touches an email
  control, and the controls say so plainly if it is not available.

### Résumé button

A single **Download résumé** control. Until a file is supplied it is a dashed,
disabled button reading "Résumé · coming soon", never a link to nothing.

---

## 4. Stack strip

"I build across the stack." is the heading of a line with a square on it for
each layer: Interfaces, APIs, Data, AI, Cloud. Under each layer are its
technologies and a count derived from the project data ("Used in N places", counting projects and roles).

- Every name and every layer heading links into the Tech Stack and highlights
  what it refers to.
- Wide screens: five columns along one line. Narrow screens: the line turns and
  runs down the left, the same layers one under another.

---

## 5. Experience

Compact, résumé-like entries (role, organization, timeframe, a short
description, technologies). No cards.

---

## 6. Projects

One entry so far (more are coming), compact by default: number, name, one-line summary, technologies,
and a **View details** control. Expanded content gives problem, my contribution,
role, and implementation. Contributions are worded to separate what I built,
what I assisted with, and what the team built. No metrics or outcomes are stated that were not
supplied. External links appear only where a real one exists.

---

## 7. Certifications

Credential cards in a two-column grid: badge, title, issuer, issued and expiry
dates, and a **Verify credential** button that opens the issuer's page. A card
without a verification link shows a disabled dashed button; without a badge image
it shows an issuer monogram. Six cards show first; **View all certifications**
reveals the rest (a native disclosure, so it works without JavaScript).

---

## 8. Tech Stack

A matrix: technologies grouped by layer (Frontend, Backend, Data, Cloud & APIs)
as rows, with Languages and Tools in a separate "Across every layer" block,
projects and roles as columns, and a square where a project or role used a technology. Work experience is a column of its own, so skills earned on the job show up even when no personal project used them. Selecting a column keeps only the rows it used and shows the
rest on request; a **More projects** control holds additional project columns. Links from
elsewhere on the page (the stack strip, the footer's "Built with") arrive here
with the relevant rows highlighted. No percentage bars, meters or logo walls.

---

## 9. Contact

A short message form (name, email, message) beside a few direct rows: email,
LinkedIn, GitHub. The email row opens the default mail app, with a
button beside it to copy the address. The form validates on the server and says plainly when it
cannot send (§12).

---

## 10. Footer

Copyright with the current year, a "Built with …" line linking into the Tech
Stack, the contact icons, and **Back to top** (which the robot performs, §14).

---

## 11. Visual language

**Minimal editorial plus technical.** Restrained, typography-led, deliberate
spacing, subtle borders, clear hierarchy.

- **Squares, not circles.** The small square is the recurring mark: section
  markers, the navigation rail, the stack line, the tech matrix.
- **Hairline rules** (`--rule`) instead of boxes. Cards are used only for
  credentials; they are plain bordered rectangles.
- **Rounded corners** are reserved for the photo, the robot, and the credential
  badges.
- **Mono** is used only for technical metadata: labels, dates, counts.
- The page reads correctly with all animation disabled.

Avoided: dashboards, terminal and futuristic styling, neon, gradients, glow,
glassmorphism, decorative grids, card walls, giant decorative type, fake
statistics, cursor-following effects, typing animations, perpetual background
motion.

---

## 12. Color

Two themes on one token set, defined once in `src/app/globals.css` and referenced
through Tailwind theme variables.

| Token | Light | Dark |
|---|---|---|
| `--canvas` | `#f8f8f6` | `#131312` |
| `--ink` | `#191917` | `#ececea` |
| `--muted` | `#6b6b67` | `#989894` |
| `--rule` | `#e5e4e0` | `#272725` |
| `--accent` | `#6d3fcf` | `#a58bf2` |

One accent only, used for focus, links on hover, the active marker, and the
robot. No second accent and no gradient system.

---

## 13. Typography, theme, motion

**Typography.** Poppins (400, 500) for everything; Geist Mono for technical
metadata only. Hierarchy comes from size, weight, spacing and alignment.

**Theme.** System (default), Light and Dark, as three small icon buttons in the
header. The choice is stored and applied before first paint, so there is no flash.
Changing theme crossfades the page over about 0.4 seconds.

**Motion** is punctuation: hover and focus states, a gentle rise on scroll, the
project and certification disclosures, the theme crossfade, a thin scroll-progress
bar, and the robot. **All motion respects `prefers-reduced-motion`**, and the
reduced-motion page is complete, not degraded.

---

## 14. Signature interaction: the robot

The geometric shape that begins the page becomes a small robot: a purple rounded
square with a dark visor and a changing face. It lives in the hero beside the name.

- **First visit in a session:** a short boot screen shows the robot asleep with the
  name on its visor, wakes it, and sends it to its place beside the name. Later
  loads skip this, as does reduced motion.
- **Click or hover** opens a small menu: Know me, See my work, My experience,
  Let's talk. Choosing one scrolls and moves the robot to that section, where it
  says something short.
- **Everything it says is generated from the page's own data**, so it cannot claim
  anything the page does not show.
- **Page-anchored:** it moves in page coordinates and stays where it parked when
  you scroll; it never follows the window.
- **Back to top** sends it home with the scroll.
- **Idle:** it blinks and, occasionally, says something. Reading a section can
  prompt a remark.
- **Reduced motion:** it jumps instead of flying.
- **Keyboard:** reachable by Tab, opens with Enter, closes with Escape and returns
  focus. It is a button with a name ("Portfolio guide").

---

## 15. Navigation

- A **dot rail** fixed to the right edge from tablet width up: one square per
  section, magnifying toward the pointer, marking the active section.
- A **skip link** and a thin **scroll-progress** bar.
- No hamburger or overlay on phones; the page is short enough to scroll, and the
  robot offers the same jumps.

---

## 16. Responsive and accessibility

**Responsive.** Intentionally laid out, not shrunk. Wide: two-column sections,
five-column stack strip. Narrow: stacked, the stack line turns vertical, the hero
name steps down below 360px. Verified without horizontal overflow from 320px to
1024px.

**Accessibility** is a first-class requirement: semantic landmarks, a single `h1`
and an unbroken heading order, visible focus states, contrast in both themes,
correctly labelled disclosures and toggles (`aria-expanded`, `aria-pressed`),
descriptive alt text, and ARIA only where native elements are not enough.

---

## 17. Provisional

Decisions that are in place but not final:

- **Accent color** is a temporary purple.
- **Photo** is temporary, stored as `temp-profile.jpg`.
- **Résumé** download serves `public/Bonagua_Antonino_Resume-Public.pdf`, a temporary version (it still contains a `[Portfolio URL]` placeholder) to be replaced under the same filename.
- **Name:** the visible name is "onins"; metadata uses "Antoniño Bonagua".
- **Hero lead lines** are drafts for the developer to edit.
- **Share image** is generated from the robot, name and role; a different one can
  replace it.

Built but not shown: a GitHub contribution calendar
(`src/components/sections/contribution-heatmap.tsx`), removed from the page for now.

---

## 18. Content rules

Never invent employers, dates, project results, metrics, testimonials, client
names, technologies the developer has not confirmed, or achievements. Missing
facts are shown as clearly bracketed placeholders or omitted, and the layout must
work with uneven real content.

---

## 19. Non-goals

No dashboard, terminal UI, futuristic aesthetic, template look, card walls,
gradients, glassmorphism, cursor-following, fake metrics, skill bars, technology
logo walls, shadcn requirement, unnecessary dependencies, or animation for its
own sake.
