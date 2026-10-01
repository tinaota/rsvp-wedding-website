-- Postal address, for thank-you cards after the day.
--
-- Purely additive: replies already stored keep every value they had, and
-- simply have no address. residence stays nullable on purpose — null means
-- "replied before we asked", which is how the mailing list below knows whom
-- to chase.
--
-- Run this BEFORE deploying the code that writes these columns. Otherwise the
-- insert names columns that do not exist and every reply fails with a 500.

alter table public.rsvps
  add column if not exists residence     text
    check (residence in ('australia', 'overseas')),
  add column if not exists address_line1 text not null default '',
  add column if not exists address_line2 text not null default '',
  add column if not exists suburb        text not null default '',
  add column if not exists state         text not null default '',
  add column if not exists postcode      text not null default '',
  add column if not exists country       text not null default '';

-- One row per household who replied, accepts and declines alike: both get a
-- card. Columns are split so the CSV can drive a mail merge for envelope
-- labels. Households who replied before the address was asked sort first, as
-- "Address needed".
create or replace view public.mailing_list
with (security_invoker = true) as
select
  case when r.residence is null then 'Address needed' else 'OK' end
                                             as "Status",
  r.full_name                                as "Name",
  case r.attending when 'accepts' then 'Coming' else 'Not coming' end
                                             as "Attending",
  -- Australia Post order: unit first, then street.
  concat_ws(', ', nullif(r.address_line2, ''), nullif(r.address_line1, ''))
                                             as "Street",
  upper(r.suburb)                            as "Suburb",
  r.state                                    as "State",
  r.postcode                                 as "Postcode",
  case
    when r.residence = 'australia' then 'Australia'
    else r.country
  end                                        as "Country",
  r.email                                    as "Email",
  r.mobile                                   as "Mobile"
from public.rsvps r
where not r.spam_suspected
order by (r.residence is not null), r.full_name;

-- Same treatment as the other views: obey the table's RLS, and drop the
-- default public grants. Addresses are more sensitive than anything else here.
revoke all on public.mailing_list from anon, authenticated;
