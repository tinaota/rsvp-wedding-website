export default function Footer() {
  return (
    <footer
      className="border-t text-center"
      style={{
        borderColor: "var(--color-border-hairline)",
        backgroundColor: "var(--color-card)",
        paddingTop: 40,
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 40px)",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          fontFamily: "var(--font-script)",
          fontSize: "var(--text-monogram)",
          color: "var(--color-gold-leaf)",
          lineHeight: 1,
          marginBottom: 12,
        }}
      >
        H · Y
      </div>
      <p
        className="uppercase tracking-widest"
        style={{
          fontSize: "var(--text-eyebrow)",
          color: "var(--color-ink-muted)",
        }}
      >
        Saturday, 7 November 2026 · The Langham Melbourne
      </p>
      <p
        className="mt-3"
        style={{
          fontSize: "var(--text-small)",
          color: "var(--color-ink-muted)",
        }}
      >
        Need help with your RSVP?{" "}
        <a
          href="mailto:yeukaiweddingvowrenewal@gmail.com"
          style={{
            color: "var(--color-burgundy)",
            textDecoration: "underline",
          }}
        >
          Contact us
        </a>
      </p>
    </footer>
  );
}
