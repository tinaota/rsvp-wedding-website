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
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  inputMode?: "text" | "tel" | "email";
  inputRef?: React.Ref<HTMLInputElement>;
}

export function Field({
  id,
  label,
  hint,
  error,
  type = "text",
  required,
  value,
  onChange,
  autoComplete,
  inputMode,
  inputRef,
}: FieldProps) {
  const describedBy =
    [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div>
      <label htmlFor={id} style={labelStyle}>
        {label}{" "}
        {required && <span style={{ fontWeight: 400 }}>(Required)</span>}
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
    </div>
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
