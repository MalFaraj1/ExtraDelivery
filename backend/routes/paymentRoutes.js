const express = require("express");
const db = require("../config/db");
const router = express.Router();
const authenticateToken = require("../middleware/auth");


// GET /api/delivery/:id/payment
router.get("/:id", authenticateToken, async (req, res) => {
  const deliveryId = req.params.id;
  try {
    const [rows] = await db.query(
      `SELECT 
         p.id,
         p.delivery_id,
         p.customer_id,
         p.driver_id,
         p.amount,
         p.payment_method,
         p.status,
         p.created_at
       FROM payments p
       WHERE p.delivery_id = ?`,
      [deliveryId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Payment not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching payment:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/charge", authenticateToken, async (req, res) => {
  const customerId = req.user.id;
  const { delivery_id, card_number, exp_month, exp_year, cvc } = req.body;

  if (!delivery_id || !card_number || !exp_month || !exp_year || !cvc) {
    return res.status(400).json({ error: "Missing payment data" });
  }

  try {
    const [[delivery]] = await db.query(
      `SELECT driver_id, price FROM deliveries WHERE id = ?`,
      [delivery_id]
    );
    if (!delivery) return res.status(404).json({ error: "Delivery not found" });

    await db.query(
      `UPDATE payments SET payment_method = 'credit_card', status = 'completed' WHERE delivery_id = ?`,
      [delivery_id]
    );

    res.json({ success: true, message: "Payment completed." });
  } catch (err) {
    console.error("Payment error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
