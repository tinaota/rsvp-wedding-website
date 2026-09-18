"use client";

import { useRef, useState } from "react";
import type { Attending, RsvpData } from "./types";
import { Button, ErrorText, StepNav, headingStyle, useStepHeading } from "./ui";

interface Props {
  data: RsvpData;
  onChange: (partial: Partial<RsvpData>) => void;
  onNext: () => void;
  onBack: () => void;
  focusOnMount: boolean;
}

const CHOICES: {
  value: Exclude<Attending, null>;
  label: string;
  sub: string;
}[] = [
  {
    value: "accepts",
    label: "Joyfully accepts",
    sub: "We'll be there to celebrate with you.",
  },
  {
    value: "declines",
    label: "Regretfully declines",
    sub: "We wish you a beautiful evening.",
  },
];

export default function StepReply({
  data,
  onChange,
  onNext,
  onBack,
  focusOnMount,
}: Props) {
  const headingRef = useStepHeading(focusOnMount);
  const firstChoiceRef = useRef<HTMLInputElement>(null);
  const [attempted, setAttempted] = useState(false);

  // Derived: the prompt shows only while a choice is still missing.
  const error =
    attempted && !data.attending
      ? "Please choose one so we know whether to save you a seat."
      : null;

  const handleNext = () => {
    if (!data.attending) {
      setAttempted(true);
      firstChoiceRef.current?.focus();
      return;
    }
    onNext();
  };

  return (
    <div>
      <h3
        ref={headingRef}
        tabIndex={-1}
        style={{ ...headingStyle, marginBottom: 8 }}
      >
        Your reply
      </h3>
      <p
        style={{
          fontSize: "var(--text-small)",
          color: "var(--color-ink-muted)",
          marginBottom: 28,
        }}
      >
        Will you be joining us?
      </p>

      <fieldset
        style={{ border: "none", padding: 0, margin: 0 }}
        aria-describedby={error ? "reply-error" : undefined}
      >
        <legend className="sr-only">Will you be joining us?</legend>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {CHOICES.map(({ value, label, sub }, i) => {
            const selected = data.attending === value;
            return (
              <label
                key={value}
                htmlFor={`reply-${value}`}
                className={selected ? "on-burgundy" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  minHeight: 96,
                  padding: "24px 28px",
                  cursor: "pointer",
                  border: `1.5px solid ${
                    selected
                      ? "var(--color-burgundy)"
                      : error
                        ? "var(--color-error)"
                        : "var(--color-border-strong)"
                  }`,
                  backgroundColor: selected
                    ? "var(--color-burgundy)"
                    : "var(--color-card)",
                  color: selected
                    ? "var(--color-burgundy-ink)"
                    : "var(--color-ink)",
                  transition:
                    "border-color var(--dur-fast) var(--ease-standard), background-color var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard)",
                  borderRadius: "var(--radius-sm, 4px)",
                }}
              >
                <input
                  ref={i === 0 ? firstChoiceRef : undefined}
                  type="radio"
                  id={`reply-${value}`}
                  name="attending"
                  value={value}
                  checked={selected}
                  onChange={() => onChange({ attending: value })}
                  style={{
                    width: 20,
                    height: 20,
                    accentColor: selected
                      ? "var(--color-card)"
                      : "var(--color-burgundy)",
                    flexShrink: 0,
                    cursor: "pointer",
                  }}
                />
                <span>
                  <span
                    style={{
                      display: "block",
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--text-h3)",
                      fontWeight: 600,
                      lineHeight: 1.2,
                    }}
                  >
                    {label}
                    {selected && (
                      <span aria-hidden="true" style={{ marginLeft: 10 }}>
                        ✓
                      </span>
                    )}
                  </span>
                  <span
                    style={{
                      display: "block",
                      fontSize: "var(--text-small)",
                      marginTop: 4,
                      opacity: 0.8,
                    }}
                  >
                    {sub}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        {error && <ErrorText id="reply-error">{error}</ErrorText>}
      </fieldset>

      <StepNav onBack={onBack}>
        <Button onClick={handleNext} flex={2}>
          Next
        </Button>
      </StepNav>
    </div>
  );
}
