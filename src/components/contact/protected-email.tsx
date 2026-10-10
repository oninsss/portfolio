"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { loadPublicEmail } from "./public-email";

export function MailtoLink({
  children,
  className,
  "aria-label": ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}) {
  const [href, setHref] = useState("#contact");
  const arm = () => {
    void loadPublicEmail().then((address) => {
      if (address) setHref(`mailto:${address}`);
    });
  };

  return (
    <a
      href={href}
      aria-label={ariaLabel}
      onPointerEnter={arm}
      onFocus={arm}
      onTouchStart={arm}
      onClick={(event) => {
        if (href.startsWith("mailto:")) return;
        event.preventDefault();
        void loadPublicEmail().then((address) => {
          if (address) window.location.href = `mailto:${address}`;
          else window.location.hash = "contact";
        });
      }}
      className={className}
    >
      {children}
    </a>
  );
}

const SUBJECT = "Hello from your portfolio";

const WAYS: {
  label: string;
  hint: string;
  url: ((to: string) => string) | null;
  here?: boolean;
}[] = [
  {
    label: "Gmail",
    hint: "opens a new message",
    url: (to) =>
      `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(SUBJECT)}`,
  },
  {
    label: "Outlook",
    hint: "opens a new message",
    url: (to) =>
      `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(SUBJECT)}`,
  },
  {
    label: "Mail app",
    hint: "your default",
    url: (to) => `mailto:${to}?subject=${encodeURIComponent(SUBJECT)}`,
    here: true,
  },
  { label: "Copy address", hint: "any other app", url: null },
];

export function EmailMenu() {
  const ref = useRef<HTMLDetailsElement>(null);
  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const details = ref.current;
    if (!details) return;
    const onPointerDown = (event: PointerEvent) => {
      if (details.open && !details.contains(event.target as Node)) {
        details.open = false;
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && details.open) {
        details.open = false;
        details.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const choose = async (way: (typeof WAYS)[number]) => {
    if (ref.current) ref.current.open = false;
    const to = await loadPublicEmail();
    if (!to) {
      setAvailable(false);
      if (ref.current) ref.current.open = true;
      return;
    }

    if (way.url === null) {
      try {
        await navigator.clipboard.writeText(to);
        setCopied("copied");
      } catch {
        setCopied("failed");
      }
      window.setTimeout(() => setCopied("idle"), 2000);
      return;
    }

    const target = way.url(to);
    if (way.here) window.location.assign(target);
    else window.open(target, "_blank", "noopener,noreferrer");
  };

  return (
    <details
      ref={ref}
      className="relative shrink-0"
      onToggle={(event) => {
        if (event.currentTarget.open) {
          void loadPublicEmail().then((address) => setAvailable(Boolean(address)));
        }
      }}
    >
      <summary
        aria-live="polite"
        onPointerEnter={() => void loadPublicEmail()}
        onFocus={() => void loadPublicEmail()}
        onTouchStart={() => void loadPublicEmail()}
        className="inline-flex cursor-pointer list-none items-center gap-1.5 border border-rule px-3 py-1.5 text-[0.8125rem] text-ink-muted transition-[color,border-color] duration-150 hover:border-accent hover:text-accent focus-visible:outline-offset-3 [&::-webkit-details-marker]:hidden"
      >
        <span>
          {copied === "copied"
            ? "Copied"
            : copied === "failed"
              ? "Couldn’t copy"
              : "Open in…"}
        </span>
        <svg
          viewBox="0 0 12 12"
          width="11"
          height="11"
          aria-hidden="true"
          focusable="false"
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

      <ul className="cert-body absolute right-0 z-20 mt-1 w-64 border border-rule bg-canvas p-1">
        {!available ? (
          <li className="px-3 py-2 text-[0.8125rem] leading-relaxed text-ink-muted">
            Email isn&rsquo;t available right now. Try LinkedIn.
          </li>
        ) : null}
        {available ? WAYS.map((way) => (
          <li key={way.label}>
            <button
              type="button"
              onClick={() => choose(way)}
              className="flex w-full cursor-pointer items-baseline justify-between gap-3 whitespace-nowrap px-3 py-2 text-left text-[0.8125rem] text-ink transition-colors duration-150 hover:bg-[color-mix(in_oklab,var(--accent)_8%,transparent)] hover:text-accent"
            >
              <span>{way.label}</span>
              <span className="text-[0.6875rem] text-ink-muted">{way.hint}</span>
            </button>
          </li>
        )) : null}
      </ul>
    </details>
  );
}
