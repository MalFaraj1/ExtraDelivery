const express = require('express');
const db = require('../config/db');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// POST /api/user/:id/report
router.post('/:id', authenticateToken, async (req, res) => {
  const reporterId = req.user.id;
  const reportedId = req.params.id;
  const { reason, description } = req.body;

  if (!reason) {
    return res.status(400).json({ error: 'Reason is required' });
  }

  try {
    await db.query(
      `INSERT INTO user_reports
         (reporter_id, reported_user_id, reason, description, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [reporterId, reportedId, reason, description || null]
    );
    res.json({ message: 'Report submitted' });
  } catch (err) {
    console.error('Failed to submit report:', err);
    res.status(500).json({ error: 'Server Error' });
  }
});

router.get('/reports', authenticateToken, async (req, res) => {
    try {
      const [rows] = await db.query(
        `SELECT
           r.id,
           r.reason,
           r.description,
           r.created_at,
           reporter.id   AS reporter_id,
           reporter.name AS reporter_name,
           reporter.profile_image AS reporter_pfp,
           reported.id   AS reported_id,
           reported.name AS reported_name,
           reported.profile_image AS reported_pfp
         FROM user_reports r
         JOIN users reporter ON r.reporter_id = reporter.id
         JOIN users reported ON r.reported_user_id  = reported.id
         ORDER BY r.created_at DESC`
      );
      res.json(rows);
    } catch (err) {
      console.error('Error fetching reports:', err);
      res.status(500).json({ error: 'Server Error' });
    }
  }
);

module.exports = router;
