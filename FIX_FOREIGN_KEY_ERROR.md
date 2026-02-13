# Fix Foreign Key Constraint Error

## 🔴 The Problem

**Error:**
```
insert on table "homes" violates foreign key constraint "homes_owner_id_fkey"
Details: Key (owner_id)=(xxx) is not present in table "users"
```

**Root Cause:**
- `homes.owner_id` references `public.users(id)`
- But Supabase Auth stores users in `auth.users` (different schema)
- When we create a user with `supabase.auth.signUp()`, it goes to `auth.users`
- When we try to create a home with that user's ID, the foreign key fails

## ✅ The Solution

Update the foreign key to reference `auth.users` instead of `public.users`.

## 🔧 Step-by-Step Fix

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New query**

### Step 2: Run This SQL

Copy and paste this entire block:

```sql
-- Drop the incorrect foreign key
ALTER TABLE homes 
DROP CONSTRAINT IF EXISTS homes_owner_id_fkey;

-- Add correct foreign key to auth.users
ALTER TABLE homes
ADD CONSTRAINT homes_owner_id_fkey 
FOREIGN KEY (owner_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Verify items table foreign key is correct
ALTER TABLE items
DROP CONSTRAINT IF EXISTS items_home_id_fkey;

ALTER TABLE items
ADD CONSTRAINT items_home_id_fkey
FOREIGN KEY (home_id)
REFERENCES homes(id)
ON DELETE CASCADE;

-- Ensure image_url column exists
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS image_url TEXT;
```

Click **Run** (or press Ctrl+Enter)

### Step 3: Verify the Fix

Run this verification query:
```sql
SELECT
  tc.table_name, 
  kcu.column_name,
  ccu.table_schema AS foreign_schema,
  ccu.table_name AS foreign_table
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN ('homes', 'items');
```

**Expected result:**
| table_name | column_name | foreign_schema | foreign_table |
|------------|-------------|----------------|---------------|
| homes      | owner_id    | auth           | users         |
| items      | home_id     | public         | homes         |

✅ `homes.owner_id` → `auth.users` (correct!)

### Step 4: Test the Flow

1. Restart your backend server
2. Try to register a new user
3. Try to add an item
4. Check terminal logs

**Expected terminal output:**
```
=== CREATE ITEM ENDPOINT HIT ===
[API] Step 1: Finding user home...
[API] Homes found: 0
[API] No home found for user, creating default home...
[API] Default home created with ID: xyz-789
[API] Using home ID: xyz-789
[API] Step 3: Creating item in database...
[API] ✅ Item created successfully with ID: item-123
```

## 🗂️ Understanding the Schema

### Correct Architecture:

```
auth.users (Supabase managed)
    ↓ (owner_id references auth.users.id)
public.homes
    ↓ (home_id references homes.id)
public.items
```

### Why This Matters:

1. **auth.users** - Managed by Supabase Auth
   - Created by `supabase.auth.signUp()`
   - Handles password hashing, email verification
   - Secure and isolated

2. **public.homes** - Your app data
   - Links to auth.users via owner_id
   - One user can have multiple homes (future feature)

3. **public.items** - Your app data
   - Links to homes via home_id
   - Items belong to homes, homes belong to users

## 🚨 Common Mistakes

### ❌ Wrong: Creating public.users table
```sql
-- DON'T DO THIS
CREATE TABLE public.users (...);
```
**Why wrong**: Duplicates Supabase Auth, causes sync issues

### ✅ Correct: Reference auth.users directly
```sql
-- DO THIS
ALTER TABLE homes
ADD CONSTRAINT homes_owner_id_fkey 
FOREIGN KEY (owner_id) 
REFERENCES auth.users(id);
```

## 🧪 Verification Checklist

After running the SQL fix:

- [ ] Run verification query - shows auth.users reference
- [ ] Restart backend server
- [ ] Register new user - succeeds
- [ ] Add item - creates home automatically
- [ ] Item appears in items list
- [ ] No foreign key errors in terminal

## 💡 Alternative: Use Trigger (Advanced)

If you need a public.users table for app-specific data:

```sql
-- Create public.users for app data only
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  preferences JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-create public.users when auth.users is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, created_at)
  VALUES (NEW.id, NEW.created_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

But for V1, just reference `auth.users` directly - it's simpler!
