-- A tripped honeypot used to discard the reply outright. A real guest's browser
-- autofilled the hidden field and their RSVP was silently lost, which is the
-- one outcome this system exists to prevent.
--
-- Now nothing is ever discarded: a suspicious reply is stored like any other
-- and merely flagged, so the worst case is a junk row somebody deletes rather
-- than a guest who believes they replied and did not.

alter table public.rsvps
  add column if not exists spam_suspected boolean not null default false;

comment on column public.rsvps.spam_suspected is
  'Honeypot was filled. Stored anyway; no email was sent for this row.';
