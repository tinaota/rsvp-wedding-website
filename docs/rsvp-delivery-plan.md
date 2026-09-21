# RSVP delivery: Resend now, Google Sheets next

**Status: superseded and built.** Phase 1 (Resend) was implemented as written.
Phase 2 (Google Sheets) was replaced by a Supabase Postgres table, built in the
same pass — which also changed the failure handling described below, since the
database rather than email is now the system of record. See the "Where replies
go" section of `README.md` for what actually shipped. Kept for the reasoning.

## Context

The site is live and collecting replies, but `POST /api/rsvp` only validates the
payload and `console.log`s it. Every reply so far exists solely in Vercel's log
buffer, which expires. **Right now a guest can complete the RSVP and the couple
will never see it.** That is the problem this fixes.

The goal is for Yeukai to have the guest list in a spreadsheet she can sort,
filter and hand to the venue. The work is split in two:

- **Phase 1: Resend.** Every reply emails the couple immediately, so no reply
  can be lost again. Email becomes the system of record.
- **Phase 2: Google Sheets.** Slots in behind the same `persist()` seam once
  Phase 1 is proven.

Decisions already taken:

| Decision | Choice |
|---|---|
| Sheets timing | Email first, spreadsheet second |
| Guest email field | Becomes **required** |
| "Change your reply via the link in your email" | **Reword** the promise, don't build edit links |
| Resend sender | Start in **test mode**, no verified domain yet |

## What test mode means (it shapes the whole design)

Resend's `onboarding@resend.dev` sender **only delivers to the email address on
your own Resend account**. So in Phase 1:

- The **notification to the couple** works, provided it is sent to that address.
- The **guest confirmation cannot work** for anyone else and would silently fail.

So guest confirmations get written but **gated behind a verified sender**. Set
`RESEND_FROM` to a verified domain address later and they start sending — no
code change. Until then the code logs that it skipped them.

## Phase 1 — implementation

### 1. Dependency and configuration

- `npm install resend`
- Env vars (`.env.local` locally, Vercel project settings for production):

| Variable | Purpose |
|---|---|
| `RESEND_API_KEY` | From the Resend dashboard. |
| `RSVP_NOTIFY_TO` | Where replies land. In test mode this **must** be your Resend account address, or nothing arrives. Comma-separated for several recipients. |
| `RESEND_FROM` | Optional. Unset → test sender, guest confirmations skipped. Set to a verified address → confirmations turn on. |

- Confirm `.env.local` is gitignored. Never commit a key.

### 2. New file: `src/lib/rsvp/notify.ts`

Holds all email work so the route stays a thin validate-and-respond layer.

- `sendCoupleNotification(id, data)` — subject line carries the answer at a
  glance, e.g. `RSVP — Kudzai Moyo accepts (3 adults, 1 child)`. Body lists
  every field: party members by name, dietary detail, travel and logistics, and
  their message. Plain text plus simple HTML in the site's typography.
- `sendGuestConfirmation(data)` — what they told us, the date, venue and
  directions link, and how to change their reply. **Returns early, with a log
  line, when `RESEND_FROM` is not a verified sender.**
- `isVerifiedSender()` — the single gate both the above and future code read.

**Reuse, don't re-derive:** import `dietarySummary()` and `partySize()` from
`src/components/rsvp/types.ts` — it has no `"use client"`, so it is safe
server-side. The confirmation email then phrases dietary needs identically to
the review screen the guest just approved.

### 3. `src/app/api/rsvp/route.ts`

- Replace the duplicated `RsvpSubmission` interface with the shared type:
  `type RsvpSubmission = RsvpData & { attending: "accepts" | "declines" }`.
  The local copy has already drifted once and will again.
- Make `email` required in `parse()`, matching the client change below.
- `persist()` becomes: send the couple notification, then attempt the guest
  confirmation.

**Failure handling — the important part.** With no database, email *is* the
record, so a silent failure loses a guest's reply:

- Couple notification fails → return **502**. The flow already shows
  *"We couldn't send your reply just then… try again"* (`RsvpFlow.tsx:77`), so
  the guest retries rather than walking away believing they have replied.
- Guest confirmation fails → **still return 201**. Their reply is recorded; a
  missing receipt is not worth making them resubmit.
- Keep the existing full-JSON `console.log` regardless, as a last-resort
  recovery path from Vercel logs.

### 4. Client changes

- **`src/components/rsvp/StepDetails.tsx`** — make email required. The
  validation, `aria-invalid` wiring and focus-the-first-error behaviour already
  exist; this is adding `required` and an entry to `validate()`, plus dropping
  the "(optional)" framing.
- **Reword the edit-link promise** in three places — `RsvpFlow.tsx:194`,
  `StepReview.tsx:227`, `Confirmation.tsx:263` — to something honourable, e.g.
  *"Need to change your reply? Email or call us and we'll update it for you."*
- **Honeypot.** The endpoint is public and now sends mail, so abuse costs money.
  Add a visually hidden, `tabindex="-1"`, `autocomplete="off"` field; the route
  discards any submission that fills it. Cheap; no effect on real guests.

## Phase 2 — Google Sheets

When Phase 1 is proven, the recommended route is a **Google Apps Script web
app**: Yeukai opens her sheet → Extensions → Apps Script → pastes a `doPost`
that appends a row → Deploy as web app → sends over the URL. No Google Cloud
project, no service-account key, and she owns it.

`persist()` then also POSTs to `SHEETS_WEBHOOK_URL` with a shared secret the
script checks. A Sheets failure must **not** fail the request — the email has
already captured the reply. One row per household with counts and names
flattened; a per-guest tab can follow if the venue wants one.

The alternative — Sheets API with a Google Cloud service account — is more
robust long-term but adds a project, an enabled API, a downloaded JSON key and
a private key to store. Not worth it at this scale.

## ⚠️ Check before starting

The footer advertises **`rsvp@tshwanelovowrenewal.com`** (`Footer.tsx:42`),
inherited from the prototype.

- If you **own that domain**, it is the natural Resend sender and solves the
  verification problem in one step.
- If you **do not**, that address is already a dead end on the live site —
  anyone emailing it gets a bounce — and should be changed regardless.

## Verification

1. **Local.** `.env.local` with `RESEND_API_KEY` and `RSVP_NOTIFY_TO` set to
   your Resend account address. `npm run dev`, complete the flow, confirm the
   email arrives with party, dietary and logistics detail correct, and that the
   subject line matches the reply.
2. **Dietary round-trip.** Tick allergies, diets and free text; confirm the
   email phrases them exactly as the review screen did.
3. **Decline path.** Submit a decline; confirm the blessing appears and no party
   or dietary sections render in the email.
4. **Failure path.** Temporarily break `RESEND_API_KEY`, submit, and confirm the
   UI shows the retry message and the reply is **not** falsely acknowledged.
5. **Confirmation gating.** With `RESEND_FROM` unset, confirm the log says the
   guest confirmation was skipped and the request still returns 201.
6. **Required email.** Confirm step 1 blocks an empty email and moves focus to
   the field.
7. **Honeypot.** `curl` the endpoint with the hidden field populated; expect a
   silent accept with nothing sent.
8. **Production.** Add the env vars in Vercel, redeploy, submit a real reply on
   the live site, confirm it arrives, then delete the test reply.
