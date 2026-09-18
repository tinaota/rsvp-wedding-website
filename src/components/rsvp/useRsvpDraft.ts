"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EMPTY_RSVP, type RsvpData } from "./types";

const STORAGE_KEY = "rsvp-draft";

function readDraft(): Partial<RsvpData> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object"
      ? (parsed as Partial<RsvpData>)
      : {};
  } catch {
    // Private windows, blocked site data and corrupt JSON all land here.
    return {};
  }
}

/**
 * Keeps the in-progress reply in localStorage so a guest can close the tab and
 * come back to it. The draft is hydrated after mount — reading storage during
 * render would not match the server-rendered HTML.
 */
export function useRsvpDraft() {
  const [data, setData] = useState<RsvpData>(EMPTY_RSVP);
  const hydratedRef = useRef(false);

  useEffect(() => {
    // Read eagerly rather than inside the updater: an updater runs later, by
    // which point the write effect below may already have touched storage.
    const merged = { ...EMPTY_RSVP, ...readDraft() };
    hydratedRef.current = true;
    // Reading storage during render would not match the server-rendered HTML,
    // so the saved draft is folded in once, after mount. This is the one place
    // a setState in an effect is the correct tool.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(merged);
  }, []);

  useEffect(() => {
    // `data === EMPTY_RSVP` means this is still the pristine initial object,
    // which happens on the render before hydration commits. Writing it would
    // erase a saved draft before it has been restored.
    if (!hydratedRef.current || data === EMPTY_RSVP) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* storage unavailable — the form still works, it just won't be remembered */
    }
  }, [data]);

  const update = useCallback((partial: Partial<RsvpData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  }, []);

  const clearDraft = useCallback(() => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing to clean up */
    }
  }, []);

  return { data, update, clearDraft };
}
