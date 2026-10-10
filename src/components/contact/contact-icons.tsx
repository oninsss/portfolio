import type { CSSProperties, ReactElement } from "react";
import { heroLinks } from "@/content";
import { IconGitHub, IconLinkedIn, IconMail } from "@/components/shared/icons";
import { MailtoLink } from "./protected-email";

const LINK_ICONS: Record<
  string,
  (props: { size?: number; className?: string }) => ReactElement
> = {
  GitHub: IconGitHub,
  LinkedIn: IconLinkedIn,
  Email: IconMail,
};

const TILE =
  "group relative flex h-10 w-10 items-center justify-center border border-rule text-ink-muted transition-[color,border-color,translate,background-color] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:border-accent hover:bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] hover:text-accent focus-visible:-translate-y-0.5 focus-visible:border-accent focus-visible:text-accent";

const TIP_SIDE = {
  below: "top-full mt-2 translate-y-1 group-hover:translate-y-0 group-focus-visible:translate-y-0",
  above: "bottom-full mb-2 -translate-y-1 group-hover:translate-y-0 group-focus-visible:translate-y-0",
} as const;

export function ContactIcons({
  className,
  style,
  tipSide = "below",
}: {
  className?: string;
  style?: CSSProperties;
  tipSide?: keyof typeof TIP_SIDE;
}) {
  return (
    <ul className={["flex items-center gap-3", className].filter(Boolean).join(" ")} style={style}>
      {heroLinks.map((link) => {
        const Icon = LINK_ICONS[link.label];
        if (!Icon) return null;

        const tip = (
          <span
            aria-hidden="true"
            className={[
              "pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap border border-rule bg-canvas px-2 py-1 font-mono text-[0.6875rem] leading-none text-ink opacity-0 transition-[opacity,translate] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:opacity-100 group-focus-visible:opacity-100",
              TIP_SIDE[tipSide],
            ].join(" ")}
          >
            {link.href || link.email
              ? link.label
              : `${link.label} · coming soon`}
          </span>
        );

        if (link.email) {
          return (
            <li key={link.label}>
              <MailtoLink aria-label="Email" className={TILE}>
                <Icon size={18} />
                {tip}
              </MailtoLink>
            </li>
          );
        }

        return (
          <li key={link.label}>
            {link.href ? (
              <a
                href={link.href}
                aria-label={link.label}
                {...(link.href.startsWith("http")
                  ? { target: "_blank", rel: "noreferrer noopener" }
                  : null)}
                className={TILE}
              >
                <Icon size={18} />
                {tip}
              </a>
            ) : (
              <span
                role="img"
                aria-label={`${link.label}: link not added yet`}
                className="group relative flex h-10 w-10 cursor-default items-center justify-center border border-dashed border-rule text-ink-muted/50"
              >
                <Icon size={18} />
                {tip}
              </span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
