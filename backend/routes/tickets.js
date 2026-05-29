// backend/routes/tickets.js
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { db } from '../database.js';
import { v4 as uuidv4 } from 'uuid'; // npm install uuid

const router = express.Router();

// Helper to generate ticket_id like TKT-001
async function generateTicketId() {
  const lastTicket = await db.get('SELECT ticket_id FROM tickets ORDER BY id DESC LIMIT 1');
  if (!lastTicket) return 'TKT-001';
  const lastNum = parseInt(lastTicket.ticket_id.split('-')[1]);
  const nextNum = (lastNum + 1).toString().padStart(3, '0');
  return `TKT-${nextNum}`;
}

// GET /api/tickets - list tickets with search & filter
router.get('/', authenticateToken, async (req, res) => {
  const { status, search } = req.query;
  const userId = req.user.id;
  const userType = req.user.user_type;

  let query = `
    SELECT t.*, s.name as status_name 
    FROM tickets t
    JOIN statuses s ON t.status_id = s.id
  `;
  const conditions = [];
  const params = [];

  if (userType !== 1) {
    conditions.push('t.created_by = ?');
    params.push(userId);
  }

  if (status) {
    conditions.push('s.name = ?');
    params.push(status);
  }

  if (search) {
    conditions.push(`(
      t.customer_name LIKE ? OR 
      t.customer_email LIKE ? OR 
      t.subject LIKE ? OR 
      t.description LIKE ? OR 
      t.ticket_id LIKE ?
    )`);
    const like = `%${search}%`;
    params.push(like, like, like, like, like);
  }

  if (conditions.length) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY t.created_at DESC';

  const tickets = await db.all(query, params);
  res.json(tickets);
});

// GET /api/tickets/:id
router.get('/:id', authenticateToken, async (req, res) => {
  const ticketId = req.params.id;
  const userId = req.user.id;
  const userType = req.user.user_type;

  const ticket = await db.get(`
    SELECT t.*, s.name as status_name 
    FROM tickets t
    JOIN statuses s ON t.status_id = s.id
    WHERE t.id = ?
  `, [ticketId]);

  if (!ticket) {
    return res.status(404).json({ message: 'Ticket not found' });
  }

  // Check permission
  if (userType !== 1 && ticket.created_by !== userId) {
    return res.status(403).json({ message: 'Access denied' });
  }

  // Get notes
  const notes = await db.all(`
    SELECT n.*, u.name as user_name 
    FROM notes n
    JOIN users u ON n.created_by = u.id
    WHERE n.ticket_id = ?
    ORDER BY n.created_at ASC
  `, [ticketId]);

  res.json({ ...ticket, notes });
});

// POST /api/tickets
router.post('/', authenticateToken, async (req, res) => {
  const { customer_name, customer_email, subject, description } = req.body;
  if (!customer_name || !customer_email || !subject || !description) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const ticket_id = await generateTicketId();
  const status_id = 1; // Open
  const created_by = req.user.id;

  const result = await db.run(`
    INSERT INTO tickets (ticket_id, customer_name, customer_email, subject, description, status_id, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [ticket_id, customer_name, customer_email, subject, description, status_id, created_by]);

  res.status(201).json({
    ticket_id,
    created_at: new Date().toISOString(),
    id: result.lastID
  });
});

// PUT /api/tickets/:id - update status and add note
router.put('/:id', authenticateToken, async (req, res) => {
  const ticketId = req.params.id;
  const { status, notes } = req.body;
  const userId = req.user.id;
  const userType = req.user.user_type;

  // Check permission
  const ticket = await db.get('SELECT * FROM tickets WHERE id = ?', [ticketId]);
  if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
  if (userType !== 1 && ticket.created_by !== userId) {
    return res.status(403).json({ message: 'Access denied' });
  }

  let statusId = ticket.status_id;
  if (status) {
    const statusRow = await db.get('SELECT id FROM statuses WHERE name = ?', [status]);
    if (!statusRow) return res.status(400).json({ message: 'Invalid status' });
    statusId = statusRow.id;
  }

  await db.run(`
    UPDATE tickets SET status_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `, [statusId, ticketId]);

  // Add note if provided
  if (notes && notes.trim()) {
    await db.run(`
      INSERT INTO notes (ticket_id, note_text, created_by) VALUES (?, ?, ?)
    `, [ticketId, notes.trim(), userId]);
  }

  res.json({ success: true, updated_at: new Date().toISOString() });
});

export default router;