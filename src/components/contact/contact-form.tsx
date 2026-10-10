"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";
import { sendMessage } from "@/app/actions";
import { LIMITS, type ContactField, type ContactState } from "@/lib/contact/limits";
import { IconAlert, IconArrowRight, IconCheck } from "@/components/shared/icons";

const FIELD =
  "w-full border border-rule bg-transparent px-3 py-2.5 text-sm leading-relaxed text-ink outline-offset-2 transition-[border-color,background-color] duration-200 placeholder:text-ink-muted/60 hover:border-ink-muted/50 focus:border-accent focus:bg-[color-mix(in_oklab,var(--accent)_4%,transparent)] aria-[invalid=true]:border-ink";

const LABEL =
  "mb-1.5 block font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-ink-muted";

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className={LABEL}>
          {label}
        </label>
        {hint}
      </div>
      {children}
      {error ? (
        <p
          id={`${id}-error`}
          className="mt-1.5 flex items-center gap-1.5 text-xs text-ink"
        >
          <IconAlert size={13} className="shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="group inline-flex cursor-pointer items-center gap-2 border border-accent px-4 py-2.5 text-sm text-accent transition-[background-color,color,opacity] duration-200 hover:bg-accent hover:text-canvas disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "Sending…" : "Send message"}
      <IconArrowRight
        size={15}
        className="transition-transform duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover:translate-x-0.5 group-disabled:translate-x-1"
      />
    </button>
  );
}

const IDLE: ContactState = { status: "idle" };

function Form({ onAgain }: { onAgain: () => void }) {
  const [state, action] = useActionState(sendMessage, IDLE);
  const formRef = useRef<HTMLFormElement>(null);
  const startedField = useRef<HTMLInputElement>(null);
  const appearedAt = useRef(0);
  const [length, setLength] = useState(0);

  useEffect(() => {
    if (appearedAt.current === 0) appearedAt.current = Date.now();
    if (startedField.current) {
      startedField.current.value = String(appearedAt.current);
    }
  });

  useEffect(() => {
    if (state.status !== "error") return;
    formRef.current
      ?.querySelector<HTMLElement>('[aria-invalid="true"]')
      ?.focus();
  }, [state]);

  if (state.status === "sent") {
    return (
      <div
        role="status"
        className="max-w-xl border border-accent/40 bg-[color-mix(in_oklab,var(--accent)_6%,transparent)] p-5 sm:p-6"
      >
        <p className="flex items-center gap-2 text-base font-medium text-ink">
          <span className="flex h-6 w-6 items-center justify-center bg-accent text-canvas">
            <IconCheck size={14} />
          </span>
          Message sent.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          Thank you, {state.name}. I&apos;ll reply to the address you gave.
        </p>
        <button
          type="button"
          onClick={onAgain}
          className="mt-4 cursor-pointer text-sm text-accent underline decoration-transparent underline-offset-4 transition-[text-decoration-color] duration-150 hover:decoration-accent"
        >
          Send another message
        </button>
      </div>
    );
  }

  const values = state.status === "error" ? state.values : undefined;
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const invalid = (field: ContactField) => (errors[field] ? true : undefined);

  return (
    <form
      ref={formRef}
      action={action}
      noValidate
      className="max-w-xl space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="contact-name" label="Name" error={errors.name}>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            maxLength={LIMITS.name}
            autoComplete="name"
            defaultValue={values?.name}
            aria-invalid={invalid("name")}
            aria-describedby={errors.name ? "contact-name-error" : undefined}
            className={FIELD}
          />
        </Field>

        <Field id="contact-email" label="Your email" error={errors.email}>
          <input
            id="contact-email"
            name="email"
            type="email"
            inputMode="email"
            required
            maxLength={LIMITS.email}
            autoComplete="email"
            defaultValue={values?.email}
            aria-invalid={invalid("email")}
            aria-describedby={errors.email ? "contact-email-error" : undefined}
            className={FIELD}
          />
        </Field>
      </div>

      <Field
        id="contact-message"
        label="Message"
        error={errors.message}
        hint={
          <span
            aria-hidden="true"
            className={[
              "font-mono text-[0.6875rem] tabular-nums transition-colors duration-200",
              length > LIMITS.message * 0.9 ? "text-ink" : "text-ink-muted/70",
            ].join(" ")}
          >
            {length}/{LIMITS.message}
          </span>
        }
      >
        <textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          maxLength={LIMITS.message}
          defaultValue={values?.message}
          onInput={(event) => setLength(event.currentTarget.value.length)}
          aria-invalid={invalid("message")}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          className={`${FIELD} resize-y`}
        />
      </Field>

      <div
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
      >
        <label>
          Company
          <input name="company" type="text" tabIndex={-1} autoComplete="off" />
        </label>
        <input ref={startedField} name="startedAt" type="hidden" />
      </div>

      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="flex items-start gap-2 border border-ink/40 p-3 text-sm text-ink"
        >
          <IconAlert size={16} className="mt-0.5 shrink-0" />
          {state.message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <SubmitButton />
        <p className="text-xs leading-relaxed text-ink-muted">
          I&apos;ll reply to the address you give here.
        </p>
      </div>
    </form>
  );
}

export function ContactForm() {
  const [round, setRound] = useState(0);
  return <Form key={round} onAgain={() => setRound((value) => value + 1)} />;
}
