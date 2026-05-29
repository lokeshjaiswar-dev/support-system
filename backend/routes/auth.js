// backend/routes/auth.js
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, user_type: user.user_type, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      user_type: user.user_type
    }
  });
});

// Optional: Create user (only for manual use via postman)
router.post('/register', async (req, res) => {
  const { email, password, name, user_type = 2 } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const result = await db.run(
      'INSERT INTO users (email, password, name, user_type) VALUES (?, ?, ?, ?)',
      [email, hashedPassword, name, user_type]
    );
    res.status(201).json({ id: result.lastID, email, name, user_type });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: err.message });
  }
});

export default router;