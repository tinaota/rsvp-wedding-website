"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NAV_SECTIONS, useActiveSection } from "./sections";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const activeSection = useActiveSection();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  /**
   * `restoreFocus` is for dismissal — Escape, the close button, the breakpoint.
   * Following a link is not a dismissal: pulling focus back to the hamburger
   * would both lose the reader's place and fight the jump to the section.
   */
  const closeMenu = useCallback((restoreFocus = true) => {
    setMenuOpen(false);
    document.body.style.overflow = "";
    if (restoreFocus) triggerRef.current?.focus();
  }, []);

  const openMenu = useCallback(() => {
    setMenuOpen(true);
    document.body.style.overflow = "hidden";
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // The hamburger is lg:hidden, so an open panel must close itself when the
  // viewport grows past the breakpoint — otherwise its state outlives its trigger.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onBreakpoint = (e: MediaQueryListEvent) => {
      if (e.matches) closeMenu();
    };
    mq.addEventListener("change", onBreakpoint);
    return () => mq.removeEventListener("change", onBreakpoint);
  }, [closeMenu]);

  const trapFocus = useCallback(
    (e: KeyboardEvent) => {
      if (!panelRef.current) return;
      if (e.key === "Escape") {
        closeMenu();
        return;
      }
      if (e.key !== "Tab") return;

      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a, button, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [closeMenu],
  );

  useEffect(() => {
    const main = document.querySelector("main");
    if (menuOpen) {
      document.addEventListener("keydown", trapFocus);
      main?.setAttribute("inert", "");
      const t = setTimeout(() => {
        panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();
      }, 50);
      return () => {
        clearTimeout(t);
        document.removeEventListener("keydown", trapFocus);
        main?.removeAttribute("inert");
      };
    }
    main?.removeAttribute("inert");
  }, [menuOpen, trapFocus]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only"
        style={{
          position: "fixed",
          top: 8,
          left: 8,
          zIndex: 200,
          padding: "8px 16px",
          backgroundColor: "var(--color-burgundy)",
          color: "var(--color-burgundy-ink)",
          fontSize: "var(--text-small)",
          fontFamily: "var(--font-body)",
          textDecoration: "none",
        }}
      >
        Skip to main content
      </a>

      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backgroundColor: scrolled
            ? "rgba(250, 247, 242, 0.94)"
            : "var(--color-card)",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled
            ? "1px solid var(--color-border-hairline)"
            : "1px solid transparent",
          transition:
            "background-color var(--dur-base) var(--ease-standard), border-color var(--dur-base) var(--ease-standard)",
        }}
      >
        <div
          className="flex items-center justify-between"
          style={{ height: 64, paddingInline: "clamp(16px, 5vw, 80px)" }}
        >
          <a
            href="#invitation"
            aria-label="Return to top — H · Y"
            style={{
              fontFamily: "var(--font-script)",
              fontSize: "clamp(1.6rem, 3vw, 2rem)",
              color: "var(--color-burgundy)",
              textDecoration: "none",
              lineHeight: 1,
            }}
          >
            H · Y
          </a>

          <nav
            aria-label="Site navigation"
            className="hidden lg:flex items-center gap-8"
          >
            {NAV_SECTIONS.map(({ label, id }) => (
              <a
                key={id}
                href={`#${id}`}
                className="nav-link uppercase"
                aria-current={activeSection === id ? "location" : undefined}
                style={{
                  fontSize: "var(--text-eyebrow)",
                  letterSpacing: "0.14em",
                  color:
                    activeSection === id
                      ? "var(--color-burgundy)"
                      : "var(--color-ink-muted)",
                  fontFamily: "var(--font-body)",
                  transition: "color var(--dur-fast) var(--ease-standard)",
                }}
              >
                {label}
              </a>
            ))}
          </nav>

          <button
            ref={triggerRef}
            type="button"
            // .menu-toggle carries the display rules: an inline `display` here
            // would beat lg:hidden and leave the hamburger on desktop.
            className="menu-toggle btn-press"
            onClick={menuOpen ? () => closeMenu() : openMenu}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              width: 48,
              height: 48,
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              padding: 0,
            }}
          >
            <span
              style={{
                display: "block",
                width: 24,
                height: 1.5,
                backgroundColor: "var(--color-ink)",
                transition:
                  "transform var(--dur-base) var(--ease-standard), opacity var(--dur-fast) var(--ease-standard)",
                transform: menuOpen
                  ? "translateY(6.5px) rotate(45deg)"
                  : "none",
              }}
            />
            <span
              style={{
                display: "block",
                width: 24,
                height: 1.5,
                backgroundColor: "var(--color-ink)",
                transition: "opacity var(--dur-fast) var(--ease-standard)",
                opacity: menuOpen ? 0 : 1,
              }}
            />
            <span
              style={{
                display: "block",
                width: 24,
                height: 1.5,
                backgroundColor: "var(--color-ink)",
                transition:
                  "transform var(--dur-base) var(--ease-standard), opacity var(--dur-fast) var(--ease-standard)",
                transform: menuOpen
                  ? "translateY(-6.5px) rotate(-45deg)"
                  : "none",
              }}
            />
          </button>
        </div>
      </header>

      {/* Deliberately a sibling of <header>, not a child: the header takes a
          backdrop-filter once scrolled, which would make it the containing
          block for this fixed panel and collapse it to the header’s own
          height. */}
      {menuOpen && (
        <div
          id="site-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Site navigation"
          className="lg:hidden"
          style={{
            position: "fixed",
            inset: "64px 0 0 0",
            backgroundColor: "var(--color-card)",
            borderTop: "1px solid var(--color-border-hairline)",
            zIndex: 49,
            padding: "clamp(24px, 6vw, 40px)",
            overflowY: "auto",
          }}
        >
          <nav aria-label="Mobile site navigation">
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {NAV_SECTIONS.map(({ label, id }) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={() => closeMenu(false)}
                    aria-current={activeSection === id ? "location" : undefined}
                    style={{
                      display: "block",
                      padding: "16px 0",
                      borderBottom: "1px solid var(--color-border-hairline)",
                      fontSize: "var(--text-h3)",
                      fontFamily: "var(--font-display)",
                      color:
                        activeSection === id
                          ? "var(--color-burgundy)"
                          : "var(--color-ink)",
                      textDecoration: "none",
                      fontWeight: activeSection === id ? 600 : 400,
                    }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <button
            type="button"
            onClick={() => closeMenu()}
            style={{
              marginTop: 32,
              minHeight: 44,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "var(--text-small)",
              color: "var(--color-ink-muted)",
              padding: 0,
              fontFamily: "var(--font-body)",
            }}
          >
            Close menu
          </button>
        </div>
      )}
    </>
  );
}
