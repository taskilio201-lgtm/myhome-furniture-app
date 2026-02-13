# Debugging 400 Bad Request on /auth/register

## ✅ What I Added

### 1. Backend Logging (server.js)
The `/auth/register` endpoint now logs:
```
=== REGISTER ENDPOINT HIT ===
Full request body: { "email": "...", "password": "..." }
Content-Type header: application/json
Body keys: ['email', 'password']
Email field: test@example.com
Password field: [PRESENT] or [MISSING]
Supabase client initialized: YES

[Auth] Extracted values:
  email: test@example.com
  password: [8 chars]
```

### 2. Frontend Logging (js/auth.js)
The `Auth.register()` function now logs:
```
[Auth.register] Called with: { email: "...", password: "[PRESENT]" }
[Auth.register] Payload: {"email":"...","password":"..."}
[Auth.register] Response status: 400
[Auth.register] Response data: { message: "..." }
```

### 3. Debug Echo Endpoint
Test body parsing with: `POST /api/debug/echo`
```bash
curl -X POST http://localhost:3000/api/debug/echo \
  -H "Content-Type: application/json" \
  -d '{"test":"value"}'
```

## 🔍 How to Debug

### Step 1: Open Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Try to register

### Step 2: Check Frontend Logs
Look for:
```
[Auth.register] Called with: { email: "test@example.com", password: "[PRESENT]" }
[Auth.register] Payload: {"email":"test@example.com","password":"test123"}
[Auth.register] Response status: 400
[Auth.register] Response data: { message: "Email and password are required" }
```

**If you see `password: "[MISSING]"`** → Frontend is not sending password correctly

### Step 3: Check Backend Logs (Terminal)
Look for:
```
=== REGISTER ENDPOINT HIT ===
Full request body: { "email": "test@example.com", "password": "test123" }
Content-Type header: application/json
Body keys: ['email', 'password']
Email field: test@example.com
Password field: [PRESENT]
```

**If body is `{}`** → express.json() middleware issue
**If password is undefined** → Frontend sending wrong field name

### Step 4: Test Body Parsing
```bash
# Test if express.json() is working
curl -X POST http://localhost:3000/api/debug/echo \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

Should return:
```json
{
  "received": {
    "email": "test@test.com",
    "password": "test123"
  },
  "bodyType": "object",
  "bodyKeys": ["email", "password"]
}
```

## 🐛 Common Issues

### Issue 1: Body is Empty `{}`
**Cause**: express.json() middleware not working
**Fix**: Verify in server.js:
```javascript
app.use(express.json()); // Must be BEFORE routes
```

### Issue 2: Password is undefined
**Cause**: Frontend sending wrong field name
**Check**: 
- Frontend: `{ email, password }` ✅
- Backend expects: `req.body.email`, `req.body.password` ✅

### Issue 3: Content-Type Wrong
**Cause**: Frontend not setting correct header
**Fix**: Ensure fetch has:
```javascript
headers: { 'Content-Type': 'application/json' }
```

### Issue 4: CORS Error
**Cause**: CORS not enabled
**Fix**: Verify in server.js:
```javascript
app.use(cors()); // Must be BEFORE routes
```

## 📊 What to Look For

### Frontend Console Should Show:
```
[Auth.register] Called with: { email: "...", password: "[PRESENT]" }
[Auth.register] Payload: {"email":"...","password":"..."}
[Auth.register] Response status: 201  ← Success!
[Auth.register] Response data: { token: "...", user: {...} }
[Auth.register] Success! Token stored.
```

### Backend Terminal Should Show:
```
=== REGISTER ENDPOINT HIT ===
Full request body: {
  "email": "test@example.com",
  "password": "test123"
}
Content-Type header: application/json
Body keys: [ 'email', 'password' ]
Email field: test@example.com
Password field: [PRESENT]

[Auth] Extracted values:
  email: test@example.com
  password: [8 chars]

[Auth] Step 1: Creating user with Supabase Auth...
[Auth] User created successfully with ID: ...
[Auth] ✅ User registered successfully: test@example.com
```

## 🎯 Next Steps

1. Try to register a user
2. Check **both** browser console and terminal
3. Compare what frontend sends vs what backend receives
4. Look for the exact error message in the logs
5. Share the logs if issue persists

The detailed logging will show EXACTLY where the problem is!
