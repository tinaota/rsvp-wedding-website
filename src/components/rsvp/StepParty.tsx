"use client";

import { useState } from "react";
import {
  ALLERGY_OPTIONS,
  DIET_OPTIONS,
  EMPTY_DIETARY,
  type Child,
  type ExtraAdult,
  type Logistics,
  type RsvpData,
  type YesNo,
} from "./types";
import {
  Button,
  StepNav,
  headingStyle,
  hintStyle,
  inputStyle,
  labelStyle,
  useStepHeading,
} from "./ui";

const MAX_EXTRA_ADULTS = 4;
const MAX_CHILDREN = 5;

interface Props {
  data: RsvpData;
  firstName: string;
  onChange: (partial: Partial<RsvpData>) => void;
  onNext: () => void;
  onBack: () => void;
  focusOnMount: boolean;
}

interface StepperProps {
  label: string;
  /** Singular noun for the button labels, e.g. "an adult". */
  one: string;
  value: number;
  min: number;
  max: number;
  hint?: string;
  ariaLive: string;
  onIncrement: () => void;
  onDecrement: () => void;
}

function Stepper({
  label,
  one,
  value,
  min,
  max,
  hint,
  ariaLive,
  onIncrement,
  onDecrement,
}: StepperProps) {
  const [dir, setDir] = useState<"up" | "down" | null>(null);

  const roundButton = (disabled: boolean) => ({
    width: 48,
    height: 48,
    borderRadius: "50%",
    border: "1.5px solid var(--color-border-strong)",
    backgroundColor: "transparent",
    color: "var(--color-burgundy)",
    cursor: disabled ? ("not-allowed" as const) : ("pointer" as const),
    fontSize: "1.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: disabled ? 0.38 : 1,
    transition: "opacity var(--dur-fast) var(--ease-standard)",
    flexShrink: 0,
    lineHeight: 1,
  });

  return (
    <div style={{ marginBottom: 4 }}>
      <p style={{ ...labelStyle, marginBottom: 12 }}>{label}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          type="button"
          onClick={() => {
            setDir("down");
            onDecrement();
          }}
          disabled={value <= min}
          aria-label={`Remove ${one}`}
          className="btn-press"
          style={roundButton(value <= min)}
        >
          −
        </button>
        <span
          // Re-keyed on every change so the numeral animation replays.
          key={`${value}-${dir}`}
          className={
            dir === "up" ? "numeral-up" : dir === "down" ? "numeral-down" : ""
          }
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-h2)",
            fontWeight: 600,
            color: "var(--color-ink)",
            minWidth: 40,
            textAlign: "center",
          }}
        >
          {value}
        </span>
        <button
          type="button"
          onClick={() => {
            setDir("up");
            onIncrement();
          }}
          disabled={value >= max}
          aria-label={`Add ${one}`}
          className="btn-press"
          style={roundButton(value >= max)}
        >
          +
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {ariaLive}
      </p>
      {hint && (
        <p
          style={{
            fontSize: "var(--text-eyebrow)",
            color: "var(--color-ink-muted)",
            marginTop: 8,
          }}
        >
          {hint}
        </p>
      )}
    </div>
  );
}

