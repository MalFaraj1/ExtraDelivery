const express = require('express');
const db = require('../config/db');
const authenticateToken = require('../middleware/auth');
const router = express.Router();


router.post("/", authenticateToken, async (req, res) => {
    const user = req.user.id;
    const {bannedUser} = req.body;

    const [[report]] = await db.query(
        `SELECT reason FROM user_reports WHERE reported_user_id = ?`,
        [bannedUser]
    );

    try {
        await db.query (
            `INSERT INTO user_bans (user_id, admin_id, reason) VALUES (?, ?, ?)`,
            [bannedUser, user, report.reason]
        );
        return res.json({ message: 'User has been banned.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error:'Server error' });
    }
});

router.get('/bans', authenticateToken, async (req, res) => {
    try {
      const [rows] = await db.query(
        `SELECT 
           b.id,
           b.reason,
           b.ban_until,
           b.created_at,
           u.id   AS user_id,
           u.name AS user_name,
           u.profile_image AS user_pfp,
           a.id   AS admin_id,
           a.name AS admin_name
         FROM user_bans b
         JOIN users u ON b.user_id = u.id
         JOIN users a ON b.admin_id = a.id
         ORDER BY b.created_at DESC`
      );
      res.json(rows);
    } catch (err) {
      console.error('Error fetching bans:', err);
      res.status(500).json({ error: 'Server Error' });
    }
  }
);


module.exports = router;