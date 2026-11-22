// routes/friends.js
const express = require("express");
const db = require("../config/db");
const router = express.Router();
const authenticateToken = require("../middleware/auth");

// GET /api/friends/suggestions
router.get("/suggestions", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [results] = await db.query(
      `SELECT id, name, profile_image, role, location FROM users 
       WHERE id != ? AND id NOT IN (
         SELECT friend_id FROM friends WHERE user_id = ?
         UNION
         SELECT user_id FROM friends WHERE friend_id = ?
       )`,
      [userId, userId, userId]
    );
    res.json(results);
  } catch (error) {
    console.error("Error fetching suggestions:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// POST /api/friends/request
router.post("/request", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { friend_id } = req.body;

  try {
    await db.query(
      `INSERT INTO friends (user_id, friend_id, status, created_at) VALUES (?, ?, 'pending', NOW())`,
      [userId, friend_id]
    );
    res.json({ message: "Friend request sent." });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// GET /api/friends/requests
router.get("/pending", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [results] = await db.query(
      `SELECT f.id, u.id AS requester_id, u.name, u.profile_image 
       FROM friends f
       JOIN users u ON f.user_id = u.id
       WHERE f.friend_id = ? AND f.status = 'pending'`,
      [userId]
    );
    res.json(results);
  } catch (error) {
    console.error("Error fetching requests:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// POST /api/friends/respond
router.post("/respond", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { request_id, action } = req.body; // action: 'accept' or 'decline'

  try {
    if (action === "accept") {
      await db.query(`UPDATE friends SET status = 'accepted' WHERE id = ? AND friend_id = ?`, [request_id, userId]);
      res.json({ message: "Friend request accepted." });
    } else if (action === "decline") {
      await db.query(`DELETE FROM friends WHERE id = ? AND friend_id = ?`, [request_id, userId]);
      res.json({ message: "Friend request declined." });
    } else {
      res.status(400).json({ error: "Invalid action." });
    }
  } catch (error) {
    console.error("Error responding to request:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// GET /api/friends/status/:id
// Returns: { status: 'none' | 'pending' | 'friends' }
router.get("/status/:id", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const otherId = req.params.id;

  try {
    const [rows] = await db.query(
      `SELECT user_id, friend_id, status
       FROM friends
       WHERE (user_id = ? AND friend_id = ?)
          OR (user_id = ? AND friend_id = ?)`,
      [userId, otherId, otherId, userId]
    );

    if (rows.length === 0) {
      return res.json({ status: "none" });
    }

    const rel = rows[0];
    if (rel.status === "accepted") {
      return res.json({ status: "friends" });
    }

    // If it’s pending and *you* created it
    if (rel.status === "pending" && rel.user_id === userId) {
      return res.json({ status: "pending" });
    }

    // Otherwise (they sent you a request, or any other case)
    return res.json({ status: "none" });
  } catch (error) {
    console.error("Error fetching friend status:", error);
    return res.status(500).json({ error: "Server Error" });
  }
});


// POST /api/friends/remove
// Body: { friend_id }  Cancels pending or removes friendship
router.post("/remove", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  const { friend_id } = req.body;

  try {
    await db.query(
      `DELETE FROM friends
       WHERE (user_id = ? AND friend_id = ?)
          OR (user_id = ? AND friend_id = ?)`,
      [userId, friend_id, friend_id, userId]
    );
    res.json({ message: "Friendship/Request removed." });
  } catch (error) {
    console.error("Error removing friend:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

router.get("/list", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.query(
      `SELECT f.id,
              CASE WHEN f.user_id = ? THEN u2.id ELSE u1.id END AS friend_id,
              CASE WHEN f.user_id = ? THEN u2.name ELSE u1.name END AS friend_name,
              CASE WHEN f.user_id = ? THEN u2.profile_image ELSE u1.profile_image END AS friend_image,
              f.created_at
       FROM friends f
       LEFT JOIN users u1 ON f.user_id = u1.id
       LEFT JOIN users u2 ON f.friend_id = u2.id
       WHERE f.status = 'accepted' AND (f.user_id = ? OR f.friend_id = ?)
       ORDER BY f.created_at DESC`,
      [userId, userId, userId, userId, userId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching friends list:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;