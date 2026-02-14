-- ============================================
-- Family Members Schema for MyHome App
-- ============================================

-- Table: home_members
-- Links users to homes with a role (owner / member)
CREATE TABLE IF NOT EXISTS home_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id UUID NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (home_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_home_members_home ON home_members(home_id);
CREATE INDEX IF NOT EXISTS idx_home_members_user ON home_members(user_id);

-- ============================================
-- Add room column to items if missing
-- ============================================

ALTER TABLE items ADD COLUMN IF NOT EXISTS room TEXT;

-- ============================================
-- Seed: when a home is created, auto-add owner as member
-- ============================================

CREATE OR REPLACE FUNCTION add_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO home_members (home_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'owner')
  ON CONFLICT (home_id, user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_home_add_owner
  AFTER INSERT ON homes
  FOR EACH ROW
  EXECUTE FUNCTION add_owner_as_member();

-- ============================================
-- Verify
-- ============================================

SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
