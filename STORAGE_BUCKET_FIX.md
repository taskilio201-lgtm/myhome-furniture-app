# Fix "Fail to add item" Error - Storage Bucket Setup

## ✅ What I Fixed

### 1. Updated POST /api/items Endpoint
- ✅ Uses bucket name: `'photos'` (correct)
- ✅ Uploads images to Supabase Storage
- ✅ Stores `image_url` (not base64) in database
- ✅ Generates unique filenames: `{user_id}/{timestamp}-{random}.jpg`
- ✅ Creates default home if user doesn't have one
- ✅ Comprehensive error logging for every step

### 2. Image Upload Flow
1. Receives base64 image from frontend
2. Converts to Buffer
3. Uploads to `photos` bucket
4. Gets public URL
5. Stores URL in `items.image_url` column
6. If upload fails, continues without image (non-fatal)

### 3. Enhanced Error Logging
Now logs:
- User ID
- Item details
- Image size
- Upload bucket name
- File path
- Upload errors with full details
- Connection errors

## 🔧 Required Setup Steps

### Step 1: Create Storage Bucket
1. Go to Supabase Dashboard
2. Click **Storage** in sidebar
3. Click **New bucket**
4. Name: `photos`
5. Public: **No** (keep private)
6. Click **Create bucket**

### Step 2: Add RLS Policies
Go to **SQL Editor** and run:

```sql
-- Allow authenticated users to upload photos
CREATE POLICY "Allow authenticated uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'photos');

-- Allow authenticated users to read photos
CREATE POLICY "Allow authenticated reads"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'photos');

-- Allow users to delete their own photos
CREATE POLICY "Allow authenticated deletes"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'photos' AND (storage.foldername(name))[1] = auth.uid()::text);
```

**OR for quick testing:**
1. Go to Storage → photos bucket
2. Click **Policies** tab
3. Click **Disable RLS** (for development only)

### Step 3: Update Database Schema
Run in SQL Editor:

```sql
-- Add image_url column to items table
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Optional: Remove old image column
ALTER TABLE items DROP COLUMN IF EXISTS image;
```

### Step 4: Verify Setup
Visit: `http://localhost:3000/api/debug/supabase-connection`

Should show:
```json
{
  "overall_status": "HEALTHY",
  "tests": {
    "homes_table": { "success": true },
    "auth_users": { "success": true }
  }
}
```

## 🐛 Common Errors

### Error: "new row violates row-level security policy"
**Cause**: RLS is enabled but no policies exist
**Fix**: Run the SQL policies above OR disable RLS

### Error: "Bucket not found"
**Cause**: Bucket name is wrong or doesn't exist
**Fix**: 
1. Check bucket exists in Dashboard → Storage
2. Verify name is exactly `photos` (plural)
3. Backend uses: `supabase.storage.from('photos')`

### Error: "The resource already exists"
**Cause**: File with same name already exists
**Fix**: Already handled - using unique filenames with timestamp

### Error: "column 'image_url' does not exist"
**Cause**: Database schema not updated
**Fix**: Run the ALTER TABLE command above

## 📊 What Terminal Shows Now

### On Successful Item Creation:
```
=== CREATE ITEM ENDPOINT HIT ===
User ID: abc-123-def
Item name: Sofa
Item room: Living Room
Has image: true

[API] Step 1: Finding user home...
[API] Homes found: 1
[API] Using home ID: xyz-789

[API] Step 2: Uploading image to Supabase Storage...
[API] Uploading to bucket: photos
[API] File path: abc-123-def/1234567890-xyz123.jpg
[API] File size: 45678 bytes
[API] Image uploaded successfully: abc-123-def/1234567890-xyz123.jpg
[API] Public URL: https://xxxxx.supabase.co/storage/v1/object/public/photos/...

[API] Step 3: Creating item in database...
[API] ✅ Item created successfully with ID: item-123
```

### On Storage Error:
```
[API] Image upload error:
  Message: new row violates row-level security policy
  StatusCode: 403
  Error: Forbidden
[API] Continuing without image...
[API] ✅ Item created successfully with ID: item-123
```

## 🎯 Testing

1. **Restart server** after SQL changes
2. **Try to add item** with photo
3. **Check terminal** for detailed logs
4. **Check Supabase Storage** → photos bucket → Should see uploaded file
5. **Check items table** → Should see `image_url` populated

The item creation now handles storage properly and provides detailed error messages!
