# Authentication Flow Update

## ✅ Implemented Features

### 1. Auth Module Enhancements (js/auth.js)

#### New Functions:
- **`verifyAuth()`** - Calls GET /auth/me to verify token validity
  - Returns `{ valid: boolean, user?: object }`
  - Auto-clears localStorage if token is invalid
  - Updates stored user info if valid

- **`requireAuth()`** - Enforces authentication on protected pages
  - Calls verifyAuth() internally
  - Redirects to #/login if not authenticated
  - Returns boolean for success/failure

### 2. Header Component (js/components/header.js)

#### Features:
- **User Email Display**: Shows current user's email in header
- **Loading State**: Shows "加载中..." while fetching user info
- **Unauthenticated State**: Shows "未登录" if no valid token
- **Logout Button**: Icon button that appears when logged in
- **Logout Flow**:
  1. Clears token from localStorage
  2. Shows toast notification
  3. Redirects to login page

#### New Function:
- **`init()`** - Called after header renders
  - Fetches user info from /auth/me
  - Updates UI with email
  - Binds logout event

### 3. App Shell (js/app.js)

#### Changes:
- **`renderShell()`** now calls `Header.init()` instead of `bindLogoutEvent()`
- **`protectedRoute()`** now uses async `Auth.requireAuth()`
  - Verifies token with backend on every protected route access
  - Auto-redirects to login if token expired

### 4. Protected Routes

All these routes now verify authentication with backend:
- `/home` - Home screen
- `/items` - Items list
- `/add-item` - Add new item
- `/settings` - Settings page

### 5. CSS Updates (index.html)

Added styles for:
- `.app-header__user` - User info container
- `.app-header__email` - Email display (with ellipsis)
- `.app-header__logout` - Logout button with hover/active states

## 🔄 Authentication Flow

### On Page Load (Protected Route):
1. User navigates to protected route (e.g., #/home)
2. `protectedRoute()` calls `Auth.requireAuth()`
3. `requireAuth()` calls `Auth.verifyAuth()`
4. `verifyAuth()` sends GET /auth/me with token
5. If 401: Clear localStorage → Redirect to #/login
6. If 200: Update user info → Allow access

### Header Display:
1. Header renders with "加载中..."
2. `Header.init()` calls `Auth.verifyAuth()`
3. If valid: Display email + show logout button
4. If invalid: Display "未登录"

### Logout Flow:
1. User clicks logout button
2. `Auth.logout()` clears localStorage
3. Toast notification shown
4. Redirect to #/login after 800ms

## 🔐 Security Benefits

1. **Token Verification**: Every protected route verifies token with backend
2. **Auto-Logout**: Invalid/expired tokens automatically clear session
3. **No Stale Data**: User info refreshed on every auth check
4. **Backend Authority**: Frontend can't fake authentication

## 📝 Usage Example

```javascript
// Protected route automatically checks auth
Router.register('/home', protectedRoute(HomeView.render));

// Manual auth check
const isAuth = await Auth.requireAuth();
if (isAuth) {
  // User is authenticated
}

// Get current user
const user = Auth.getCurrentUser(); // From localStorage
// OR
const result = await Auth.verifyAuth(); // From backend
if (result.valid) {
  console.log(result.user.email);
}
```

## 🧪 Testing

1. **Login** → Token saved → Header shows email
2. **Refresh page** → Token verified → Still logged in
3. **Click logout** → Token cleared → Redirected to login
4. **Try accessing /home without login** → Auto-redirect to login
5. **Delete token from localStorage** → Next page load redirects to login
