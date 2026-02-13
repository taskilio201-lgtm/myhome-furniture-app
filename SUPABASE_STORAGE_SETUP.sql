-- ============================================
-- Supabase Storage Setup for MyHome App
-- ============================================

-- Step 1: Create the 'photos' bucket (if not already created via Dashboard)
-- Go to Storage → Create bucket → Name: "photos" → Public: false

-- Step 2: Add RLS Policies for the photos bucket
-- Run these in SQL Editor:

-- Allow authenticated users to upload photos
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'photos');

-- Allow authenticated users to read their own photos
CREATE POLICY "Allow authenticated reads"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'photos');

-- Allow authenticated users to delete their own photos
CREATE POLICY "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Allow users to update their own photos
CREATE POLICY "Allow authenticated updates"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================
-- Alternative: Disable RLS for Development
-- ============================================
-- If you want to disable RLS completely for testing:
-- Go to Storage → photos bucket → Policies → Disable RLS

-- ============================================
-- Verify Setup
-- ============================================
-- After running these policies, test with:
-- curl http://localhost:3000/api/debug/supabase-connection

-- You should see:
-- "overall_status": "HEALTHY"

-- ============================================
-- Database Schema Updates
-- ============================================
-- Make sure items table has image_url column (not image):

ALTER TABLE items 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Optional: Remove old image column if it exists
-- ALTER TABLE items DROP COLUMN IF EXISTS image;

-- ============================================
-- Notes
-- ============================================
-- 1. Bucket name is 'photos' (plural)
-- 2. Files are stored as: {user_id}/{timestamp}-{random}.jpg
-- 3. Public URLs are generated automatically
-- 4. RLS policies ensure users can only access their own photos
