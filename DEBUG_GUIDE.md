# Debugging Guide for 500 Errors

## Step 1: Check Server Startup Logs

When you start the server (`npm run dev`), you should see:

```
=== SUPABASE INITIALIZATION ===
SUPABASE_URL: https://xxxxx.supabase.co...
SUPABASE_KEY type: JWT (anon/service_role)
SUPABASE_KEY length: 200+ (service_role) or 100+ (anon)
Key prefix: eyJhbGciOiJIUzI1NiIs...
Supabase client created successfully

Testing database connection...
✅ Database connection successful!
  Homes table accessible: true
  Records found: 0
```

### If you see errors here:
- **"MISSING"** for URL/KEY → Check `.env` file exists at `./myhome-backend/.env`
- **"anon key"** → You're using the wrong key! Need `service_role` key
- **"RLS policies blocking access"** → Disable RLS or use service_role key

## Step 2: Test Database Connectivity

Visit: `http://localhost:3000/api/debug/db-check`

This will show:
- Which tables are accessible
- What errors are occurring
- If RLS is blocking access
- If you can insert records

## Step 3: Try to Register

When you submit the registration form, check terminal for:

```
=== REGISTER ENDPOINT HIT ===
Request body email: test@example.com
Supabase client initialized: YES
SUPABASE_URL loaded: YES
SUPABASE_KEY loaded: YES (length: 234)

[Auth] Step 1: Checking if user exists...
[Auth] Existing users found: 0
[Auth] Step 2: Hashing password...
[Auth] Password hashed successfully
[Auth] Step 3: Creating user in database...
```

### Common Errors:

#### Error: "new row violates row-level security policy"
**Solution:** 
1. Go to Supabase Dashboard → Authentication → Policies
2. Click on `users` table
3. Disable RLS OR add policy: `ENABLE INSERT FOR authenticated`
4. OR use `service_role` key instead of `anon` key

#### Error: "relation 'public.users' does not exist"
**Solution:**
1. Go to Supabase Dashboard → Table Editor
2. Create the `users` table with columns:
   - `id` (uuid, primary key, default: gen_random_uuid())
   - `email` (text, unique)
   - `password_hash` (text)
   - `created_at` (timestamptz)

#### Error: "JWT expired" or "invalid JWT"
**Solution:**
1. Your Supabase key might be wrong
2. Copy the correct key from Dashboard → Settings → API
3. Use **service_role** key (not anon key) for backend

## Step 4: Check .env File

Your `.env` file should look like:

```env
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...

# This should be the SERVICE_ROLE key (200+ characters)
# NOT the anon/public key (100+ characters)
```

## Step 5: Disable Email Confirmation

In Supabase Dashboard:
1. Go to Authentication → Settings
2. Find "Enable email confirmations"
3. Toggle it OFF
4. Save changes

## Step 6: Check RLS Policies

For each table (users, homes, items):
1. Go to Table Editor → Select table → RLS tab
2. Either:
   - **Option A:** Disable RLS completely (for development)
   - **Option B:** Add permissive policies:
     ```sql
     -- For service_role key (backend)
     CREATE POLICY "Service role bypass" ON users
     FOR ALL USING (true);
     ```

## Quick Fix Checklist

- [ ] Using `service_role` key (not anon key)
- [ ] RLS disabled on all tables OR proper policies set
- [ ] Email confirmation disabled in Supabase
- [ ] Tables exist with correct schema
- [ ] `.env` file in correct location
- [ ] Server restarted after .env changes

## Get Detailed Errors

The server now logs EVERYTHING. Check your terminal for:
- Full error messages
- Error codes
- Supabase hints
- Stack traces

Frontend also receives detailed errors in the response.
