"use server";

import { headers } from "next/headers";
import { z } from "zod";
import {
  contactSchema,
  isLookupLimited,
  isRateLimited,
  oneLine,
  parseSender,
} from "@/lib/contact/server";
import type { ContactState, ContactValues } from "@/lib/contact/limits";

const MAILTRAP_URL = "https://send.api.mailtrap.io/api/send";
const MAILTRAP_SANDBOX_URL = "https://sandbox.api.mailtrap.io/api/send";

const TOO_FAST_MS = 2_500;

const UNAVAILABLE =
  "The form isn't available right now. Please use the email options below.";

async function visitorKey(): Promise<string> {
  const requestHeaders = await headers();
  return (
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    requestHeaders.get("x-real-ip") ||
    "unknown"
  );
}

export async function getPublicEmail(): Promise<string | null> {
  if (isLookupLimited(await visitorKey())) return null;
  const parsed = z.email().safeParse(process.env.CONTACT_PUBLIC_EMAIL?.trim());
  return parsed.success ? parsed.data : null;
}

export async function sendMessage(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const text = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };

  if (text("company") !== "") return { status: "sent", name: "there" };
  const started = Number(text("startedAt"));
  if (
    Number.isFinite(started) &&
    started > 0 &&
    Date.now() - started < TOO_FAST_MS
  ) {
    return { status: "sent", name: "there" };
  }

  const values: ContactValues = {
    name: text("name"),
    email: text("email"),
    message: text("message"),
  };

  const parsed = contactSchema.safeParse(values);
  if (!parsed.success) {
    const flat = z.flattenError(parsed.error).fieldErrors;
    return {
      status: "error",
      values,
      fieldErrors: {
        name: flat.name?.[0],
        email: flat.email?.[0],
        message: flat.message?.[0],
      },
    };
  }

  if (isRateLimited(await visitorKey())) {
    return {
      status: "error",
      values,
      message:
        "That's a few messages in a short time. Please try again in a little while.",
    };
  }

  const { name, email, message } = parsed.data;
  const shownName = oneLine(name, 80);
  const apiKey = process.env.MAILTRAP_API_KEY?.trim();
  const inboxId = process.env.MAILTRAP_INBOX_ID?.trim();
  const to = z.email().safeParse(process.env.CONTACT_TO_EMAIL?.trim());
  // A sandbox inbox accepts any sender; live sending needs a verified domain.
  const from =
    parseSender(process.env.CONTACT_FROM_EMAIL) ??
    (inboxId ? { email: "portfolio@example.com", name: "Portfolio" } : null);

  const inboxInvalid = Boolean(inboxId) && !/^\d+$/.test(inboxId!);

  if (inboxId && !inboxInvalid && process.env.NODE_ENV === "production") {
    console.warn(
      "[contact] MAILTRAP_INBOX_ID is set in production; messages go to the sandbox inbox and are not delivered.",
    );
  }

  if (!apiKey || !to.success || !from || inboxInvalid) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[contact] MAILTRAP_API_KEY, CONTACT_TO_EMAIL, or CONTACT_FROM_EMAIL is missing or invalid; message not sent.",
      );
      return { status: "error", values, message: UNAVAILABLE };
    }
    const problems = [
      !apiKey && "MAILTRAP_API_KEY is not set",
      !to.success && "CONTACT_TO_EMAIL is missing or not a valid email",
      !from && "CONTACT_FROM_EMAIL is missing or invalid (required unless MAILTRAP_INBOX_ID is set)",
      inboxInvalid && "MAILTRAP_INBOX_ID must be numeric",
    ].filter(Boolean);
    console.info(
      `[contact] development, not sent (${problems.join("; ")}). From ${shownName} <${email}>:\n${message}`,
    );
    return { status: "sent", name: shownName };
  }

  try {
    const url = inboxId ? `${MAILTRAP_SANDBOX_URL}/${inboxId}` : MAILTRAP_URL;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [{ email: to.data }],
        reply_to: { email, name: shownName },
        category: "Portfolio contact form",
        subject: `Portfolio message from ${shownName}`,
        text: `From: ${shownName} <${email}>\n\n${message}\n\n(Sent from the contact form on the portfolio.)`,
      }),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      console.error(`[contact] the email service answered ${response.status}.`);
      return { status: "error", values, message: UNAVAILABLE };
    }
  } catch (error) {
    console.error(
      "[contact] could not reach the email service:",
      error instanceof Error ? error.name : "unknown error",
    );
    return { status: "error", values, message: UNAVAILABLE };
  }

  return { status: "sent", name: shownName };
}
