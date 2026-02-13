require('dotenv').config({ path: './myhome-backend/.env' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

console.log('\n=== SUPABASE INITIALIZATION ===');
console.log('SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING');
console.log('SUPABASE_KEY type:', supabaseKey ? (supabaseKey.startsWith('eyJ') ? 'JWT (anon/service_role)' : 'Unknown format') : 'MISSING');
console.log('SUPABASE_KEY length:', supabaseKey?.length || 0);
console.log('Key prefix:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'N/A');

// Validate Supabase URL format
if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
  console.error('❌ CRITICAL: SUPABASE_URL must start with https://');
  console.error('Current URL:', supabaseUrl);
  console.error('Expected format: https://xxxxx.supabase.co');
  process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ CRITICAL: Supabase credentials missing!');
  console.error('Please check your .env file at: ./myhome-backend/.env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
});

console.log('Supabase client created successfully\n');

// 测试连接
async function testDB() {
  console.log('Testing database connection...');
  try {
    const { data, error } = await supabase.from('homes').select('*').limit(1);
    if (error) {
      console.error('❌ Database connection test failed:');
      console.error('  Message:', error.message);
      console.error('  Code:', error.code);
      console.error('  Details:', error.details);
      console.error('  Hint:', error.hint);
      console.error('\n⚠️  Common issues:');
      console.error('  1. Using anon key instead of service_role key');
      console.error('  2. RLS policies blocking access');
      console.error('  3. Table does not exist');
      console.error('  4. Invalid credentials');
      console.error('  5. Network/firewall blocking connection\n');
    } else {
      console.log('✅ Database connection successful!');
      console.log('  Homes table accessible:', data !== null);
      console.log('  Records found:', data?.length || 0);
    }
  } catch (err) {
    console.error('❌ Database test exception:', err.message);
    console.error('  Error code:', err.code);
    
    if (err.code === 'ECONNRESET' || err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT') {
      console.error('\n🔥 NETWORK ERROR DETECTED:');
      console.error('  Cannot connect to Supabase, check:');
      console.error('  1. Internet connection');
      console.error('  2. Supabase URL is correct');
      console.error('  3. Firewall/proxy settings');
      console.error('  4. Supabase service status\n');
    }
  }
  console.log('');
}
testDB();

/**
 * Helper function to detect Supabase connection errors
 */
function isSupabaseConnectionError(error) {
  if (!error) return false;
  
  const errorCode = error.code;
  const errorMessage = error.message?.toLowerCase() || '';
  
  return (
    errorCode === 'ECONNRESET' ||
    errorCode === 'ENOTFOUND' ||
    errorCode === 'ETIMEDOUT' ||
    errorCode === 'ECONNREFUSED' ||
    errorMessage.includes('network') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout')
  );
}

// 原来的代码继续...
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

// ─── JWT Middleware ─────────────────────────────────────────

/**
 * Verify JWT token and attach user to request
 * Uses our custom JWT tokens
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

/**
 * Verify Supabase Auth token and attach user to request
 * Alternative middleware using Supabase Auth
 */
async function authenticateSupabaseToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('[Auth] Token verification failed:', error?.message);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    req.user = {
      user_id: user.id,
      email: user.email,
      ...user
    };
    next();
  } catch (err) {
    console.error('[Auth] Token verification exception:', err.message);
    return res.status(401).json({ message: 'Token verification failed' });
  }
}

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

// ─── Authentication Routes ──────────────────────────────────

/**
 * POST /auth/register
 * Register a new user with Supabase Auth API
 */
