-- DIAB — asset storage bucket + policies for Inline Asset Approval (feature 6).
-- Run after 0001_init_rls.sql.

-- Private bucket for creative assets (images in MVP; video in v1.1).
insert into storage.buckets (id, name, public)
values ('assets', 'assets', false)
on conflict (id) do nothing;

-- Objects are foldered by owner: {user_id}/{deliverable_id}/{filename}
-- so a user can only read/write files under their own prefix.
create policy assets_read on storage.objects for select to authenticated
  using (bucket_id = 'assets' and (storage.foldername(name))[1] = auth.uid()::text);

create policy assets_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'assets' and (storage.foldername(name))[1] = auth.uid()::text);

create policy assets_delete on storage.objects for delete to authenticated
  using (bucket_id = 'assets' and (storage.foldername(name))[1] = auth.uid()::text);
