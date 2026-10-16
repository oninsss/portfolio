import type { ReactElement } from "react";
import { contactLinks } from "@/content";
import { IconArrowUpRight, IconGitHub, IconLinkedIn, IconMail } from "@/components/shared/icons";
import { ContactForm } from "./contact-form";
import { CopyEmail, MailtoLink } from "./protected-email";

const CONTACT_ICONS: Record<
  string,
  (props: { size?: number; className?: string }) => ReactElement
> = {
  Email: IconMail,
  LinkedIn: IconLinkedIn,
  GitHub: IconGitHub,
};

export function ContactInvitation() {
  return (
    <div>
      <p className="text-2xl font-medium tracking-tight text-ink sm:text-3xl">
        Let&apos;s build something.
      </p>
      <p className="mt-2 max-w-[46ch] text-sm leading-relaxed text-ink-muted sm:text-base">
        Have a project, opportunity, or just want to talk?
      </p>

      <div className="mt-8">
        <ContactForm />
      </div>

      <p className="mt-12 font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-ink-muted">
        Or reach me directly
      </p>

      <ul className="mt-3 border-t border-rule">
        {contactLinks.map((link) => {
          const Icon = CONTACT_ICONS[link.label];

          const body = (
            <>
              <span className="min-w-0">
                <span className="flex items-center gap-2.5 text-xl text-ink transition-colors duration-150 group-hover:text-accent sm:text-2xl">
                  {Icon ? <Icon size={20} className="text-ink-muted" /> : null}
                  {link.label}
                </span>
                {link.note ? (
                  <span className="mt-1 block text-sm text-ink-muted">
                    {link.note}
                  </span>
                ) : null}
              </span>

              {link.href || link.email ? (
                <IconArrowUpRight
                  size={22}
                  className="shrink-0 text-ink-muted transition-[color,transform,translate] duration-150 group-hover:text-accent group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                />
              ) : (
                <span className="shrink-0 font-mono text-xs text-ink-muted">
                  {link.value}
                </span>
              )}
            </>
          );

          return (
            <li
              key={link.label}
              className={[
                "reveal border-b border-rule",
                link.email ? "relative z-10" : "",
              ].join(" ")}
            >
              {link.email ? (
                <div className="flex items-center gap-4">
                  <MailtoLink className="group flex min-w-0 flex-1 items-center justify-between gap-5 py-5 sm:py-6">
                    {body}
                  </MailtoLink>
                  <CopyEmail />
                </div>
              ) : link.href ? (
                <a
                  href={link.href}
                  className="group flex items-center justify-between gap-5 py-5 sm:py-6"
                >
                  {body}
                </a>
              ) : (
                <div className="flex items-center justify-between gap-5 py-5 sm:py-6">
                  {body}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
