"use client";

import type { Attending } from "./types";

const STEP_LABELS = [
  "Your details",
  "Your reply",
  "Your party",
  "Review & send",
];

interface Props {
  current: number;
  attending: Attending;
  onGoTo: (step: number) => void;
}

export default function ProgressRail({ current, attending, onGoTo }: Props) {
  const labels = [...STEP_LABELS];
  if (attending === "declines") labels[2] = "A blessing";

  return (
    <div style={{ marginBottom: 40 }}>
      <div
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={1}
        aria-valuemax={4}
        aria-valuetext={`Step ${current} of 4 — ${labels[current - 1]}`}
        aria-label="RSVP progress"
        style={{ display: "flex", alignItems: "center", gap: 0 }}
      >
        {labels.map((label, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < current;
          const isCurrent = stepNum === current;
          const isFuture = stepNum > current;
          const isLast = i === labels.length - 1;

          return (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                flex: isLast ? "none" : 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {isCompleted ? (
                  <button
                    type="button"
                    onClick={() => onGoTo(stepNum)}
                    aria-label={`Go back to step ${stepNum}: ${label}`}
                    className="btn-press on-burgundy"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      backgroundColor: "var(--color-burgundy)",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition:
                        "opacity var(--dur-fast) var(--ease-standard)",
                      flexShrink: 0,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "0.8";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="var(--color-burgundy-ink)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                ) : (
                  <div
                    aria-current={isCurrent ? "step" : undefined}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      border: `2px solid ${
                        isCurrent
                          ? "var(--color-burgundy)"
                          : "var(--color-border-strong)"
                      }`,
                      backgroundColor: "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: isCurrent
                          ? "var(--color-burgundy)"
                          : "transparent",
                      }}
                    />
                  </div>
                )}
                <span
                  aria-hidden="true"
                  style={{
                    fontSize: "var(--text-eyebrow)",
                    color: isCurrent
                      ? "var(--color-burgundy)"
                      : isFuture
                        ? "var(--color-ink-muted)"
                        : "var(--color-ink)",
                    whiteSpace: "nowrap",
                    letterSpacing: "0.08em",
                    fontFamily: "var(--font-body)",
                    fontWeight: isCurrent ? 600 : 400,
                    opacity: isFuture ? 0.5 : 1,
                  }}
                >
                  {stepNum}
                </span>
              </div>

              {!isLast && (
                <div
                  aria-hidden="true"
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: isCompleted
                      ? "var(--color-burgundy)"
                      : "var(--color-border-hairline)",
                    margin: "0 4px",
                    marginBottom: 20,
                    transition:
                      "background-color var(--dur-base) var(--ease-standard)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      <p
        aria-live="polite"
        style={{
          marginTop: 12,
          fontSize: "var(--text-small)",
          color: "var(--color-ink-muted)",
          textAlign: "center",
        }}
      >
        Step {current} of 4 — {labels[current - 1]}
      </p>
    </div>
  );
}
