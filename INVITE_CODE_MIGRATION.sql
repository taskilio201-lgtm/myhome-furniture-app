-- ============================================
-- Complete Family Feature Migration
-- Run this ONCE in Supabase SQL Editor
-- ============================================

-- 1. Add invite_code column to homes (if missing)
ALTER TABLE public.homes ADD COLUMN IF NOT EXISTS invite_code TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_homes_invite_code
  ON public.homes(invite_code)
  WHERE invite_code IS NOT NULL;

-- 2. Create home_members table
CREATE TABLE IF NOT EXISTS public.home_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id UUID NOT NULL REFERENCES public.homes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (home_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_home_members_home_id ON public.home_members(home_id);
CREATE INDEX IF NOT EXISTS idx_home_members_user_id ON public.home_members(user_id);

-- 3. Enable RLS (backend uses service_role key so it bypasses RLS,
--    but we enable it for security if the anon key is ever used)
ALTER TABLE public.home_members ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access (this is the default, but explicit is good)
-- For anon/authenticated users, allow read of own memberships
CREATE POLICY "Users can view their own memberships"
  ON public.home_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view co-members of shared homes"
  ON public.home_members FOR SELECT
  USING (
    home_id IN (
      SELECT hm.home_id FROM public.home_members hm WHERE hm.user_id = auth.uid()
    )
  );

CREATE POLICY "Service can insert members"
  ON public.home_members FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service can delete members"
  ON public.home_members FOR DELETE
  USING (true);

-- 4. Auto-add owner as member when home is created
CREATE OR REPLACE FUNCTION add_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.home_members (home_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner')
  ON CONFLICT (home_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_home_add_owner ON public.homes;
CREATE TRIGGER tr_home_add_owner
  AFTER INSERT ON public.homes
  FOR EACH ROW
  EXECUTE FUNCTION add_owner_as_member();

-- 5. Backfill: add existing home owners as members (idempotent)
INSERT INTO public.home_members (home_id, user_id, role)
SELECT h.id, h.owner_id, 'owner'
FROM public.homes h
WHERE NOT EXISTS (
  SELECT 1 FROM public.home_members hm
  WHERE hm.home_id = h.id AND hm.user_id = h.owner_id
);

-- 6. Verify
SELECT 'homes columns' AS check_type, column_name, data_type
FROM information_schema.columns
WHERE table_name = 'homes' AND table_schema = 'public'
UNION ALL
SELECT 'home_members columns', column_name, data_type
FROM information_schema.columns
WHERE table_name = 'home_members' AND table_schema = 'public'
ORDER BY check_type, column_name;
