"use client";

import { useCallback, useRef, useState } from "react";
import Confirmation from "./Confirmation";
import ProgressRail from "./ProgressRail";
import StepBlessing from "./StepBlessing";
import StepDetails from "./StepDetails";
import StepParty from "./StepParty";
import StepReply from "./StepReply";
import StepReview from "./StepReview";
import { RSVP_DEADLINE, RSVP_DEADLINE_LABEL } from "./types";
import { useRsvpDraft } from "./useRsvpDraft";

type DocumentWithViewTransition = Document & {
  startViewTransition?: (callback: () => void) => unknown;
};

function withViewTransition(update: () => void) {
  const doc = document as DocumentWithViewTransition;
  if (typeof doc.startViewTransition === "function") {
    doc.startViewTransition(update);
  } else {
    update();
  }
}

function isDeadlinePassed() {
  return new Date() > RSVP_DEADLINE;
}

export default function RsvpFlow() {
  const { data, update, clearDraft } = useRsvpDraft();
  const [step, setStep] = useState(1);
  // False on first paint: focusing a step heading then would yank the page down
  // to the form before the guest has seen the invitation.
  const [navigated, setNavigated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const scrollToSection = useCallback((delay: number) => {
    setTimeout(
      () =>
        sectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        }),
      delay,
    );
  }, []);

  const goToStep = useCallback(
    (next: number) => {
      setNavigated(true);
      withViewTransition(() => setStep(next));
      scrollToSection(50);
    },
    [scrollToSection],
  );

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(`Request failed with ${res.status}`);
      clearDraft();
      setSubmitted(true);
      scrollToSection(100);
    } catch {
      setSubmitError(
        "We couldn't send your reply just then. Please check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }, [data, clearDraft, scrollToSection]);

  if (isDeadlinePassed()) {
    return (
      <section
        id="rsvp"
        ref={sectionRef}
        style={{
          padding: "clamp(64px, 9vw, 128px) 0",
          backgroundColor: "var(--color-card)",
        }}
      >
        <div className="max-w-2xl mx-auto px-6 text-center">
          <p
            className="uppercase tracking-widest"
            style={{
              fontSize: "var(--text-eyebrow)",
              color: "var(--color-gold-ink)",
              letterSpacing: "0.14em",
              marginBottom: 12,
            }}
          >
            RSVP
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h2)",
              fontWeight: 600,
              color: "var(--color-ink)",
              marginBottom: 16,
              lineHeight: 1.15,
            }}
          >
            RSVPs are now closed
          </h2>
          <p
            style={{
              fontSize: "var(--text-body)",
              color: "var(--color-ink-muted)",
              maxWidth: "50ch",
              margin: "0 auto",
            }}
          >
            Thank you to everyone who replied. If you still need to reach us,
            please call us — details available in your confirmation email.
          </p>
        </div>
      </section>
    );
  }

  if (submitted) {
    return (
      <section id="rsvp" ref={sectionRef}>
        <Confirmation data={data} />
      </section>
    );
  }

  return (
    <section
      id="rsvp"
      ref={sectionRef}
      style={{
        backgroundColor: "var(--color-card)",
        padding: "clamp(64px, 9vw, 128px) 0",
      }}
    >
      <div className="max-w-2xl mx-auto px-6">
        <div className="mb-12 text-center">
          <p
            className="uppercase tracking-widest"
            style={{
              fontSize: "var(--text-eyebrow)",
              color: "var(--color-gold-ink)",
              letterSpacing: "0.14em",
              marginBottom: 12,
            }}
          >
            RSVP
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h2)",
              fontWeight: 600,
              color: "var(--color-ink)",
              lineHeight: 1.15,
              marginBottom: 8,
            }}
          >
            Kindly Respond by {RSVP_DEADLINE_LABEL}
          </h2>
          <p
            style={{
              fontSize: "var(--text-small)",
              color: "var(--color-ink-muted)",
              marginBottom: 4,
            }}
          >
            Please reply for everyone in your household. It takes about a
            minute.
          </p>
          <p
            style={{
              fontSize: "var(--text-small)",
              fontStyle: "italic",
              color: "var(--color-ink-muted)",
            }}
          >
            You can change your reply any time until {RSVP_DEADLINE_LABEL} using
            the link in your confirmation email.
          </p>
        </div>

        <ProgressRail
          current={step}
          attending={data.attending}
          onGoTo={goToStep}
        />

        <div style={{ viewTransitionName: "rsvp-step" }}>
          {step === 1 && (
            <StepDetails
              data={data}
              onChange={update}
              onNext={() => goToStep(2)}
              focusOnMount={navigated}
            />
          )}
          {step === 2 && (
            <StepReply
              data={data}
              onChange={update}
              onNext={() => goToStep(3)}
              onBack={() => goToStep(1)}
              focusOnMount={navigated}
            />
          )}
          {step === 3 && data.attending === "accepts" && (
            <StepParty
              data={data}
              firstName={data.fullName.split(" ")[0] || data.fullName}
              onChange={update}
              onNext={() => goToStep(4)}
              onBack={() => goToStep(2)}
              focusOnMount={navigated}
            />
          )}
          {step === 3 && data.attending === "declines" && (
            <StepBlessing
              data={data}
              onChange={update}
              onNext={() => goToStep(4)}
              onBack={() => goToStep(2)}
              focusOnMount={navigated}
            />
          )}
          {step === 4 && (
            <StepReview
              data={data}
              onSubmit={handleSubmit}
              onBack={() => goToStep(3)}
              onGoTo={goToStep}
              submitting={submitting}
              error={submitError}
            />
          )}
        </div>
      </div>
    </section>
  );
}
