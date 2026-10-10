import Image from "next/image";
import { issuerMark, type Certification } from "@/content";
import { IconArrowUpRight } from "@/components/shared/icons";

const INITIAL = 6;

export function CertificationCards({ items }: { items: Certification[] }) {
  const shown = items.slice(0, INITIAL);
  const hidden = items.slice(INITIAL);
  const expandable = hidden.length > 0;

  return (
    <div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {shown.map((certification) => (
          <CredentialCard
            key={certification.id}
            certification={certification}
          />
        ))}
      </ul>

      {expandable ? (
        <details className="mt-4">
          <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 border border-rule px-3 py-1.5 text-[0.8125rem] text-ink-muted transition-colors duration-150 hover:border-accent hover:text-accent focus-visible:outline-offset-3 [&::-webkit-details-marker]:hidden">
            <span className="cert-label-less">View all certifications</span>
            <span className="cert-label-more">Show fewer</span>
            <svg
              viewBox="0 0 12 12"
              width="11"
              height="11"
              aria-hidden="true"
              focusable="false"
              className="transition-transform duration-150 motion-reduce:transition-none"
            >
              <path
                d="M2 4.5 6 8.5 10 4.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </summary>

          <ul className="cert-body mt-4 grid gap-4 sm:grid-cols-2">
            {hidden.map((certification) => (
              <CredentialCard
                key={certification.id}
                certification={certification}
              />
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

function Badge({ certification }: { certification: Certification }) {
  if (certification.badge) {
    return (
      <Image
        src={certification.badge}
        alt={`${certification.name} badge`}
        width={64}
        height={64}
        className="h-16 w-16 shrink-0 object-contain"
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-rule bg-[color-mix(in_oklab,var(--accent)_7%,transparent)] font-mono text-xs font-medium leading-none tracking-[0.06em] text-accent transition-[border-color,rotate] duration-200 group-hover:-rotate-3 group-hover:border-accent"
    >
      {issuerMark(certification.issuer)}
    </span>
  );
}

function CredentialCard({ certification }: { certification: Certification }) {
  const { name, issuer, issued, expires, credentialUrl } = certification;

  return (
    <li className="reveal group flex flex-col border border-rule p-4 transition-[border-color,transform,translate] duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:border-accent sm:p-5">
      <div className="mb-5 flex items-start gap-4">
        <Badge certification={certification} />

        <div className="min-w-0 pt-0.5">
          <h3 className="text-[0.9375rem] font-medium leading-snug tracking-tight text-ink">
            {name}
          </h3>
          <p className="mt-1 text-sm text-ink-muted">{issuer}</p>
        </div>
      </div>

      <dl className="mt-auto grid grid-cols-2 gap-x-4 border-t border-rule pt-3 font-mono text-xs leading-relaxed">
        <div>
          <dt className="text-[0.625rem] uppercase tracking-[0.08em] text-ink-muted">
            Issued
          </dt>
          <dd className="text-ink">{issued}</dd>
        </div>
        <div>
          <dt className="text-[0.625rem] uppercase tracking-[0.08em] text-ink-muted">
            Expires
          </dt>
          <dd className={expires ? "text-ink" : "text-ink-muted"}>
            {expires ?? "No expiry"}
          </dd>
        </div>
      </dl>

      {credentialUrl ? (
        <a
          href={credentialUrl}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`Verify ${name} (opens the issuer's site in a new tab)`}
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 border border-rule px-3 py-2 text-[0.8125rem] text-ink transition-colors duration-150 hover:border-accent hover:bg-accent hover:text-canvas focus-visible:outline-offset-3"
        >
          Verify credential
          <IconArrowUpRight size={13} />
        </a>
      ) : (
        <button
          type="button"
          disabled
          title="The verification link has not been added yet."
          className="mt-4 inline-flex w-full cursor-not-allowed items-center justify-center gap-1.5 border border-dashed border-rule px-3 py-2 text-[0.8125rem] text-ink-muted/70"
        >
          Verify credential
        </button>
      )}
    </li>
  );
}
