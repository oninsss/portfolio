import type { ReactNode } from "react";

type IconProps = {
  size?: number;
  className?: string;
};

function Svg({
  size = 16,
  className,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={["inline-block shrink-0 align-[-0.15em]", className]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </svg>
  );
}

export function IconMail(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2" y="4.5" width="20" height="15" rx="2" />
      <path d="m2.6 6.2 9.4 6.4 9.4-6.4" />
    </Svg>
  );
}

export function IconLinkedIn(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M16.5 8.5a6 6 0 0 1 6 6V21h-4v-6a2 2 0 0 0-4 0v6h-4v-6a6 6 0 0 1 6-6z" />
      <rect x="2.5" y="9.5" width="4" height="11" />
      <circle cx="4.5" cy="4.5" r="2" />
    </Svg>
  );
}

export function IconGitHub(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 21.5c-4.5 1.4-4.5-2.3-6.3-2.8m12.6 5.3v-3.9a3.4 3.4 0 0 0-.9-2.6c3.1-.35 6.4-1.55 6.4-7A5.4 5.4 0 0 0 19.3 5 5.1 5.1 0 0 0 19.15 1S17.95.65 15.3 2.45a13.4 13.4 0 0 0-6.9 0C5.75.65 4.55 1 4.55 1A5.1 5.1 0 0 0 4.4 5a5.4 5.4 0 0 0-1.5 3.7c0 5.45 3.3 6.65 6.4 7a3.4 3.4 0 0 0-.9 2.6v3.9" />
    </Svg>
  );
}

export function IconArrowUpRight(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </Svg>
  );
}

export function IconMonitor(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </Svg>
  );
}

export function IconSun(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
    </Svg>
  );
}

export function IconMoon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20.5 13.2A8.5 8.5 0 1 1 10.8 3.5a6.8 6.8 0 0 0 9.7 9.7z" />
    </Svg>
  );
}

export function IconDownload(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 3.5v11m0 0-4-4m4 4 4-4" />
      <path d="M4.5 19.5h15" />
    </Svg>
  );
}

export function IconCap(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m2 9 10-5 10 5-10 5z" />
      <path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5" />
      <path d="M22 9v6" />
    </Svg>
  );
}

export function IconPin(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </Svg>
  );
}

export function IconPause(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 5v14M15 5v14" />
    </Svg>
  );
}

export function IconPlay(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 5.5v13l11-6.5z" />
    </Svg>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </Svg>
  );
}

export function IconArrowUp(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 19V5" />
      <path d="m6 11 6-6 6 6" />
    </Svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Svg>
  );
}

export function IconAlert(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5M12 16.5h.01" />
    </Svg>
  );
}
