// backend/routes/statuses.js
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { db } from '../database.js';

const router = express.Router();

// router.get('/', authenticateToken, async (req, res) => {
//   const statuses = await db.all('SELECT id, name FROM statuses ORDER BY id');
//   res.json(statuses);
// });
router.get('/',  async (req, res) => {
  const statuses = await db.all('SELECT id, name FROM statuses ORDER BY id');
  res.json(statuses);
});

export default router;