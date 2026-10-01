"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

/* Shared form furniture for the RSVP steps. Every step imports from here so a
   change to a control is made once, not five times. */

export const labelStyle: CSSProperties = {
  display: "block",
  fontSize: "var(--text-eyebrow)",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--color-ink)",
  marginBottom: 6,
  fontFamily: "var(--font-body)",
  fontWeight: 600,
};

export const hintStyle: CSSProperties = {
  fontSize: "var(--text-eyebrow)",
  color: "var(--color-ink-muted)",
  marginBottom: 6,
  display: "block",
};

export const errorStyle: CSSProperties = {
  fontSize: "var(--text-eyebrow)",
  color: "var(--color-error)",
  marginTop: 6,
  display: "flex",
  alignItems: "center",
  gap: 6,
  fontWeight: 600,
};

export function inputStyle(invalid = false): CSSProperties {
  return {
    width: "100%",
    height: 52,
    padding: "0 16px",
    // 16px keeps iOS Safari from zooming the viewport on focus.
    fontSize: 16,
    border: `1.5px solid ${invalid ? "var(--color-error)" : "var(--color-border-strong)"}`,
    backgroundColor: "var(--color-card)",
    fontFamily: "var(--font-body)",
    color: "var(--color-ink)",
    outline: "none",
    borderRadius: "var(--radius-sm, 4px)",
    boxSizing: "border-box",
    transition: "border-color var(--dur-fast) var(--ease-standard)",
  };
}

export const headingStyle: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "var(--text-h3)",
  fontWeight: 600,
  color: "var(--color-ink)",
  outline: "none",
};

export function ErrorText({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return (
    <p id={id} style={errorStyle}>
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="7"
          cy="7"
          r="6.25"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M7 4v3.5M7 10h.01"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      {children}
    </p>
  );
}

interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  type?: "text" | "tel" | "email";
  required?: boolean;
  /** Shows "(Optional)" beside the label, for fields in a required group. */
  optional?: boolean;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  inputMode?: "text" | "tel" | "email" | "numeric";
  maxLength?: number;
  inputRef?: React.Ref<HTMLInputElement>;
  /** A non-blocking note under the field, e.g. a postcode sanity check. */
  notice?: string;
}

export function Field({
  id,
  label,
  hint,
  error,
  type = "text",
  required,
  optional,
  value,
  onChange,
  autoComplete,
  inputMode,
  maxLength,
  inputRef,
  notice,
}: FieldProps) {
  const describedBy =
    [
      hint ? `${id}-hint` : null,
      error ? `${id}-error` : null,
      notice && !error ? `${id}-notice` : null,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div>
      <label htmlFor={id} style={labelStyle}>
        {label}{" "}
        {required && <span style={{ fontWeight: 400 }}>(Required)</span>}
        {optional && <span style={{ fontWeight: 400 }}>(Optional)</span>}
      </label>
      {hint && (
        <span id={`${id}-hint`} style={hintStyle}>
          {hint}
        </span>
      )}
      <input
        id={id}
        ref={inputRef}
        type={type}
        inputMode={inputMode}
        maxLength={maxLength}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        style={inputStyle(Boolean(error))}
        onFocus={(e) => {
          if (!error)
            e.currentTarget.style.borderColor = "var(--color-burgundy)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error
            ? "var(--color-error)"
            : "var(--color-border-strong)";
        }}
      />
      {error && <ErrorText id={`${id}-error`}>{error}</ErrorText>}
      {notice && !error && (
        <NoticeText id={`${id}-notice`}>{notice}</NoticeText>
      )}
    </div>
  );
}

/** A soft, non-blocking note. Deliberately not styled as an error. */
export function NoticeText({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  return (
    <p
      id={id}
      aria-live="polite"
      style={{
        fontSize: "var(--text-eyebrow)",
        color: "var(--color-ink-muted)",
        fontStyle: "italic",
        marginTop: 6,
      }}
    >
      {children}
    </p>
  );
}

interface SelectFieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  /** Shown as the disabled first option until something is chosen. */
  placeholder: string;
  options: readonly { value: string; label: string }[];
  autoComplete?: string;
  selectRef?: React.Ref<HTMLSelectElement>;
}

/** A native select dressed to match Field, with the same error wiring. */
export function SelectField({
  id,
  label,
  error,
  required,
  value,
  onChange,
  placeholder,
  options,
  autoComplete,
  selectRef,
}: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={id} style={labelStyle}>
        {label}{" "}
        {required && <span style={{ fontWeight: 400 }}>(Required)</span>}
      </label>
      <select
        id={id}
        ref={selectRef}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={error ? true : undefined}
        style={{
          ...inputStyle(Boolean(error)),
          // Room for the native arrow so a long option never sits under it.
          paddingRight: 32,
          color: value ? "var(--color-ink)" : "var(--color-ink-muted)",
        }}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <ErrorText id={`${id}-error`}>{error}</ErrorText>}
    </div>
  );
}

