export const LIMITS = {
  name: 80,
  email: 254,
  messageMin: 10,
  message: 2000,
} as const;

export type ContactField = "name" | "email" | "message";

export type ContactValues = Record<ContactField, string>;

export type ContactState =
  | { status: "idle" }
  | { status: "sent"; name: string }
  | {
      status: "error";
      message?: string;
      fieldErrors?: Partial<Record<ContactField, string>>;
      values: ContactValues;
    };
