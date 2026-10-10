import Link from "next/link";
import { SiteHeader } from "@/components/layout/site-header";
import { IconArrowRight } from "@/components/shared/icons";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main
        id="main"
        className="mx-auto w-full max-w-5xl flex-1 px-5 pt-16 pb-24 sm:px-8 sm:pt-24"
      >
        <p className="font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-ink-muted">
          404
        </p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight text-ink sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-3 max-w-md text-ink-muted">
          That address doesn&rsquo;t lead anywhere on this site.
        </p>
        <Link
          href="/"
          className="group mt-8 inline-flex items-center gap-2 border border-accent px-4 py-2.5 text-sm text-accent transition-[background-color,color] duration-200 hover:bg-accent hover:text-canvas"
        >
          Back to the portfolio
          <IconArrowRight
            size={15}
            className="transition-transform duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:translate-x-0.5"
          />
        </Link>
      </main>
    </>
  );
}
