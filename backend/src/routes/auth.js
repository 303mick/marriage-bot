const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { requireAuth } = require('../middleware/auth');
const { asyncHandler } = require('../asyncHandler');

const router = express.Router();

function issueToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, plan: user.plan }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
}

router.post('/signup', asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password || password.length < 8) {
    return res.status(400).json({ error: 'Email and a password of at least 8 characters are required' });
  }

  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rows.length) {
    return res.status(409).json({ error: 'An account with that email already exists' });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const { rows } = await pool.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, plan, created_at',
    [email.toLowerCase(), passwordHash]
  );
  const user = rows[0];
  res.status(201).json({ token: issueToken(user), user });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { rows } = await pool.query(
    'SELECT id, email, password_hash, plan FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  const user = rows[0];
  const valid = user && (await bcrypt.compare(password, user.password_hash));
  if (!valid) {
    return res.status(401).json({ error: 'Incorrect email or password' });
  }

  res.json({
    token: issueToken(user),
    user: { id: user.id, email: user.email, plan: user.plan },
  });
}));

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const { rows } = await pool.query('SELECT id, email, plan, created_at FROM users WHERE id = $1', [req.user.sub]);
  if (!rows.length) return res.status(404).json({ error: 'User not found' });
  res.json({ user: rows[0] });
}));

module.exports = router;
