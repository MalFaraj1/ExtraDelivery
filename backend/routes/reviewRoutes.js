const express = require("express");
const db = require("../config/db");
const router = express.Router();
const authenticateToken = require("../middleware/auth");


// GET /api/reviews/driver/:id
router.get("/driver/:id", async (req, res) => {
    const driverId = req.params.id;
    try {
      const [rows] = await db.query(
        `SELECT r.*, u.name AS customer_name, u.profile_image AS customer_image
         FROM reviews r
         JOIN users u ON r.customer_id = u.id
         WHERE r.driver_id = ?
         ORDER BY r.created_at DESC`,
        [driverId]
      );
  
      const [avgRow] = await db.query(
        `SELECT AVG(rating) AS avg_rating FROM reviews WHERE driver_id = ?`,
        [driverId]
      );
  
      res.json({ reviews: rows, avgRating: avgRow[0].avg_rating });
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  
  // POST /api/reviews
  router.post("/", authenticateToken, async (req, res) => {
    const { driver_id, rating, comment } = req.body;
    const customer_id = req.user.id;
  
    if (!rating || !driver_id) return res.status(400).json({ error: "Missing data" });
  
    try {
      await db.query(
        `INSERT INTO reviews (customer_id, driver_id, rating, comment, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        [customer_id, driver_id, rating, comment || null]
      );
      res.json({ message: "Review submitted successfully." });
    } catch (error) {
      console.error("Error submitting review:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  router.get("/given", authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
      const [rows] = await db.query(
        `SELECT r.id, r.driver_id, r.rating, r.comment, r.created_at,
                u.name AS driver_name, u.profile_image AS driver_image
         FROM reviews r
         JOIN users u ON r.driver_id = u.id
         WHERE r.customer_id = ?
         ORDER BY r.created_at DESC`,
        [userId]
      );
      res.json(rows);
    } catch (error) {
      console.error("Error fetching given reviews:", error);
      res.status(500).json({ error: "Server Error" });
    }
  });
  
  // GET reviews the user has received (as driver)
  router.get("/received", authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
      const [rows] = await db.query(
        `SELECT r.id, r.customer_id, r.rating, r.comment, r.created_at,
                u.name AS customer_name, u.profile_image AS customer_image
         FROM reviews r
         JOIN users u ON r.customer_id = u.id
         WHERE r.driver_id = ?
         ORDER BY r.created_at DESC`,
        [userId]
      );
      res.json(rows);
    } catch (error) {
      console.error("Error fetching received reviews:", error);
      res.status(500).json({ error: "Server Error" });
    }
  });

module.exports = router;