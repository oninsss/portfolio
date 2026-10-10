# Portfolio

A one-page portfolio for onins (Antoniño Bonagua), Full Stack Developer: a modern résumé redesigned as a website, with light, dark and system themes, an interactive guide robot, and a contact form.

Built with Next.js 16 (App Router), React 19, TypeScript, and Tailwind CSS v4. Design notes are in [`design/DESIGN.md`](design/DESIGN.md) and the working rules are in [`AGENTS.md`](AGENTS.md).

## Getting started

Requires Node.js 20.9 or newer and npm.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev        # start the dev server
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint
npm run typecheck  # next typegen + tsc --noEmit
```

There is no test runner.

## Editing content

All content lives in [`src/content/`](src/content), one file per domain: `profile`, `experience`, `projects`, `certifications`, `skills`, and `links`. Nothing is invented; anything not yet supplied is a bracketed placeholder (for example `[dates]`) or is omitted.

| To change | Do this |
| --- | --- |
| Résumé download | The button serves `public/Bonagua_Antonino_Resume-Public.pdf` and saves it for the visitor as `Bonagua_Antonino_Resume.pdf` (both set by `resumeFile` in `src/content/profile.ts`). To update the résumé, replace the file under the same name. |
| Profile photo | Replace the file in `public/` and update `portrait.src` in `src/content/profile.ts`. |
| Certificate badges | Images live in `public/badges/`; each certification's `badge` and `credentialUrl` are set in `src/content/certifications.ts`. |

## Environment variables

Set these in your host's environment settings, never in the repository. Only `NEXT_PUBLIC_SITE_URL` is safe to expose; the others are server-only and must never have a `NEXT_PUBLIC_` prefix.

| Variable | Required | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | for the contact form | API key from [Resend](https://resend.com/api-keys) |
| `CONTACT_TO_EMAIL` | for the contact form | Where contact-form messages are delivered |
| `CONTACT_PUBLIC_EMAIL` | for the email links | The address visitors see and can write to. Use a dedicated alias, not your main inbox. It is never in the repository, the HTML, or the JavaScript bundle: the server returns it on a visitor's first hover, focus, or touch. If unset, the email options say they are unavailable. |
| `CONTACT_FROM_EMAIL` | no | Sender shown on messages, on a domain verified in Resend. Defaults to `Portfolio <onboarding@resend.dev>`, which only delivers to the Resend account owner's own email |
| `NEXT_PUBLIC_SITE_URL` | no | The site's public address, for example `https://your-domain.com`. Drives the canonical URL, social-share URLs, sitemap, and structured data. On Vercel, if unset, the production domain Vercel provides is used. If neither is available, those URL-dependent tags are left out. |

Without `RESEND_API_KEY` and `CONTACT_TO_EMAIL`, the contact form tells visitors it is unavailable. Without `CONTACT_PUBLIC_EMAIL`, the email options say so, and LinkedIn and GitHub still work. Set `CONTACT_PUBLIC_EMAIL` before the first deploy.

For local development, create a `.env.local` file in the project root (it is git-ignored) with the same names and your own values. Keep real values out of any committed file.

## Deploying to Vercel

1. Push the repository to GitHub, GitLab or Bitbucket and import it in Vercel. Framework preset: Next.js; the default build command and output are correct.
2. In **Project Settings → Environment Variables**, add the variables above. They are set in Vercel separately from `.env.local`, which is not deployed. Add them for **Production**, and for **Preview** only if you want preview deployments to send real emails.
3. Redeploy after changing any variable. `NEXT_PUBLIC_SITE_URL` is read at build time.
4. If you add a custom domain later, set `NEXT_PUBLIC_SITE_URL` to it and redeploy so the canonical URL and sitemap use it.

## Search and sharing

The site ships with a title and description, Open Graph and Twitter cards with a generated share image (`src/app/opengraph-image.tsx`), icons, `robots.txt`, `sitemap.xml`, `Person` and `WebSite` structured data, and a custom 404 page. Preview deployments on Vercel are not indexed by default. After launch, check the result with a social-card debugger and Google Search Console; metadata and structured data help search engines understand the page but do not guarantee rankings or rich results.
