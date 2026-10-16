import { getPublicEmail } from "@/app/actions";

let pending: Promise<string | null> | null = null;

// Only a found address is cached, so a failed or rate-limited lookup can retry.
export function loadPublicEmail(): Promise<string | null> {
  pending ??= getPublicEmail()
    .then((address) => {
      if (!address) pending = null;
      return address;
    })
    .catch(() => {
      pending = null;
      return null;
    });
  return pending;
}
