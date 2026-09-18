"use client";

import type { RsvpData } from "./types";
import {
  Button,
  StepNav,
  headingStyle,
  inputStyle,
  labelStyle,
  useStepHeading,
} from "./ui";

interface Props {
  data: RsvpData;
  onChange: (partial: Partial<RsvpData>) => void;
  onNext: () => void;
  onBack: () => void;
  focusOnMount: boolean;
}

export default function StepBlessing({
  data,
  onChange,
  onNext,
  onBack,
  focusOnMount,
}: Props) {
  const headingRef = useStepHeading(focusOnMount);

  return (
    <div>
      <h3
        ref={headingRef}
        tabIndex={-1}
        style={{ ...headingStyle, marginBottom: 8 }}
      >
        A blessing
      </h3>
      <p
        style={{
          fontSize: "var(--text-small)",
          color: "var(--color-ink-muted)",
          marginBottom: 28,
        }}
      >
        We&rsquo;re sorry you won&rsquo;t be able to join us. Would you like to
        leave a message for Herald &amp; Yeukai?
      </p>

      <div>
        <label htmlFor="rsvp-blessing" style={labelStyle}>
          Your message (optional)
        </label>
        <textarea
          id="rsvp-blessing"
          rows={5}
          value={data.blessing}
          onChange={(e) => onChange({ blessing: e.target.value })}
          placeholder="We wish you every joy on this special evening…"
          style={{
            ...inputStyle(),
            height: "auto",
            padding: "14px 16px",
            resize: "vertical",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--color-burgundy)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border-strong)";
          }}
        />
      </div>

      <StepNav onBack={onBack}>
        <Button onClick={onNext} flex={2}>
          Review reply
        </Button>
      </StepNav>
    </div>
  );
}
