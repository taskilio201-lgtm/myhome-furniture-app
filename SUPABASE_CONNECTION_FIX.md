# Fixing Supabase ECONNRESET Error

## ✅ What I Added

### 1. Connection Error Detection
- Added `isSupabaseConnectionError()` helper function
- Detects: ECONNRESET, ENOTFOUND, ETIMEDOUT, ECONNREFUSED
- Returns 503 (Service Unavailable) instead of 500

### 2. Enhanced Error Messages
When connection fails, you'll see:
```
🔥 NETWORK ERROR: Cannot connect to Supabase, check URL and network
  Cannot connect to Supabase, check:
  1. Internet connection
  2. Supabase URL is correct
  3. Firewall/proxy settings
  4. Supabase service status
```

### 3. URL Format Validation
Server now checks on startup:
- SUPABASE_URL must start with `https://`
- Expected format: `https://xxxxx.supabase.co`
- Exits immediately if format is wrong

### 4. Debug Endpoint
Visit: `http://localhost:3000/api/debug/supabase-connection`

Tests:
- Homes table access
- Auth users access
- URL format validation
- Network connectivity

## 🔧 How to Fix ECONNRESET

### Step 1: Check Your .env File
Open: `myhome-backend/.env`

Should look like:
```env
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Common mistakes:**
- ❌ `SUPABASE_URL=http://...` (must be https)
- ❌ `SUPABASE_URL=xxxxx.supabase.co` (missing https://)
- ❌ Extra spaces or quotes around values
- ❌ Wrong key (anon vs service_role)

### Step 2: Verify Supabase URL
1. Go to Supabase Dashboard
2. Click your project
3. Go to Settings → API
4. Copy the **Project URL** (should start with https://)

Example: `https://abcdefghijklmnop.supabase.co`

### Step 3: Get the Correct Key
In Supabase Dashboard → Settings → API:

**For Backend (server.js):**
- Use: `service_role` key (secret)
- Length: ~200+ characters
- Starts with: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

**NOT the anon/public key!**

### Step 4: Test Connection
```bash
# Test if server can reach Supabase
curl http://localhost:3000/api/debug/supabase-connection
```

Should return:
```json
{
  "overall_status": "HEALTHY",
  "config": {
    "url": "https://xxxxx.supabase.co...",
    "url_format_valid": true,
    "key_present": true,
    "key_length": 234
  },
  "tests": {
    "homes_table": { "success": true },
    "auth_users": { "success": true }
  }
}
```

### Step 5: Check Network Issues

#### On Windows:
```bash
# Test if you can reach Supabase
ping xxxxx.supabase.co

# Check if port 443 is open
Test-NetConnection xxxxx.supabase.co -Port 443
```

#### Common Network Issues:
1. **Corporate Firewall**: Blocking external API calls
2. **VPN**: Interfering with connections
3. **Antivirus**: Blocking Node.js network access
4. **Proxy**: Not configured for Node.js

### Step 6: Restart Server
After fixing .env:
```bash
# Stop server (Ctrl+C)
# Start again
npm run dev
```

Look for:
```
=== SUPABASE INITIALIZATION ===
SUPABASE_URL: https://xxxxx.supabase.co...
SUPABASE_KEY type: JWT (anon/service_role)
SUPABASE_KEY length: 234
Supabase client created successfully

Testing database connection...
✅ Database connection successful!
```

## 🐛 Error Types Explained

### ECONNRESET
**Meaning**: Connection was forcefully closed
**Causes**:
- Firewall blocking connection
- Network timeout
- Supabase temporarily unavailable
- Wrong URL/endpoint

### ENOTFOUND
**Meaning**: Cannot resolve hostname
**Causes**:
- Wrong Supabase URL
- DNS issues
- No internet connection
- Typo in URL

### ETIMEDOUT
**Meaning**: Connection attempt timed out
**Causes**:
- Slow internet
- Firewall blocking
- Supabase service down

## ✅ Quick Checklist

- [ ] SUPABASE_URL starts with `https://`
- [ ] SUPABASE_URL ends with `.supabase.co`
- [ ] Using `service_role` key (not anon key)
- [ ] No extra spaces/quotes in .env
- [ ] Server restarted after .env changes
- [ ] Can ping Supabase hostname
- [ ] Firewall allows Node.js network access
- [ ] `/api/debug/supabase-connection` returns HEALTHY

## 🎯 Expected Behavior After Fix

### On Server Start:
```
✅ Database connection successful!
  Homes table accessible: true
```

### On Register:
```
=== REGISTER ENDPOINT HIT ===
Full request body: { "email": "...", "password": "..." }
[Auth] Step 1: Creating user with Supabase Auth...
[Auth] User created successfully with ID: ...
[Auth] ✅ User registered successfully: test@example.com
```

### On Network Error:
```
🔥 NETWORK ERROR: Cannot connect to Supabase, check URL and network
```

Frontend receives:
```json
{
  "message": "Database connection failed",
  "details": "Cannot connect to Supabase. Please check your internet connection and try again.",
  "error_type": "network_error"
}
```
