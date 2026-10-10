import { profile, siteStack } from "@/content";
import { SITE_ID } from "@/lib/evidence";
import { BackToTop } from "./back-to-top";
import { ContactIcons } from "@/components/contact/contact-icons";
import { CurrentYear } from "./current-year";
import { TechLink } from "@/components/shared/tech-link";

function list(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export function SiteFooter() {
  return (
    <footer id="footer" className="border-t border-rule">
      <div
        data-post-anchor=""
        className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-10 gap-y-6 px-5 py-8 sm:px-8"
      >
        <div className="min-w-0 space-y-1.5">
          <p className="text-xs text-ink-muted">
            © <CurrentYear /> {profile.name}
          </p>
          <p className="text-xs leading-relaxed text-ink-muted">
            Built with{" "}
            <TechLink
              source={SITE_ID}
              title="See what this site is built with"
            >
              {list(siteStack)}
            </TechLink>
            .
          </p>
        </div>

        <ContactIcons tipSide="above" />

        <BackToTop />
      </div>
    </footer>
  );
}
