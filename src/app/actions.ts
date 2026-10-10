"use server";

import { headers } from "next/headers";
import { z } from "zod";
import {
  contactSchema,
  isLookupLimited,
  isRateLimited,
  oneLine,
} from "@/lib/contact/server";
import type { ContactState, ContactValues } from "@/lib/contact/limits";

const RESEND_URL = "https://api.resend.com/emails";

const TOO_FAST_MS = 2_500;

const UNAVAILABLE =
  "The form isn't available right now. Please use the email options above.";

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
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from =
    process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>";

  if (!apiKey || !to) {
    if (process.env.NODE_ENV === "production") {
      console.error(
        "[contact] RESEND_API_KEY or CONTACT_TO_EMAIL is not set; message not sent.",
      );
      return { status: "error", values, message: UNAVAILABLE };
    }
    console.info(
      `[contact] development, not sent. From ${shownName} <${email}>:\n${message}`,
    );
    return { status: "sent", name: shownName };
  }

  try {
    const response = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
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
