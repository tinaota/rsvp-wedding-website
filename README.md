# Vow Renewal — Ps Herald & Ps Yeukai Tshwanelo

A private invitation site for a wedding vow renewal at The Langham Melbourne,
Saturday 7 November 2026. Built from the Figma Make prototype "Create Prototype
with Markdown" (version 11) — the design tokens, copy, layout and RSVP flow all
come from that build.

Next.js 16 (App Router) · React 19 · Tailwind v4 · TypeScript.

```bash
npm run dev
```

## Structure

| Path | What it is |
|---|---|
| `src/app/layout.tsx` | Fonts (Playfair Display, Lora, Great Vibes), metadata, `noindex` |
| `src/app/globals.css` | The whole design system: `@theme` tokens, motion, reduced-motion |
| `src/app/page.tsx` | Section order: Hero, Story, Schedule, Venue, Attire, RSVP |
| `src/components/` | One file per section, plus the header and mobile sticky bar |
| `src/components/rsvp/` | The four-step RSVP flow |
| `src/app/api/rsvp/route.ts` | Submission endpoint |

## The RSVP flow

Four steps: **details → reply → party or blessing → review & send**. Step 3
branches on the reply — accepting opens the party sizing, declining opens a
message box. Completed steps in the progress rail are clickable, and every row
on the review screen has its own Edit link.

An in-progress reply is kept in `localStorage` under `rsvp-draft`, so a guest
can close the tab and pick it up later. The draft is cleared once the reply
sends. Storage access is wrapped in `try`/`catch` throughout — a private window
simply loses the draft rather than breaking the form.

Replies close at the end of **12 October 2026** Melbourne time
(`RSVP_DEADLINE` in `src/components/rsvp/types.ts`). After that the whole
section is replaced with a closing notice.

## Where replies go

`POST /api/rsvp` validates and clamps the payload, then logs it. **Nothing is
persisted yet.** The single `persist()` function in
[`src/app/api/rsvp/route.ts`](src/app/api/rsvp/route.ts) is the only thing that
needs replacing to send replies to a database, an email provider or a
spreadsheet.

## The venue map

A mosaic of plain tile images rather than an embedded map widget. The map is
only ever a locator, so there is nothing to pan or zoom — and drawing it
ourselves means no third-party chrome, no map library, nothing to swallow a
phone's scroll, and a marker in the site's own palette. The whole panel is a
link that opens Google Maps directions in a new tab.

Tiles come from Esri's Light Gray Canvas: keyless, and near-monochrome, so the
warm tint in `globals.css` reads as a toned map rather than a filtered one.
(CARTO's Positron was the first choice and looks the same, but it now stamps
"API KEY REQUIRED" across unauthenticated tiles.) A light warm tint ties the
grey into the cream; it is dropped under `prefers-contrast: more`.

Coordinates, zoom and the tile grid are all in
[`src/components/Venue.tsx`](src/components/Venue.tsx) — change `ZOOM` or
`TILE_RADIUS` and the mosaic re-centres itself on the venue automatically.

## Motion and accessibility

Every animation is written in the `--dur-*` / `--ease-*` tokens, so the
`prefers-reduced-motion` block at the end of `globals.css` neutralises the lot
in one place. Step changes use the View Transition API where the browser has it
and fall back silently where it does not.

The form validates on submit rather than disabling buttons: failing a step
shows inline messages wired up with `aria-describedby` / `aria-invalid` and
moves focus to the first problem. Step changes move focus to the new step
heading — except on first load, where that would drag the page past the
invitation. The mobile menu traps focus, marks `<main>` inert, closes on
Escape, returns focus to its trigger, and closes itself if the viewport grows
past the desktop breakpoint.
