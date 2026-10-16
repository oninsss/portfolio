"use client";

import { useRef, useState, type ReactNode } from "react";
import { loadPublicEmail } from "./public-email";

const SUBJECT = "Hello from your portfolio";

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
  const mailto = (address: string) =>
    `mailto:${address}?subject=${encodeURIComponent(SUBJECT)}`;
  const arm = () => {
    void loadPublicEmail().then((address) => {
      if (address) setHref(mailto(address));
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
          if (address) window.location.href = mailto(address);
          else window.location.hash = "contact";
        });
      }}
      className={className}
    >
      {children}
    </a>
  );
}

const LABELS = {
  idle: "Copy address",
  copied: "Copied",
  failed: "Couldn’t copy",
  unavailable: "Unavailable",
} as const;

export function CopyEmail() {
  const [state, setState] = useState<keyof typeof LABELS>("idle");
  const timer = useRef<number>(0);

  const copy = async () => {
    window.clearTimeout(timer.current);
    const address = await loadPublicEmail();
    if (!address) {
      setState("unavailable");
    } else {
      try {
        await navigator.clipboard.writeText(address);
        setState("copied");
      } catch {
        setState("failed");
      }
    }
    timer.current = window.setTimeout(() => setState("idle"), 2000);
  };

  return (
    <button
      type="button"
      onClick={copy}
      onPointerEnter={() => void loadPublicEmail()}
      onFocus={() => void loadPublicEmail()}
      onTouchStart={() => void loadPublicEmail()}
      aria-live="polite"
      className="inline-flex shrink-0 cursor-pointer items-center border border-rule px-3 py-1.5 text-[0.8125rem] text-ink-muted transition-[color,border-color] duration-150 hover:border-accent hover:text-accent focus-visible:outline-offset-3"
    >
      {LABELS[state]}
    </button>
  );
}
