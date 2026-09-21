-- One row per reply. Party members and dietary selections live in jsonb and
-- text[] rather than child tables: they are only ever read back whole, and a
-- wedding guest list is not worth four tables and three joins.
--
-- Deliberately no unique constraint on email. A guest who resubmits gets a
-- second row and the couple keeps the later one; silently rejecting a
-- resubmission is worse than a duplicate they can delete.

create table if not exists public.rsvps (
  id                     uuid primary key,
  received_at            timestamptz not null default now(),

  full_name              text not null,
  mobile                 text not null,
  email                  text not null,
  attending              text not null check (attending in ('accepts', 'declines')),

  -- [{ name, tbc }] and [{ name, age }], mirroring the client shapes exactly.
  extra_adults           jsonb not null default '[]'::jsonb,
  children               jsonb not null default '[]'::jsonb,
  -- Sortable counts for the venue, derived so they can never disagree with the
  -- arrays above. The primary guest is the +1 in adults_count.
  adults_count           int generated always as (1 + jsonb_array_length(extra_adults)) stored,
  children_count         int generated always as (jsonb_array_length(children)) stored,

  has_dietary_needs      boolean,  -- null = the guest never reached the question
  dietary_allergies      text[] not null default '{}',
  dietary_diets          text[] not null default '{}',
  dietary_other          text not null default '',
  -- Stored, not derived on read, so the row keeps the exact wording the guest
  -- approved on the review screen even if dietarySummary() is reworded later.
  dietary_summary        text not null default '',

  travelling_out_of_town boolean,
  overnight              boolean not null default false,
  parking                boolean not null default false,
  transport              boolean not null default false,

  message                text not null default '',  -- sent with an acceptance
  blessing               text not null default '',  -- sent with a decline

  user_agent             text,
  -- Set once the couple's notification email has gone out. A null here is the
  -- queryable list of replies nobody was told about.
  notified_at            timestamptz
);

create index if not exists rsvps_received_at_idx on public.rsvps (received_at desc);
create index if not exists rsvps_email_idx on public.rsvps (lower(email));

-- RLS on with zero policies denies the anon and authenticated roles outright.
-- The API route writes with the service-role key, which bypasses RLS entirely.
-- Guest names, numbers and dietary needs are never world-readable.
alter table public.rsvps enable row level security;
