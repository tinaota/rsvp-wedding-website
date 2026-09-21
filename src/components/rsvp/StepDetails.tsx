"use client";

import { useRef, useState } from "react";
import type { RsvpData } from "./types";
import { Button, Field, headingStyle, useStepHeading } from "./ui";

interface Props {
  data: RsvpData;
  onChange: (partial: Partial<RsvpData>) => void;
  onNext: () => void;
  focusOnMount: boolean;
}

type Errors = Partial<Record<"fullName" | "mobile" | "email", string>>;

/** Deliberately loose: international numbers, spaces and +61 forms all pass. */
const MOBILE_RE = /^[+()\d][\d\s()-]{6,}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const honeypotStyle: React.CSSProperties = {
  position: "absolute",
  left: "-9999px",
  width: 1,
  height: 1,
  overflow: "hidden",
};

function validate(data: RsvpData): Errors {
  const errors: Errors = {};
  if (!data.fullName.trim()) errors.fullName = "Please tell us your name.";
  if (!data.mobile.trim()) {
    errors.mobile = "Please add a mobile number so we can reach you.";
  } else if (!MOBILE_RE.test(data.mobile.trim())) {
    errors.mobile = "That doesn't look like a phone number.";
  }
  if (!data.email.trim()) {
    errors.email = "Please add an email address for your confirmation.";
  } else if (!EMAIL_RE.test(data.email.trim())) {
    errors.email = "Please check this email address.";
  }
  return errors;
}

export default function StepDetails({
  data,
  onChange,
  onNext,
  focusOnMount,
}: Props) {
  const headingRef = useStepHeading(focusOnMount);
  const nameRef = useRef<HTMLInputElement>(null);
  const mobileRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const [submitted, setSubmitted] = useState(false);

  // Derived, not stored: once a guest has tried to continue, the messages
  // update live as they fix each field.
  const errors: Errors = submitted ? validate(data) : {};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(data);
    setSubmitted(true);

    const firstInvalid = (["fullName", "mobile", "email"] as const).find(
      (k) => found[k],
    );
    if (firstInvalid) {
      const refs = { fullName: nameRef, mobile: mobileRef, email: emailRef };
      refs[firstInvalid].current?.focus();
      return;
    }
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h3
        ref={headingRef}
        tabIndex={-1}
        style={{ ...headingStyle, marginBottom: 28 }}
      >
        Your details
      </h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Field
          id="rsvp-name"
          label="Full name"
          required
          value={data.fullName}
          onChange={(v) => onChange({ fullName: v })}
          autoComplete="name"
          error={errors.fullName}
          inputRef={nameRef}
        />
        <Field
          id="rsvp-mobile"
          label="Mobile number"
          type="tel"
          inputMode="tel"
          required
          hint="So we can call about any dietary needs."
          value={data.mobile}
          onChange={(v) => onChange({ mobile: v })}
          autoComplete="tel"
          error={errors.mobile}
          inputRef={mobileRef}
        />
        <Field
          id="rsvp-email"
          label="Email address"
          type="email"
          inputMode="email"
          required
          hint="For your confirmation and a reminder closer to the day."
          value={data.email}
          onChange={(v) => onChange({ email: v })}
          autoComplete="email"
          error={errors.email}
          inputRef={emailRef}
        />
      </div>

      {/* Honeypot. Off-screen rather than display:none, which some bots skip.
          No label and a meaningless name: Chrome ignores autocomplete="off",
          so a field called "Website" gets autofilled for real guests. The
          data-* attributes tell LastPass and 1Password to leave it alone.
          A filled value only flags the reply server-side — it is never
          discarded, because a guest's autofill must not cost them their RSVP. */}
      <div aria-hidden="true" style={honeypotStyle}>
        <input
          id="rsvp-hp"
          name="hp"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore=""
          data-form-type="other"
          value={data.hp ?? ""}
          onChange={(e) => onChange({ hp: e.target.value })}
        />
      </div>

      <div style={{ marginTop: 32 }}>
        <Button type="submit" fullWidth>
          Next
        </Button>
      </div>
    </form>
  );
}
