import type { SiteLink } from "./types";
import { profile } from "./profile";

function realUrl(value: string): string | undefined {
  return value.startsWith("[") ? undefined : value;
}

function displayUrl(value: string): string {
  if (value.startsWith("[")) return value;
  const bare = value.replace(/^https?:\/\//, "");
  try {
    return decodeURIComponent(bare);
  } catch {
    return bare;
  }
}

export const heroLinks: SiteLink[] = [
  { label: "GitHub", href: realUrl(profile.github) },
  { label: "LinkedIn", href: realUrl(profile.linkedin) },
  { label: "Email", email: true },
];

export const contactLinks: SiteLink[] = [
  {
    label: "Email",
    email: true,
    note: "Let's talk",
  },
  {
    label: "LinkedIn",
    value: displayUrl(profile.linkedin),
    href: realUrl(profile.linkedin),
    note: "Connect with me",
  },
  {
    label: "GitHub",
    value: displayUrl(profile.github),
    href: realUrl(profile.github),
    note: "See what I build",
  },
];