interface ChoiceFieldProps<T extends string | boolean> {
  id: string;
  legend: string;
  hint?: string;
  error?: string;
  value: T | null;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
  /** Lets a parent move focus here when validation fails. */
  firstInputRef?: React.Ref<HTMLInputElement>;
}

/**
 * Large side-by-side radio buttons. Every either/or question in the flow uses
 * this, so they all look and behave the same.
 */
export function ChoiceField<T extends string | boolean>({
  id,
  legend,
  hint,
  error,
  value,
  options,
  onChange,
  firstInputRef,
}: ChoiceFieldProps<T>) {
  const describedBy =
    [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined;
  return (
    <fieldset
      style={{ border: "none", padding: 0, margin: 0 }}
      aria-describedby={describedBy}
    >
      <legend style={{ ...labelStyle, marginBottom: hint ? 6 : 12 }}>
        {legend}
      </legend>
      {hint && (
        <span id={`${id}-hint`} style={{ ...hintStyle, marginBottom: 12 }}>
          {hint}
        </span>
      )}
      <div style={{ display: "flex", gap: 12 }}>
        {options.map((opt, i) => {
          const selected = value === opt.value;
          const radioId = `${id}-${opt.label.toLowerCase().replace(/\s+/g, "-")}`;
          return (
            <label
              key={radioId}
              htmlFor={radioId}
              className={selected ? "on-burgundy" : undefined}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                minHeight: 52,
                padding: "0 8px",
                border: `1.5px solid ${
                  error
                    ? "var(--color-error)"
                    : selected
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
                textAlign: "center",
                transition:
                  "background-color var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard)",
              }}
            >
              <input
                type="radio"
                id={radioId}
                ref={i === 0 ? firstInputRef : undefined}
                name={id}
                value={opt.label}
                checked={selected}
                onChange={() => onChange(opt.value)}
                style={{
                  width: 16,
                  height: 16,
                  flexShrink: 0,
                  accentColor: selected
                    ? "var(--color-burgundy-ink)"
                    : "var(--color-burgundy)",
                  cursor: "pointer",
                }}
              />
              {opt.label}
            </label>
          );
        })}
      </div>
      {error && <ErrorText id={`${id}-error`}>{error}</ErrorText>}
    </fieldset>
  );
}

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary";
  flex?: number;
  fullWidth?: boolean;
  busy?: boolean;
  style?: CSSProperties;
}

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  flex,
  fullWidth,
  busy,
  style,
}: ButtonProps) {
  const primary = variant === "primary";
  const base: CSSProperties = {
    height: 52,
    flex,
    width: fullWidth ? "100%" : undefined,
    cursor: busy ? "progress" : "pointer",
    fontSize: "var(--text-eyebrow)",
    letterSpacing: primary ? "0.15em" : "0.12em",
    textTransform: "uppercase",
    fontFamily: "var(--font-body)",
    borderRadius: "var(--radius-full)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    transition:
      "background-color var(--dur-fast) var(--ease-standard), opacity var(--dur-fast) var(--ease-standard)",
    ...(primary
      ? {
          backgroundColor: "var(--color-burgundy)",
          color: "var(--color-burgundy-ink)",
          border: "none",
        }
      : {
          backgroundColor: "transparent",
          color: "var(--color-ink)",
          border: "1.5px solid var(--color-border-strong)",
        }),
    ...style,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      aria-busy={busy || undefined}
      disabled={busy}
      className={`btn-press ${primary ? "on-burgundy" : ""}`}
      style={base}
      onMouseEnter={(e) => {
        if (busy) return;
        e.currentTarget.style.backgroundColor = primary
          ? "var(--color-burgundy-hover)"
          : "rgba(26,18,8,0.04)";
      }}
      onMouseLeave={(e) => {
        if (busy) return;
        e.currentTarget.style.backgroundColor = primary
          ? "var(--color-burgundy)"
          : "transparent";
      }}
    >
      {busy && (
        <span
          aria-hidden="true"
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            animation: "spin 0.7s linear infinite",
          }}
        />
      )}
      {children}
    </button>
  );
}

export function StepNav({
  onBack,
  children,
}: {
  onBack: () => void;
  children: ReactNode;
}) {
  return (
    <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
      <Button variant="secondary" onClick={onBack} flex={1}>
        Back
      </Button>
      {children}
    </div>
  );
}

/**
 * Focus for a step heading. Moving focus is right when a guest has navigated to
 * the step, but on first page load it would drag the whole page down to the
 * form — so the caller says which it is, and the answer is fixed at mount.
 */
export function useStepHeading(focusOnMount: boolean) {
  const ref = useRef<HTMLHeadingElement>(null);
  // Frozen at mount: steps remount on navigation, so this is the right answer
  // for the life of this instance.
  const [shouldFocus] = useState(focusOnMount);

  useEffect(() => {
    if (shouldFocus) ref.current?.focus();
  }, [shouldFocus]);

  return ref;
}
