import { HeroFacts } from "@/components/hero/hero-facts";
import { JsonLd } from "@/components/shared/json-ld";
import {
  HeroPhoto,
  PortfolioDetails,
  PortfolioLead,
  PortfolioView,
} from "@/components/sections/portfolio-view";
import { SectionRail } from "@/components/layout/section-rail";
import { AssistantCube } from "@/components/assistant/assistant";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { portrait, profile } from "@/content";

function HeroIdentity() {
  return (
    <div id="introduction" className="min-w-0">
      <div className="mt-4 flex items-baseline">
        <h1 className="text-[1.75rem] font-medium tracking-tight text-ink min-[360px]:text-4xl sm:text-5xl lg:text-[3.25rem]">
          {profile.name}
        </h1>
        <AssistantCube className="mark-hero bot bot-hero ml-3 align-baseline" />
      </div>

      <p className="mt-2 text-lg text-ink-muted sm:text-xl">
        {profile.role}
      </p>
      <HeroFacts />
    </div>
  );
}

export default function Home() {
  return (
    <>
      <JsonLd />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:border focus:border-rule focus:bg-canvas focus:px-3 focus:py-2 focus:text-sm focus:text-ink"
      >
        Skip to content
      </a>

      <div className="scroll-progress" aria-hidden="true" />
      <SiteHeader />
      <SectionRail />

      <main id="main" className="mx-auto w-full max-w-5xl flex-1 px-5 sm:px-8">
        <div id="top" className="min-w-0 pt-12 pb-16 sm:pt-16 sm:pb-24 lg:pt-20">
          <div
            className={
              portrait
                ? "grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-5 gap-y-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-x-12 lg:gap-y-0"
                : undefined
            }
          >
            {portrait ? (
              <div className="mt-4 self-start lg:row-span-2 lg:mt-5 lg:self-stretch">
                <HeroPhoto />
              </div>
            ) : null}

            <HeroIdentity />

            <div className="col-span-2 mt-6 lg:col-span-1">
              <PortfolioLead />
            </div>

            <div className="col-span-full mt-8 sm:mt-10">
              <PortfolioDetails />
            </div>
          </div>

          <div className="mt-12 sm:mt-16">
            <PortfolioView />
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