app.post('/auth/register', async (req, res) => {
  console.log('\n=== REGISTER ENDPOINT HIT ===');
  console.log('Full request body:', JSON.stringify(req.body, null, 2));
  console.log('Content-Type header:', req.headers['content-type']);
  console.log('Body keys:', Object.keys(req.body));
  console.log('Email field:', req.body.email);
  console.log('Password field:', req.body.password ? '[PRESENT]' : '[MISSING]');
  console.log('Supabase client initialized:', supabase ? 'YES' : 'NO');

  try {
    const { email, password } = req.body;
    
    console.log('\n[Auth] Extracted values:');
    console.log('  email:', email);
    console.log('  password:', password ? `[${password.length} chars]` : '[MISSING]');

    if (!email || !password) {
      console.log('[Auth] Validation failed: Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (password.length < 6) {
      console.log('[Auth] Validation failed: Password too short');
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    console.log('[Auth] Step 1: Creating user with Supabase Auth...');
    
    let authData, authError;
    try {
      // Use Supabase Auth API to create user
      const result = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password: password,
        options: {
          emailRedirectTo: undefined, // Disable email confirmation redirect
        }
      });
      
      authData = result.data;
      authError = result.error;
    } catch (signUpException) {
      console.error('[Auth] Supabase Auth signup exception:');
      console.error('  Message:', signUpException.message);
      console.error('  Code:', signUpException.code);
      console.error('  Full error:', signUpException);
      
      if (isSupabaseConnectionError(signUpException)) {
        console.error('🔥 NETWORK ERROR: Cannot connect to Supabase, check URL and network');
        return res.status(503).json({ 
          message: 'Database connection failed',
          details: 'Cannot connect to Supabase. Please check your internet connection and try again.',
          error_type: 'network_error',
          error_code: signUpException.code
        });
      }
      
      return res.status(500).json({ 
        message: 'Server error during registration',
        details: signUpException.message
      });
    }

    if (authError) {
      console.error('[Auth] Supabase Auth signup error:');
      console.error('  Message:', authError.message);
      console.error('  Status:', authError.status);
      console.error('  Full error:', authError);
      
      if (isSupabaseConnectionError(authError)) {
        console.error('🔥 NETWORK ERROR: Cannot connect to Supabase, check URL and network');
        return res.status(503).json({ 
          message: 'Database connection failed',
          details: 'Cannot connect to Supabase. Please check your internet connection and try again.',
          error_type: 'network_error'
        });
      }
      
      return res.status(400).json({ 
        message: authError.message || 'Registration failed',
        details: authError.message,
        code: authError.status
      });
    }

    if (!authData.user) {
      console.error('[Auth] No user returned from signUp');
      return res.status(500).json({ message: 'Failed to create user' });
    }

    const newUser = authData.user;
    console.log('[Auth] User created successfully with ID:', newUser.id);
    console.log('[Auth] Email confirmation required:', !authData.session);

    console.log('[Auth] Step 2: Creating default home...');
    // Create default home for user
    try {
      const { error: homeError } = await supabase
        .from('homes')
        .insert([{
          owner_id: newUser.id,
          name: 'My Home',
          created_at: new Date().toISOString(),
        }]);

      if (homeError) {
        console.error('[Auth] Home creation error (non-fatal):');
        console.error('  Message:', homeError.message);
        console.error('  Code:', homeError.code);
        console.error('  Full error:', homeError);
      } else {
        console.log('[Auth] Default home created successfully');
      }
    } catch (homeErr) {
      console.error('[Auth] Exception during home creation (non-fatal):');
      console.error('  Message:', homeErr.message);
    }

    console.log('[Auth] Step 3: Generating JWT token...');
    // Generate our own JWT token for the app
    const token = jwt.sign(
      { user_id: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`[Auth] ✅ User registered successfully: ${email}`);
    res.status(201).json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        created_at: newUser.created_at,
      },
    });
  } catch (error) {
    console.error('\n[Auth] ❌ UNHANDLED REGISTRATION ERROR:');
    console.error('  Message:', error.message);
    console.error('  Stack:', error.stack);
    console.error('  Full error:', error);
    res.status(500).json({ 
      message: 'Server error during registration',
      details: error.message,
      stack: error.stack
    });
  }
});

/**
 * POST /auth/login
 * Login with email and password using Supabase Auth API
 */
