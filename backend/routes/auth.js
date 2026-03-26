// auth.js Route - Handles user registration and login
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../config/db');
require('dotenv').config();

// Generate JWT token helper
const generateToken = (user) => jwt.sign(
  { id: user.id, email: user.email, name: user.name },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// ==============================================
// POST /api/auth/register
// Creates a new user account
// ==============================================
router.post('/register', async (req, res) => {
  const { name, email, password, phone, age, blood_group } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ message: 'Name, email and password are required' });
  if (password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters' });

  try {
    // Check if email already exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existing)
      return res.status(400).json({ message: 'Email already registered. Please login.' });

    // Hash password before storing
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    // Insert new user
    const { data: user, error } = await supabase
      .from('users')
      .insert({ name, email: email.toLowerCase(), password_hash, phone, age: age || null, blood_group: blood_group || null })
      .select('id, name, email, created_at')
      .single();

    if (error) throw error;

    const token = generateToken(user);
    res.status(201).json({
      message: 'Account created successfully! Welcome to CureConnect.',
      user: { id: user.id, name: user.name, email: user.email },
      token
    });
  } catch (error) {
    console.error('Registration error:', error.message);
    res.status(500).json({ message: 'Server error during registration. Please try again.' });
  }
});

// ==============================================
// POST /api/auth/login
// ==============================================
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  try {
    const { data: user } = await supabase
      .from('users')
      .select('id, name, email, password_hash')
      .eq('email', email.toLowerCase())
      .single();

    if (!user)
      return res.status(401).json({ message: 'Invalid email or password' });

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid)
      return res.status(401).json({ message: 'Invalid email or password' });

    const token = generateToken(user);
    res.json({
      message: 'Login successful! Welcome back.',
      user: { id: user.id, name: user.name, email: user.email },
      token
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(500).json({ message: 'Server error during login. Please try again.' });
  }
});

// ==============================================
// GET /api/auth/me — returns current user profile
// ==============================================
const { protect } = require('../middleware/auth');

router.get('/me', protect, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, phone, age, blood_group, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
