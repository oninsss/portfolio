import { getPublicEmail } from "@/app/actions";

let pending: Promise<string | null> | null = null;

export function loadPublicEmail(): Promise<string | null> {
  pending ??= getPublicEmail().catch(() => {
    pending = null;
    return null;
  });
  return pending;
}
