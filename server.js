/**
 * MyHome API Server
 * Simple Express server with file-based storage for development
 */
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-secret-key-change-in-production'; // Change this in production!
const USERS_FILE = path.join(__dirname, 'data', 'users.json');

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON bodies

// ─── Helper Functions ───────────────────────────────────────

/**
 * Ensure data directory exists
 */
async function ensureDataDir() {
  const dataDir = path.join(__dirname, 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

/**
 * Read users from file
 */
async function readUsers() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // File doesn't exist yet, return empty array
    return [];
  }
}

/**
 * Write users to file
 */
async function writeUsers(users) {
  await ensureDataDir();
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
}

/**
 * Generate JWT token
 */
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Generate unique ID
 */
function generateId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
}

// ─── API Routes ─────────────────────────────────────────────

/**
 * POST /api/register
 * Register a new user
 */
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Read existing users
    const users = await readUsers();

    // Check if user already exists
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: generateId(),
      name: name || email.split('@')[0],
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    // Add to users array and save
    users.push(newUser);
    await writeUsers(users);

    // Generate token
    const token = generateToken(newUser);

    // Return user (without password) and token
    const { password: _, ...userWithoutPassword } = newUser;
    
    console.log(`[API] User registered: ${email}`);
    res.status(201).json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('[API] Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

/**
 * POST /api/login
 * Login with email and password
 */
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Read users
    const users = await readUsers();

    // Find user by email
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user);

    // Return user (without password) and token
    const { password: _, ...userWithoutPassword } = user;
    
    console.log(`[API] User logged in: ${email}`);
    res.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('[API] Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MyHome API is running' });
});

// ─── Start Server ───────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║     MyHome API Server Running          ║
║                                        ║
║  URL: http://localhost:${PORT}            ║
║  Health: http://localhost:${PORT}/api/health ║
║                                        ║
║  Press Ctrl+C to stop                  ║
╚════════════════════════════════════════╝
  `);
});
