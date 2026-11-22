const express = require('express');
const db = require('../config/db');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// GET /api/notifications
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    await db.query(
      `UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;