app.post('/auth/login', async (req, res) => {
  console.log('\n=== LOGIN ENDPOINT HIT ===');
  console.log('Request body email:', req.body.email);
  console.log('Supabase client initialized:', supabase ? 'YES' : 'NO');

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      console.log('[Auth] Validation failed: Missing email or password');
      return res.status(400).json({ message: 'Email and password are required' });
    }

    console.log('[Auth] Step 1: Authenticating with Supabase Auth...');
    
    let authData, authError;
    try {
      // Use Supabase Auth API to sign in
      const result = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password,
      });
      
      authData = result.data;
      authError = result.error;
    } catch (signInException) {
      console.error('[Auth] Supabase Auth login exception:');
      console.error('  Message:', signInException.message);
      console.error('  Code:', signInException.code);
      console.error('  Full error:', signInException);
      
      if (isSupabaseConnectionError(signInException)) {
        console.error('🔥 NETWORK ERROR: Cannot connect to Supabase, check URL and network');
        return res.status(503).json({ 
          message: 'Database connection failed',
          details: 'Cannot connect to Supabase. Please check your internet connection and try again.',
          error_type: 'network_error',
          error_code: signInException.code
        });
      }
      
      return res.status(500).json({ 
        message: 'Server error during login',
        details: signInException.message
      });
    }

    if (authError) {
      console.error('[Auth] Supabase Auth login error:');
      console.error('  Message:', authError.message);
      console.error('  Status:', authError.status);
      console.error('  Full error:', authError);
      
      if (isSupabaseConnectionError(authError)) {
        console.error('🔥 NETWORK ERROR: Cannot connect to Supabase, check URL and network');
        return res.status(503).json({ 
          message: 'Database connection failed',
          details: 'Cannot connect to Supabase. Please check your internet connection and try again.',
          error_type: 'network_error'
        });
      }
      
      return res.status(401).json({ 
        message: authError.message || 'Invalid email or password',
        details: authError.message,
        code: authError.status
      });
    }

    if (!authData.user) {
      console.error('[Auth] No user returned from signIn');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = authData.user;
    console.log('[Auth] User authenticated successfully with ID:', user.id);

    console.log('[Auth] Step 2: Generating JWT token...');
    // Generate our own JWT token for the app
    const token = jwt.sign(
      { user_id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log(`[Auth] ✅ User logged in successfully: ${email}`);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error('\n[Auth] ❌ UNHANDLED LOGIN ERROR:');
    console.error('  Message:', error.message);
    console.error('  Stack:', error.stack);
    console.error('  Full error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      details: error.message,
      stack: error.stack
    });
  }
});

/**
 * GET /auth/me
 * Get current user info from JWT token
 */
