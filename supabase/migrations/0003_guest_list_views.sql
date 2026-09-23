-- Readable views for whoever is handing numbers to the venue.
--
-- The base table stores party members as jsonb and dietary needs as arrays,
-- which is right for the application and unreadable for catering. These views
-- flatten both into plain text, so the Table Editor's "Export CSV" produces a
-- spreadsheet someone can actually work from.

-- One row per household who is coming.
create or replace view public.guest_list
with (security_invoker = true) as
select
  r.full_name                          as "Replied by",
  r.mobile                             as "Mobile",
  r.email                              as "Email",
  r.adults_count                       as "Adults",
  r.children_count                     as "Children",
  r.adults_count + r.children_count    as "Total",
  -- Named guests beyond the person who replied; "and guest" stays visible as
  -- a name still to come rather than silently becoming a blank.
  coalesce(nullif(array_to_string(array(
    select case when (a->>'tbc')::boolean then 'Guest (name to follow)'
                else nullif(a->>'name', '') end
    from jsonb_array_elements(r.extra_adults) a
  ), ', '), ''), '—')                  as "Other adults",
  coalesce(nullif(array_to_string(array(
    select coalesce(nullif(c->>'name',''), 'Child') ||
           case when nullif(c->>'age','') is null then ''
                else ' (' || (c->>'age') || ')' end
    from jsonb_array_elements(r.children) c
  ), ', '), ''), '—')                  as "Children names",
  case
    when r.has_dietary_needs is null then 'Not answered'
    when r.has_dietary_needs then r.dietary_summary
    else 'None'
  end                                  as "Dietary",
  case when r.travelling_out_of_town then 'Yes' else 'No' end as "From out of town",
  concat_ws(', ',
    nullif(case when r.overnight then 'Staying at The Langham' end, ''),
    nullif(case when r.parking   then 'Needs parking' end, ''),
    nullif(case when r.transport then 'Wants transport help' end, '')
  )                                    as "Logistics",
  r.message                            as "Message",
  r.received_at                        as "Replied at"
from public.rsvps r
where r.attending = 'accepts'
  and not r.spam_suspected
order by r.received_at;

-- Every dietary requirement, one line each, for the kitchen.
create or replace view public.catering_needs
with (security_invoker = true) as
select
  r.full_name as "Household",
  r.adults_count + r.children_count as "Covers",
  x.requirement as "Requirement"
from public.rsvps r
cross join lateral (
  select unnest(r.dietary_allergies) as requirement
  union all
  select unnest(r.dietary_diets)
  union all
  select r.dietary_other where nullif(trim(r.dietary_other), '') is not null
) x
where r.attending = 'accepts'
  and not r.spam_suspected
  and r.has_dietary_needs
order by x.requirement, r.full_name;

-- The single number the venue asks for, plus the decline count.
create or replace view public.headcount
with (security_invoker = true) as
select
  count(*) filter (where attending = 'accepts')                  as "Households coming",
  coalesce(sum(adults_count)   filter (where attending = 'accepts'), 0) as "Adults",
  coalesce(sum(children_count) filter (where attending = 'accepts'), 0) as "Children",
  coalesce(sum(adults_count + children_count)
           filter (where attending = 'accepts'), 0)              as "Total covers",
  count(*) filter (where attending = 'declines')                 as "Declined",
  count(*) filter (where attending = 'accepts'
                     and has_dietary_needs)                      as "With dietary needs"
from public.rsvps
where not spam_suspected;

-- security_invoker makes the views obey the table's row level security, and
-- the revoke removes the default grants Supabase gives new objects. Either
-- alone would keep guests' phone numbers private; both is belt and braces.
-- The dashboard and the service key still read them normally.
revoke all on public.guest_list, public.catering_needs, public.headcount from anon, authenticated;
