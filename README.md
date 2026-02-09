# MyHome App

Furniture management mobile web app with vanilla JavaScript frontend and Node.js backend.

## Project Structure

```
MyHome-App/
├── index.html              # Frontend entry point
├── js/                     # Frontend JavaScript
│   ├── api.js             # API helper
│   ├── auth.js            # Authentication module
│   ├── storage.js         # Local storage helper
│   ├── router.js          # SPA router
│   ├── app.js             # App bootstrap
│   ├── components/        # Reusable components
│   └── views/             # Page views
├── server.js              # Backend API server
├── data/                  # User data (JSON files)
└── package.json           # Dependencies
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Backend Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

Server will run on **http://localhost:3000**

### 3. Open the Frontend

Open `index.html` in your browser, or use a local server:

```bash
# Using Python
python -m http.server 8080

# Using Node (install http-server globally)
npx http-server -p 8080
```

Then visit **http://localhost:8080**

## API Endpoints

### Authentication

- **POST /api/register** - Create new account
  ```json
  Request:  { "name": "John", "email": "john@example.com", "password": "secret123" }
  Response: { "user": {...}, "token": "..." }
  ```

- **POST /api/login** - Login to existing account
  ```json
  Request:  { "email": "john@example.com", "password": "secret123" }
  Response: { "user": {...}, "token": "..." }
  ```

- **GET /api/health** - Check server status

## Features

- ✅ User authentication (register/login)
- ✅ JWT token-based auth
- ✅ Password hashing with bcrypt
- ✅ File-based user storage
- ✅ Mobile-first responsive UI
- ✅ SPA routing
- ✅ Protected routes

## Tech Stack

**Frontend:**
- Vanilla JavaScript (no frameworks)
- CSS3 with CSS variables
- Hash-based SPA routing

**Backend:**
- Node.js + Express
- JWT for authentication
- bcrypt for password hashing
- File-based storage (JSON)

## Development

The backend stores user data in `data/users.json`. This file is auto-created on first user registration.

**Security Note:** The JWT secret is hardcoded for development. Change it in production!

## License

MIT