app.get('/auth/me', async (req, res) => {
  console.log('\n=== GET /auth/me ENDPOINT HIT ===');
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('[Auth] No token provided');
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    console.log('[Auth] Verifying JWT token...');
    
    // First try to verify our custom JWT
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.error('[Auth] JWT verification failed:', err.message);
        return res.status(401).json({ message: 'Invalid or expired token' });
      }

      console.log('[Auth] JWT verified, user_id:', decoded.user_id);
      
      // Return user info from JWT
      res.json({
        user: {
          id: decoded.user_id,
          email: decoded.email,
        }
      });
    });
  } catch (error) {
    console.error('[Auth] Get user error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── API Routes ─────────────────────────────────────────────

/**
 * POST /api/register
 * Register a new user (LEGACY - kept for compatibility)
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

/**
 * POST /api/debug/echo
 * Debug endpoint to test body parsing
 */
app.post('/api/debug/echo', (req, res) => {
  console.log('\n=== ECHO ENDPOINT ===');
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  console.log('Body type:', typeof req.body);
  console.log('Body keys:', Object.keys(req.body));
  
  res.json({
    received: req.body,
    headers: req.headers,
    bodyType: typeof req.body,
    bodyKeys: Object.keys(req.body)
  });
});

/**
 * GET /api/debug/supabase-connection
 * Test Supabase connectivity
 */
app.get('/api/debug/supabase-connection', async (req, res) => {
  console.log('\n=== TESTING SUPABASE CONNECTION ===');
  
  const result = {
    timestamp: new Date().toISOString(),
    config: {
      url: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'MISSING',
      url_format_valid: supabaseUrl?.startsWith('https://') || false,
      key_present: !!supabaseKey,
      key_length: supabaseKey?.length || 0,
      key_type: supabaseKey?.startsWith('eyJ') ? 'JWT' : 'Unknown',
    },
    tests: {}
  };

  // Test 1: Simple select
  try {
    console.log('Test 1: Querying homes table...');
    const { data, error } = await supabase.from('homes').select('id').limit(1);
    
    result.tests.homes_table = {
      success: !error,
      error: error ? {
        message: error.message,
        code: error.code,
        hint: error.hint
      } : null,
      records_found: data?.length || 0
    };
    
    console.log('Test 1 result:', result.tests.homes_table.success ? 'PASS' : 'FAIL');
  } catch (err) {
    result.tests.homes_table = {
      success: false,
      exception: err.message,
      error_code: err.code,
      is_network_error: isSupabaseConnectionError(err)
    };
    console.error('Test 1 exception:', err.message);
  }

  // Test 2: Auth users table
  try {
    console.log('Test 2: Checking auth.users access...');
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    result.tests.auth_users = {
      success: !error,
      error: error ? {
        message: error.message,
        status: error.status
      } : null,
      users_count: users?.length || 0
    };
    
    console.log('Test 2 result:', result.tests.auth_users.success ? 'PASS' : 'FAIL');
  } catch (err) {
    result.tests.auth_users = {
      success: false,
      exception: err.message,
      error_code: err.code,
      is_network_error: isSupabaseConnectionError(err)
    };
    console.error('Test 2 exception:', err.message);
  }

  // Test 3: Network connectivity
  try {
    console.log('Test 3: Testing network connectivity...');
    const testUrl = new URL(supabaseUrl);
    result.tests.network = {
      hostname: testUrl.hostname,
      protocol: testUrl.protocol,
      reachable: true // If we got here, basic parsing works
    };
  } catch (err) {
    result.tests.network = {
      success: false,
      error: 'Invalid URL format'
    };
  }

  // Overall status
  const allTestsPassed = Object.values(result.tests).every(test => test.success !== false);
  result.overall_status = allTestsPassed ? 'HEALTHY' : 'ISSUES_DETECTED';

  console.log('Overall status:', result.overall_status);
  console.log('=== TEST COMPLETE ===\n');

  res.json(result);
});

/**
 * GET /api/debug/db-check
 * Debug endpoint to check database connectivity and schema
 */
app.get('/api/debug/db-check', async (req, res) => {
  const results = {
    supabase_initialized: !!supabase,
    env_vars: {
      url: !!process.env.SUPABASE_URL,
      key: !!process.env.SUPABASE_KEY,
      key_length: process.env.SUPABASE_KEY?.length || 0,
    },
    tables: {},
    errors: []
  };

  // Test users table
  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    results.tables.users = {
      accessible: !error,
      error: error ? { message: error.message, code: error.code, hint: error.hint } : null,
      sample_count: data?.length || 0
    };
  } catch (err) {
    results.tables.users = { accessible: false, exception: err.message };
    results.errors.push(`Users table: ${err.message}`);
  }

  // Test homes table
  try {
    const { data, error } = await supabase.from('homes').select('id').limit(1);
    results.tables.homes = {
      accessible: !error,
      error: error ? { message: error.message, code: error.code, hint: error.hint } : null,
      sample_count: data?.length || 0
    };
  } catch (err) {
    results.tables.homes = { accessible: false, exception: err.message };
    results.errors.push(`Homes table: ${err.message}`);
  }

  // Test items table
  try {
    const { data, error } = await supabase.from('items').select('id').limit(1);
    results.tables.items = {
      accessible: !error,
      error: error ? { message: error.message, code: error.code, hint: error.hint } : null,
      sample_count: data?.length || 0
    };
  } catch (err) {
    results.tables.items = { accessible: false, exception: err.message };
    results.errors.push(`Items table: ${err.message}`);
  }

  // Test insert capability (users table)
  try {
    const testEmail = `test_${Date.now()}@example.com`;
    const { error: insertError } = await supabase
      .from('users')
      .insert([{ 
        email: testEmail, 
        password_hash: 'test_hash',
        created_at: new Date().toISOString()
      }])
      .select();
    
    results.insert_test = {
      success: !insertError,
      error: insertError ? { 
        message: insertError.message, 
        code: insertError.code, 
        hint: insertError.hint,
        details: insertError.details 
      } : null
    };

    // Clean up test record if successful
    if (!insertError) {
      await supabase.from('users').delete().eq('email', testEmail);
    }
  } catch (err) {
    results.insert_test = { success: false, exception: err.message };
    results.errors.push(`Insert test: ${err.message}`);
  }

  console.log('\n=== DB CHECK RESULTS ===');
  console.log(JSON.stringify(results, null, 2));
  
  res.json(results);
});

/**
 * GET /api/items
 * Get all items for authenticated user
 */
app.get('/api/items', authenticateToken, async (req, res) => {
  try {
    // Get user's home
    const { data: homes } = await supabase
      .from('homes')
      .select('id')
      .eq('owner_id', req.user.user_id)
      .limit(1);

    if (!homes || homes.length === 0) {
      return res.json({ items: [] });
    }

    const homeId = homes[0].id;

    // Get items for this home
    const { data: items, error } = await supabase
      .from('items')
      .select('*')
      .eq('home_id', homeId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[API] Get items error:', error);
      return res.status(500).json({ message: 'Failed to fetch items' });
    }

    res.json({ items: items || [] });
  } catch (error) {
    console.error('[API] Get items error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * POST /api/items
 * Create new item for authenticated user
 */
app.post('/api/items', authenticateToken, async (req, res) => {
  try {
    const { name, room, notes, image } = req.body;

    if (!name || !room) {
      return res.status(400).json({ message: 'Name and room are required' });
    }

    // Get user's home
    const { data: homes } = await supabase
      .from('homes')
      .select('id')
      .eq('owner_id', req.user.user_id)
      .limit(1);

    if (!homes || homes.length === 0) {
      return res.status(404).json({ message: 'Home not found' });
    }

    const homeId = homes[0].id;

    // Create item
    const { data: newItem, error } = await supabase
      .from('items')
      .insert([{
        home_id: homeId,
        name,
        room,
        notes: notes || null,
        image: image || null,
        created_at: new Date().toISOString(),
      }])
      .select()
      .single();

    if (error) {
      console.error('[API] Create item error:', error);
      return res.status(500).json({ message: 'Failed to create item' });
    }

    res.status(201).json({ item: newItem });
  } catch (error) {
    console.error('[API] Create item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * DELETE /api/items/:id
 * Delete item (only if owned by user)
 */
app.delete('/api/items/:id', authenticateToken, async (req, res) => {
  try {
    const itemId = req.params.id;

    // Get user's home
    const { data: homes } = await supabase
      .from('homes')
      .select('id')
      .eq('owner_id', req.user.user_id)
      .limit(1);

    if (!homes || homes.length === 0) {
      return res.status(404).json({ message: 'Home not found' });
    }

    const homeId = homes[0].id;

    // Delete item (only if it belongs to user's home)
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId)
      .eq('home_id', homeId);

    if (error) {
      console.error('[API] Delete item error:', error);
      return res.status(500).json({ message: 'Failed to delete item' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('[API] Delete item error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ─── Static Files & SPA ─────────────────────────────────────

// Serve static files (CSS, JS, images)
app.use(express.static(__dirname));

// SPA fallback - MUST be last route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
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
