import { SECTION_IDS } from "./guide-script";

const READ_LINE = 0.38;

export function readingSection(): string {
  const root = document.documentElement;
  if (window.scrollY + window.innerHeight >= root.scrollHeight - 4) {
    return SECTION_IDS[SECTION_IDS.length - 1];
  }
  const line = window.innerHeight * READ_LINE;
  let found = "home";
  for (const id of SECTION_IDS) {
    const section = document.getElementById(id);
    if (section && section.getBoundingClientRect().top <= line) found = id;
  }
  return found;
}
