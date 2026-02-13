-- ============================================
-- Fix Foreign Key Constraints for MyHome App
-- ============================================
-- Problem: homes.owner_id references public.users but Supabase Auth uses auth.users
-- Solution: Update foreign key to reference auth.users

-- ============================================
-- STEP 1: Drop existing foreign key constraint
-- ============================================

ALTER TABLE homes 
DROP CONSTRAINT IF EXISTS homes_owner_id_fkey;

-- ============================================
-- STEP 2: Add correct foreign key to auth.users
-- ============================================

ALTER TABLE homes
ADD CONSTRAINT homes_owner_id_fkey 
FOREIGN KEY (owner_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- ============================================
-- STEP 3: Verify items table foreign key
-- ============================================

-- Check if items.home_id constraint exists and is correct
ALTER TABLE items
DROP CONSTRAINT IF EXISTS items_home_id_fkey;

ALTER TABLE items
ADD CONSTRAINT items_home_id_fkey
FOREIGN KEY (home_id)
REFERENCES homes(id)
ON DELETE CASCADE;

-- ============================================
-- STEP 4: Update column types if needed
-- ============================================

-- Ensure owner_id is UUID type (matching auth.users.id)
-- ALTER TABLE homes ALTER COLUMN owner_id TYPE UUID USING owner_id::UUID;

-- Ensure home_id is UUID type
-- ALTER TABLE items ALTER COLUMN home_id TYPE UUID USING home_id::UUID;

-- ============================================
-- STEP 5: Drop public.users table if not needed
-- ============================================
-- WARNING: Only run this if you're NOT using public.users for anything

-- DROP TABLE IF EXISTS public.users CASCADE;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check foreign key constraints
SELECT
  tc.table_name, 
  tc.constraint_name, 
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('homes', 'items');

-- Check if tables exist
SELECT table_schema, table_name 
FROM information_schema.tables 
WHERE table_name IN ('users', 'homes', 'items')
ORDER BY table_schema, table_name;

-- ============================================
-- COMPLETE SCHEMA (if starting fresh)
-- ============================================

/*
-- homes table
CREATE TABLE IF NOT EXISTS homes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- items table
CREATE TABLE IF NOT EXISTS items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  home_id UUID NOT NULL REFERENCES homes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  room TEXT NOT NULL,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_homes_owner_id ON homes(owner_id);
CREATE INDEX IF NOT EXISTS idx_items_home_id ON items(home_id);
CREATE INDEX IF NOT EXISTS idx_items_created_at ON items(created_at DESC);
*/
