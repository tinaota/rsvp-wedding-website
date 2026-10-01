"use client";

import { useRef, useState } from "react";
import {
  AU_STATES,
  EMPTY_ADDRESS,
  postcodeState,
  type Address,
  type RsvpData,
  type Residence,
} from "./types";
import {
  Button,
  ChoiceField,
  Field,
  SelectField,
  headingStyle,
  useStepHeading,
} from "./ui";

interface Props {
  data: RsvpData;
  onChange: (partial: Partial<RsvpData>) => void;
  onNext: () => void;
  focusOnMount: boolean;
}

type FieldKey =
  | "fullName"
  | "mobile"
  | "email"
  | "residence"
  | "line1"
  | "suburb"
  | "state"
  | "postcode"
  | "country";

type Errors = Partial<Record<FieldKey, string>>;

/** The order focus moves through when several fields are wrong at once. */
const FIELD_ORDER: readonly FieldKey[] = [
  "fullName",
  "mobile",
  "email",
  "residence",
  "line1",
  "suburb",
  "state",
  "postcode",
  "country",
];

/** Deliberately loose: international numbers, spaces and +61 forms all pass. */
const MOBILE_RE = /^[+()\d][\d\s()-]{6,}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const POSTCODE_RE = /^\d{4}$/;

const RESIDENCE_OPTIONS = [
  { value: "australia", label: "In Australia" },
  { value: "overseas", label: "Overseas" },
] as const;

const STATE_OPTIONS = AU_STATES.map((s) => ({ value: s.code, label: s.code }));

const honeypotStyle: React.CSSProperties = {
  position: "absolute",
  left: "-9999px",
  width: 1,
  height: 1,
  overflow: "hidden",
};

/** Old drafts saved before the address existed have no `address` key. */
function addressOf(data: RsvpData): Address {
  return { ...EMPTY_ADDRESS, ...data.address };
}

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

  if (data.residence === "australia") {
    const a = addressOf(data);
    if (!a.line1.trim()) errors.line1 = "Please add your street address.";
    if (!a.suburb.trim()) errors.suburb = "Please add your suburb.";
    if (!a.state) errors.state = "Please choose your state.";
    if (!POSTCODE_RE.test(a.postcode.trim())) {
      errors.postcode = "Postcodes are 4 digits.";
    }
  } else if (data.residence === "overseas") {
    if (!(data.country ?? "").trim()) {
      errors.country = "Please add your country.";
    }
  } else {
    errors.residence = "Please let us know where you live.";
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
  const residenceRef = useRef<HTMLInputElement>(null);
  const line1Ref = useRef<HTMLInputElement>(null);
  const suburbRef = useRef<HTMLInputElement>(null);
  const stateRef = useRef<HTMLSelectElement>(null);
  const postcodeRef = useRef<HTMLInputElement>(null);
  const countryRef = useRef<HTMLInputElement>(null);
  const [submitted, setSubmitted] = useState(false);

  const address = addressOf(data);
  const setAddress = (partial: Partial<Address>) =>
    onChange({ address: { ...address, ...partial } });

  // Derived, not stored: once a guest has tried to continue, the messages
  // update live as they fix each field.
  const errors: Errors = submitted ? validate(data) : {};

  // A gentle nudge, never a block: real addresses exist outside the usual
  // ranges, and refusing one would be worse than a typo slipping through.
  const likelyState = postcodeState(address.postcode.trim());
  const postcodeNotice =
    address.state && likelyState && likelyState !== address.state
      ? `That postcode is usually in ${likelyState}, please double-check.`
      : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(data);
    setSubmitted(true);

    const firstInvalid = FIELD_ORDER.find((k) => found[k]);
    if (firstInvalid) {
      const refs = {
        fullName: nameRef,
        mobile: mobileRef,
        email: emailRef,
        residence: residenceRef,
        line1: line1Ref,
        suburb: suburbRef,
        state: stateRef,
        postcode: postcodeRef,
        country: countryRef,
      };
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

        <ChoiceField<Exclude<Residence, null>>
          id="residence"
          legend="Where do you live?"
          hint="So we can send you a card after the day."
          value={data.residence ?? null}
          options={RESIDENCE_OPTIONS}
          // Switching keeps what was typed in the other branch, so changing
          // your mind and switching back loses nothing. The server only
          // stores the branch that was chosen.
          onChange={(v) => onChange({ residence: v })}
          error={errors.residence}
          firstInputRef={residenceRef}
        />

        {data.residence === "australia" && (
          <div
            className="disclosure-enter"
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
          >
            <Field
              id="rsvp-address-line1"
              label="Street address"
              required
              value={address.line1}
              onChange={(v) => setAddress({ line1: v })}
              autoComplete="address-line1"
              error={errors.line1}
              inputRef={line1Ref}
            />
            <Field
              id="rsvp-address-line2"
              label="Unit or apartment"
              optional
              value={address.line2}
              onChange={(v) => setAddress({ line2: v })}
              autoComplete="address-line2"
            />
            <Field
              id="rsvp-suburb"
              label="Suburb"
              required
              value={address.suburb}
              onChange={(v) => setAddress({ suburb: v })}
              autoComplete="address-level2"
              error={errors.suburb}
              inputRef={suburbRef}
            />
            <div
              style={{
                display: "grid",
                // Side by side where there's room, stacked on a phone: at
                // half a phone's width "Postcode (Required)" wraps to two
                // lines and drops its box below State's.
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 20,
                alignItems: "start",
              }}
            >
              <SelectField
                id="rsvp-state"
                label="State"
                required
                placeholder="Choose"
                options={STATE_OPTIONS}
                value={address.state}
                onChange={(v) => setAddress({ state: v })}
                autoComplete="address-level1"
                error={errors.state}
                selectRef={stateRef}
              />
              <Field
                id="rsvp-postcode"
                label="Postcode"
                required
                inputMode="numeric"
                maxLength={4}
                value={address.postcode}
                // Digits only, so a stray space or letter never reaches the
                // 4-digit check and shows a confusing error.
                onChange={(v) =>
                  setAddress({ postcode: v.replace(/\D/g, "").slice(0, 4) })
                }
                autoComplete="postal-code"
                error={errors.postcode}
                notice={postcodeNotice}
                inputRef={postcodeRef}
              />
            </div>
          </div>
        )}

        {data.residence === "overseas" && (
          <div className="disclosure-enter">
            <Field
              id="rsvp-country"
              label="Country"
              required
              value={data.country ?? ""}
              onChange={(v) => onChange({ country: v })}
              autoComplete="country-name"
              error={errors.country}
              inputRef={countryRef}
            />
          </div>
        )}
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
