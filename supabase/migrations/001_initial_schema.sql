-- ============================================================
-- NBA REMUNERATION PORTAL — Initial Schema
-- Run this in the Supabase SQL Editor (once, top to bottom)
-- ============================================================

-- ─────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────
create table if not exists public.profiles (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid unique references auth.users(id) on delete cascade not null,
  first_name      text,
  surname         text,
  middle_name     text,
  email           text,
  phone           text,
  ban             text,            -- Bar Admission Number
  year_of_call    text,
  branch          text,
  office_address  text,
  portal_access   text not null default 'remuneration',
  status          text not null default 'pending',  -- pending | active | suspended
  avatar_url      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Users can read and write their own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- Authenticated users can view all profiles (needed for admin member list)
create policy "Authenticated users can view all profiles"
  on public.profiles for select
  using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────
-- DOCUMENTS
-- ─────────────────────────────────────────
create table if not exists public.documents (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete cascade not null,
  title               text not null,
  document_type       text not null,
  content             text,
  form_data           jsonb,
  status              text not null default 'draft',       -- draft | completed
  reference_number    text,
  ban                 text,
  approval_status     text not null default 'pending',     -- pending | submitted | approved | rejected
  submitted_at        timestamptz,
  submitted_by        uuid,
  approved_at         timestamptz,
  approved_by         uuid,
  approver_comments   text,
  rejected_at         timestamptz,
  rejected_by         uuid,
  rejection_reason    text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.documents enable row level security;

-- Users can manage their own documents
create policy "Users can view own documents"
  on public.documents for select
  using (auth.uid() = user_id);

create policy "Users can insert own documents"
  on public.documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own documents"
  on public.documents for update
  using (auth.uid() = user_id);

create policy "Users can delete own draft documents"
  on public.documents for delete
  using (auth.uid() = user_id and status = 'draft');

-- Authenticated users can view all documents (for admin and Find a Document)
create policy "Authenticated users can view all documents"
  on public.documents for select
  using (auth.role() = 'authenticated');

-- Authenticated users can update any document (for admin approve/reject/complete)
create policy "Authenticated users can update any document"
  on public.documents for update
  using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────
-- DOCUMENT VERSIONS
-- ─────────────────────────────────────────
create table if not exists public.document_versions (
  id              uuid primary key default gen_random_uuid(),
  document_id     uuid references public.documents(id) on delete cascade not null,
  version_number  int not null,
  content         text,
  form_data       jsonb,
  created_by      uuid references auth.users(id),
  created_at      timestamptz not null default now()
);

alter table public.document_versions enable row level security;

create policy "Authenticated users can manage document versions"
  on public.document_versions for all
  using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade not null,
  title       text not null,
  message     text,
  type        text,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.notifications enable row level security;

-- Users can read and update their own notifications
create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- Any authenticated user can insert notifications (admin sending to members)
create policy "Authenticated users can insert notifications"
  on public.notifications for insert
  with check (auth.role() = 'authenticated');

-- ─────────────────────────────────────────
-- ANNOUNCEMENTS
-- ─────────────────────────────────────────
create table if not exists public.announcements (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  content     text,
  portal      text not null default 'remuneration',  -- remuneration | anaocha | both
  published   boolean not null default false,
  created_by  uuid references auth.users(id),
  created_at  timestamptz not null default now()
);

alter table public.announcements enable row level security;

-- All authenticated users can read published announcements
create policy "Authenticated users can view announcements"
  on public.announcements for select
  using (auth.role() = 'authenticated');

-- Any authenticated user can manage announcements (admin checked at app level)
create policy "Authenticated users can manage announcements"
  on public.announcements for all
  using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────
-- RESOURCES
-- ─────────────────────────────────────────
create table if not exists public.resources (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text,
  category    text not null default 'General',  -- Legal Compliance | Branch Documents | Practice Guides | General
  type        text not null default 'PDF',       -- PDF | Guide | Link
  portal      text not null default 'both',      -- both | remuneration | anaocha
  file_url    text,
  created_at  timestamptz not null default now()
);

alter table public.resources enable row level security;

create policy "Authenticated users can view resources"
  on public.resources for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can manage resources"
  on public.resources for all
  using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────
-- CONTACT MESSAGES
-- ─────────────────────────────────────────
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  email       text not null,
  message     text not null,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Anyone can insert a contact message (public contact form)
create policy "Anyone can submit contact messages"
  on public.contact_messages for insert
  with check (true);

-- Authenticated users (admins) can view and update contact messages
create policy "Authenticated users can view contact messages"
  on public.contact_messages for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can update contact messages"
  on public.contact_messages for update
  using (auth.role() = 'authenticated');

-- ─────────────────────────────────────────
-- STORAGE BUCKETS
-- ─────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('resources', 'resources', true)
on conflict (id) do nothing;

-- Avatar upload/delete policies
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Avatars are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Resources upload/delete policies
create policy "Authenticated users can upload resources"
  on storage.objects for insert
  with check (bucket_id = 'resources' and auth.role() = 'authenticated');

create policy "Resources are publicly readable"
  on storage.objects for select
  using (bucket_id = 'resources');

create policy "Authenticated users can delete resources"
  on storage.objects for delete
  using (bucket_id = 'resources' and auth.role() = 'authenticated');

-- ─────────────────────────────────────────
-- TRIGGER: auto-update updated_at
-- ─────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger documents_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────
-- TRIGGER: auto-create profile on sign-up
-- ─────────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (user_id, email, portal_access, status)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'portal_access', 'remuneration'),
    'pending'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
