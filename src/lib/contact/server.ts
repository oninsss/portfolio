import { z } from "zod";
import { LIMITS } from "./limits";

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please tell me your name.")
    .max(LIMITS.name, "That name is a little long."),
  email: z
    .string()
    .trim()
    .max(LIMITS.email, "That address is too long.")
    .pipe(z.email("That doesn't look like an email address.")),
  message: z
    .string()
    .trim()
    .min(LIMITS.messageMin, "A little more, please: at least a sentence.")
    .max(
      LIMITS.message,
      `Please keep it under ${LIMITS.message.toLocaleString("en-US")} characters.`,
    ),
});

export function oneLine(value: string, max: number): string {
  return Array.from(value, (character) => {
    const code = character.codePointAt(0) ?? 0;
    const control = code <= 0x1f || code === 0x7f || code === 0x2028 || code === 0x2029;
    return control ? " " : character;
  })
    .join("")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

const WINDOW_MS = 10 * 60_000;
const MAX_TRACKED = 5_000;

function createLimiter(max: number) {
  const recent = new Map<string, number[]>();

  return (key: string, now: number = Date.now()): boolean => {
    const hits = (recent.get(key) ?? []).filter((at) => now - at < WINDOW_MS);
    const limited = hits.length >= max;
    if (!limited) hits.push(now);
    recent.set(key, hits);

    if (recent.size > MAX_TRACKED) {
      for (const [who, times] of recent) {
        if (times.every((at) => now - at >= WINDOW_MS)) recent.delete(who);
      }
    }
    return limited;
  };
}

export const isRateLimited = createLimiter(3);
export const isLookupLimited = createLimiter(30);