function YesNoField({
  id,
  legend,
  value,
  onChange,
}: {
  id: string;
  legend: string;
  value: YesNo;
  onChange: (value: boolean) => void;
}) {
  return (
    <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
      <legend style={{ ...labelStyle, marginBottom: 12 }}>{legend}</legend>
      <div style={{ display: "flex", gap: 12 }}>
        {[true, false].map((opt) => {
          const selected = value === opt;
          const label = opt ? "Yes" : "No";
          const radioId = `${id}-${label.toLowerCase()}`;
          return (
            <label
              key={label}
              htmlFor={radioId}
              className={selected ? "on-burgundy" : undefined}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                height: 52,
                border: `1.5px solid ${
                  selected
                    ? "var(--color-burgundy)"
                    : "var(--color-border-strong)"
                }`,
                backgroundColor: selected
                  ? "var(--color-burgundy)"
                  : "transparent",
                color: selected
                  ? "var(--color-burgundy-ink)"
                  : "var(--color-ink)",
                cursor: "pointer",
                borderRadius: "var(--radius-sm, 4px)",
                fontFamily: "var(--font-body)",
                fontSize: "var(--text-small)",
                transition:
                  "background-color var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard)",
              }}
            >
              <input
                type="radio"
                id={radioId}
                name={id}
                value={label}
                checked={selected}
                onChange={() => onChange(opt)}
                style={{
                  width: 16,
                  height: 16,
                  accentColor: selected
                    ? "var(--color-burgundy-ink)"
                    : "var(--color-burgundy)",
                  cursor: "pointer",
                }}
              />
              {label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

/**
 * A tick-box group that edits a list of strings. Used for both allergies and
 * dietary requirements, which behave identically.
 */
function CheckList({
  legend,
  name,
  options,
  selected,
  onToggle,
}: {
  legend: string;
  name: string;
  options: readonly string[];
  selected: string[];
  onToggle: (next: string[]) => void;
}) {
  return (
    <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
      <legend style={{ ...labelStyle, marginBottom: 10 }}>{legend}</legend>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "2px 16px",
        }}
      >
        {options.map((option) => {
          const id = `${name}-${option.toLowerCase().replace(/\s+/g, "-")}`;
          const checked = selected.includes(option);
          return (
            <label
              key={option}
              htmlFor={id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                minHeight: 44,
                cursor: "pointer",
                fontSize: "var(--text-small)",
                color: "var(--color-ink)",
              }}
            >
              <input
                type="checkbox"
                id={id}
                checked={checked}
                onChange={(e) =>
                  onToggle(
                    e.target.checked
                      ? [...selected, option]
                      : selected.filter((v) => v !== option),
                  )
                }
                style={{
                  accentColor: "var(--color-burgundy)",
                  width: 18,
                  height: 18,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              />
              {option}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

const LOGISTICS_OPTIONS: { key: keyof Logistics; id: string; label: string }[] =
  [
    {
      key: "overnight",
      id: "chk-overnight",
      label: "We're staying overnight at The Langham",
    },
    {
      key: "parking",
      id: "chk-parking",
      label: "We'll need parking validated",
    },
    {
      key: "transport",
      id: "chk-transport",
      label: "We'd like help with transport",
    },
  ];

export default function StepParty({
  data,
  firstName,
  onChange,
  onNext,
  onBack,
  focusOnMount,
}: Props) {
  const headingRef = useStepHeading(focusOnMount);

  const setExtraAdultsCount = (n: number) => {
    const count = Math.max(0, Math.min(MAX_EXTRA_ADULTS, n));
    const adults: ExtraAdult[] = [...data.extraAdults];
    while (adults.length < count) adults.push({ name: "", tbc: false });
    onChange({ extraAdults: adults.slice(0, count) });
  };

  const setChildrenCount = (n: number) => {
    const count = Math.max(0, Math.min(MAX_CHILDREN, n));
    const children: Child[] = [...data.children];
    while (children.length < count) children.push({ name: "", age: "" });
    onChange({ children: children.slice(0, count) });
  };

  const dietaryCount =
    data.dietary.allergies.length +
    data.dietary.diets.length +
    (data.dietary.other.trim() ? 1 : 0);

  const totalAdults = 1 + data.extraAdults.length;
  const totalChildren = data.children.length;
  const partySummary = `Your party: ${totalAdults} adult${totalAdults !== 1 ? "s" : ""}${
    totalChildren > 0
      ? `, ${totalChildren} ${totalChildren === 1 ? "child" : "children"}`
      : ""
  }.`;

  const focusBorder = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    e.currentTarget.style.borderColor = "var(--color-burgundy)";
  };
  const blurBorder = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    e.currentTarget.style.borderColor = "var(--color-border-strong)";
  };

  return (
    <div>
      <h3
        ref={headingRef}
        tabIndex={-1}
        style={{ ...headingStyle, marginBottom: 8 }}
      >
        Your party
      </h3>
      <p
        style={{
          fontSize: "var(--text-small)",
          color: "var(--color-ink-muted)",
          marginBottom: 28,
        }}
      >
        Please include everyone who&rsquo;ll be attending with you.
      </p>

      <p
        style={{
          padding: "12px 16px",
          backgroundColor: "var(--color-background)",
          border: "1px solid var(--color-border-hairline)",
          borderRadius: "var(--radius-sm, 4px)",
          marginBottom: 28,
          fontSize: "var(--text-small)",
          color: "var(--color-ink-muted)",
        }}
      >
        Your invitation is for the names on it. If you&rsquo;re unsure
        who&rsquo;s included, please call us.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <div>
          <p style={labelStyle}>Attending as primary guest</p>
          <p
            style={{
              fontSize: "var(--text-body)",
              color: "var(--color-ink)",
              padding: "12px 16px",
              backgroundColor: "var(--color-background)",
              borderRadius: "var(--radius-sm, 4px)",
            }}
          >
            {firstName}
          </p>
        </div>

        <div>
          <Stepper
            label="Additional adults"
            one="an adult"
            value={data.extraAdults.length}
            min={0}
            max={MAX_EXTRA_ADULTS}
            hint={`Up to ${MAX_EXTRA_ADULTS} additional adults.`}
            ariaLive={`${data.extraAdults.length} additional adult${
              data.extraAdults.length !== 1 ? "s" : ""
            }`}
            onIncrement={() => setExtraAdultsCount(data.extraAdults.length + 1)}
            onDecrement={() => setExtraAdultsCount(data.extraAdults.length - 1)}
          />

          {data.extraAdults.length > 0 && (
            <div
              style={{
                marginTop: 16,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {data.extraAdults.map((adult, i) => (
                <div key={i}>
                  <label htmlFor={`adult-name-${i}`} style={labelStyle}>
                    Adult {i + 2}&rsquo;s name
                  </label>
                  <input
                    id={`adult-name-${i}`}
                    type="text"
                    value={adult.name}
                    onChange={(e) => {
                      const updated = [...data.extraAdults];
                      updated[i] = { ...updated[i], name: e.target.value };
                      onChange({ extraAdults: updated });
                    }}
                    disabled={adult.tbc}
                    placeholder="Full name"
                    autoComplete="off"
                    style={{ ...inputStyle(), opacity: adult.tbc ? 0.5 : 1 }}
                    onFocus={focusBorder}
                    onBlur={blurBorder}
                  />
                  <label
                    htmlFor={`adult-tbc-${i}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 8,
                      minHeight: 44,
                      cursor: "pointer",
                      fontSize: "var(--text-small)",
                      color: "var(--color-ink-muted)",
                    }}
                  >
                    <input
                      id={`adult-tbc-${i}`}
                      type="checkbox"
                      checked={adult.tbc}
                      onChange={(e) => {
                        const updated = [...data.extraAdults];
                        updated[i] = { ...updated[i], tbc: e.target.checked };
                        onChange({ extraAdults: updated });
                      }}
                      style={{
                        accentColor: "var(--color-burgundy)",
                        width: 16,
                        height: 16,
                        cursor: "pointer",
                      }}
                    />
                    I&rsquo;ll confirm this name later (&ldquo;and guest&rdquo;)
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <Stepper
            label="Children attending"
            one="a child"
            value={data.children.length}
            min={0}
            max={MAX_CHILDREN}
            hint="Ages help us with seating and catering."
            ariaLive={`${data.children.length} ${
              data.children.length === 1 ? "child" : "children"
            }`}
            onIncrement={() => setChildrenCount(data.children.length + 1)}
            onDecrement={() => setChildrenCount(data.children.length - 1)}
          />

          {data.children.length > 0 && (
            <div
              style={{
                marginTop: 16,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {data.children.map((child, i) => (
                <div
                  key={i}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: 12,
                    alignItems: "end",
                  }}
                >
                  <div>
                    <label htmlFor={`child-name-${i}`} style={labelStyle}>
                      Child {i + 1}&rsquo;s name
                    </label>
                    <input
                      id={`child-name-${i}`}
                      type="text"
                      value={child.name}
                      onChange={(e) => {
                        const updated = [...data.children];
                        updated[i] = { ...updated[i], name: e.target.value };
                        onChange({ children: updated });
                      }}
                      placeholder="Name"
                      autoComplete="off"
                      style={inputStyle()}
                      onFocus={focusBorder}
                      onBlur={blurBorder}
                    />
                  </div>
                  <div style={{ width: 80 }}>
                    <label htmlFor={`child-age-${i}`} style={labelStyle}>
                      Age
                    </label>
                    <input
                      id={`child-age-${i}`}
                      type="number"
                      min="0"
                      max="17"
                      inputMode="numeric"
                      value={child.age}
                      onChange={(e) => {
                        const updated = [...data.children];
                        updated[i] = { ...updated[i], age: e.target.value };
                        onChange({ children: updated });
                      }}
                      placeholder="0"
                      style={inputStyle()}
                      onFocus={focusBorder}
                      onBlur={blurBorder}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <YesNoField
          id="dietary"
          legend="Does anyone in your party have dietary needs or allergies?"
          value={data.hasDietaryNeeds}
          onChange={(v) =>
            // Saying no clears anything already ticked, so a changed mind
            // never leaves stale requirements on the reply.
            onChange({
              hasDietaryNeeds: v,
              dietary: v ? data.dietary : EMPTY_DIETARY,
            })
          }
        />

        {data.hasDietaryNeeds && (
          <div
            className="disclosure-enter"
            style={{
              padding: "20px 16px",
              backgroundColor: "var(--color-background)",
              borderRadius: "var(--radius-sm, 4px)",
              border: "1px solid var(--color-border-hairline)",
              display: "flex",
              flexDirection: "column",
              gap: 24,
            }}
          >
            <p
              style={{
                fontSize: "var(--text-small)",
                color: "var(--color-ink-muted)",
              }}
            >
              Tick anything that applies to your party. The kitchen works from
              this, so please include every guest you are replying for.
            </p>

            <CheckList
              legend="Allergies"
              name="allergy"
              options={ALLERGY_OPTIONS}
              selected={data.dietary.allergies}
              onToggle={(next) =>
                onChange({ dietary: { ...data.dietary, allergies: next } })
              }
            />

            <CheckList
              legend="Dietary requirements"
              name="diet"
              options={DIET_OPTIONS}
              selected={data.dietary.diets}
              onToggle={(next) =>
                onChange({ dietary: { ...data.dietary, diets: next } })
              }
            />

            <div>
              <label htmlFor="dietary-other" style={labelStyle}>
                Anything else
              </label>
              <span id="dietary-other-hint" style={hintStyle}>
                Other allergies, intolerances or requirements — and who they are
                for.
              </span>
              <textarea
                id="dietary-other"
                rows={3}
                value={data.dietary.other}
                onChange={(e) =>
                  onChange({
                    dietary: { ...data.dietary, other: e.target.value },
                  })
                }
                aria-describedby="dietary-other-hint"
                placeholder="e.g. Ruth is coeliac; Sam cannot have strawberries"
                style={{
                  ...inputStyle(),
                  height: "auto",
                  padding: "14px 16px",
                  resize: "vertical",
                }}
                onFocus={focusBorder}
                onBlur={blurBorder}
              />
            </div>

            <p
              aria-live="polite"
              style={{
                fontSize: "var(--text-eyebrow)",
                color: "var(--color-ink-muted)",
                fontStyle: "italic",
              }}
            >
              {dietaryCount > 0
                ? `${dietaryCount} noted. Our event manager may still call to confirm.`
                : "Nothing ticked yet — our event manager will call you before the day."}
            </p>
          </div>
        )}

        <YesNoField
          id="travel"
          legend="Are you travelling from out of town?"
          value={data.travellingOutOfTown}
          onChange={(v) => onChange({ travellingOutOfTown: v })}
        />

        <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
          <legend style={{ ...labelStyle, marginBottom: 12 }}>
            Anything we can help with?
          </legend>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {LOGISTICS_OPTIONS.map(({ key, id, label }) => (
              <label
                key={key}
                htmlFor={id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                  fontSize: "var(--text-small)",
                  color: "var(--color-ink)",
                  minHeight: 44,
                }}
              >
                <input
                  type="checkbox"
                  id={id}
                  checked={data.logistics[key]}
                  onChange={(e) =>
                    onChange({
                      logistics: { ...data.logistics, [key]: e.target.checked },
                    })
                  }
                  style={{
                    accentColor: "var(--color-burgundy)",
                    width: 18,
                    height: 18,
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        <div>
          <label htmlFor="rsvp-message" style={labelStyle}>
            Message to Herald &amp; Yeukai (optional)
          </label>
          <textarea
            id="rsvp-message"
            rows={4}
            value={data.message}
            onChange={(e) => onChange({ message: e.target.value })}
            placeholder="Share a word of blessing…"
            style={{
              ...inputStyle(),
              height: "auto",
              padding: "14px 16px",
              resize: "vertical",
            }}
            onFocus={focusBorder}
            onBlur={blurBorder}
          />
        </div>
      </div>

      <p
        aria-live="polite"
        aria-atomic="true"
        style={{
          marginTop: 24,
          padding: "12px 16px",
          backgroundColor: "var(--color-background)",
          border: "1px solid var(--color-gold-leaf)",
          borderRadius: "var(--radius-sm, 4px)",
          fontSize: "var(--text-small)",
          color: "var(--color-ink)",
          fontWeight: 600,
        }}
      >
        {partySummary}
      </p>

      <StepNav onBack={onBack}>
        <Button onClick={onNext} flex={2}>
          Review reply
        </Button>
      </StepNav>
    </div>
  );
}
