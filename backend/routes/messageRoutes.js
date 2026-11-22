const express = require("express");
const db = require("../config/db");
const router = express.Router();
const authenticateToken = require("../middleware/auth");



// GET /api/message/users
// Returns { friends: [...], others: [...] }
router.get("/users", authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
      // 1) Accepted friends
      const [friends] = await db.query(
        `SELECT u.id, u.name, u.profile_image,
                SUM(CASE WHEN m.receiver_id = ? AND m.is_read = 0 THEN 1 ELSE 0 END) AS unread_count
         FROM friends f
         JOIN users u 
           ON (u.id = CASE WHEN f.user_id = ? THEN f.friend_id ELSE f.user_id END)
         LEFT JOIN messages m 
           ON m.sender_id = u.id AND m.receiver_id = ?
         WHERE f.status = 'accepted'
           AND (f.user_id = ? OR f.friend_id = ?)
         GROUP BY u.id, u.name, u.profile_image
         ORDER BY unread_count DESC, u.name`,
        [userId, userId, userId, userId, userId]
      );
  
      // 2) Other users (exclude self + already friends)
      // First collect friend IDs
      const friendIds = friends.map((u) => u.id);
      // Always exclude ourselves
      friendIds.push(userId);
  
      // If no friends, we still need an array placeholder for SQL
      const placeholders = friendIds.map(() => "?").join(",");
      const params = [...friendIds];
  
      const [others] = await db.query(
        `SELECT id, name, profile_image, 0 AS unread_count
         FROM users
         WHERE id NOT IN (${placeholders})
         ORDER BY name`,
        params
      );
  
      res.json({ friends, others });
    } catch (err) {
      console.error("Error fetching chat users:", err);
      res.status(500).json({ error: "Server Error" });
    }
  });

// GET /api/messages/:otherId
// Fetch conversation with other user
router.get("/:otherId", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const otherId = req.params.otherId;
  try {
    const [rows] = await db.query(
      `SELECT id, sender_id, receiver_id, content, created_at, is_read
       FROM messages
       WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?)
       ORDER BY created_at ASC`,
      [userId, otherId, otherId, userId]
    );
    // Mark unread messages as read
    await db.query(
      `UPDATE messages SET is_read = 1 WHERE sender_id = ? AND receiver_id = ? AND is_read = 0`,
      [otherId, userId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// POST /api/messages
// Send a message
router.post("/", authenticateToken, async (req, res) => {
  const senderId = req.user.id;
  const { receiver_id, content } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO messages (sender_id, receiver_id, content, created_at, is_read)
       VALUES (?, ?, ?, NOW(), 0)`,
      [senderId, receiver_id, content]
    );
    res.json({ id: result.insertId, sender_id: senderId, receiver_id, content, created_at: new Date(), is_read: 0 });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;