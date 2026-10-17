grant delete on table public.interest_signups to anon;

create policy "anonymous users can delete expired unreviewed signups"
on public.interest_signups
for delete
to anon
using (
  reviewed_at is null
  and created_at < now() - interval '6 months'
);
