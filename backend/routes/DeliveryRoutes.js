const express = require("express");
const db = require("../config/db");
const router = express.Router();
const authenticateToken = require("../middleware/auth");

router.get("/history", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const [rows] = await db.query(
      `SELECT d.*, u1.name AS customer_name, u1.profile_image AS customer_pfp,
              u2.name AS driver_name, u2.profile_image AS driver_pfp
       FROM deliveries d
       LEFT JOIN users u1 ON d.customer_id = u1.id
       LEFT JOIN users u2 ON d.driver_id = u2.id
       WHERE (d.customer_id = ? OR d.driver_id = ?)
         AND d.status IN ('delivered', 'canceled')
       ORDER BY d.created_at DESC`,
      [userId, userId]
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching delivery history:", error);
    res.status(500).json({ error: "Server Error" });
  }
});


// getting all available deliveries
router.get("/available", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = 10;
  const offset = (page - 1) * pageSize;

  const { category, location } = req.query;

  let baseQuery = `
    SELECT 
      deliveries.*, 
      users.name AS customer_name, 
      users.profile_image AS customer_pfp 
    FROM deliveries 
    JOIN users ON deliveries.customer_id = users.id 
    WHERE deliveries.status = 'pending'
  `;

  const queryParams = [];

  if (category) {
    baseQuery += ` AND deliveries.category = ?`;
    queryParams.push(category);
  }

  if (location) {
    baseQuery += ` AND (deliveries.pickup_location LIKE ? OR deliveries.dropoff_location LIKE ?)`;
    queryParams.push(`%${location}%`, `%${location}%`);
  }

  baseQuery += ` ORDER BY deliveries.created_at DESC LIMIT ? OFFSET ?`;
  queryParams.push(pageSize, offset);

  try {
    const [results] = await db.query(baseQuery, queryParams);
    res.json(results);
  } catch (error) {
    console.error("Failed to fetch deliveries:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


  router.get("/customer", authenticateToken, async (req, res) => {
    const customerId = req.user.id;
  
    try {
      const [results] = await db.query(
        `SELECT d.*, u.name AS customer_name, u.profile_image AS customer_pfp
         FROM deliveries d
         JOIN users u ON d.customer_id = u.id
         WHERE d.customer_id = ? AND d.status IN ('pending', 'in_transit', 'pending_application')
         ORDER BY d.created_at DESC`,
        [customerId]
      );
  
      res.json(results);
    } catch (error) {
      console.error("Error fetching customer deliveries:", error);
      res.status(500).json({ error: "Server Error" });
    }
  });
  
  router.get("/delivery-user", authenticateToken, async (req, res) => {
    const userId = req.user.id;
  
    try {
      // Deliveries taken by the delivery user
      const [acceptedDeliveries] = await db.query(
        `SELECT d.*, u.name AS customer_name, u.profile_image AS customer_pfp
         FROM deliveries d
         JOIN users u ON d.customer_id = u.id
         WHERE d.driver_id = ? AND d.status IN ('in_transit', 'pending_application')
         ORDER BY d.created_at DESC`,
        [userId]
      );
  
      // Suggested deliveries from friends
      const [friendSuggestions] = await db.query(
        `SELECT d.*, u.name AS customer_name, u.profile_image AS customer_pfp
         FROM deliveries d
         JOIN friends f ON f.friend_id = d.customer_id
         JOIN users u ON d.customer_id = u.id
         WHERE f.user_id = ? AND d.status = 'pending' AND d.driver_id IS NULL
         ORDER BY d.created_at DESC`,
        [userId]
      );
  
      res.json({
        accepted: acceptedDeliveries,
        suggestions: friendSuggestions,
      });
    } catch (error) {
      console.error("Error fetching delivery-user data:", error);
      res.status(500).json({ error: "Server Error" });
    }
  });

// routes/delivery.js
router.get('/:id', authenticateToken, async (req, res) => {
  const deliveryId = req.params.id;

  try {
    const [rows] = await db.query(
      `SELECT 
         d.*, 
         customer.name AS customer_name,
         customer.profile_image AS customer_pfp,
         driver.name   AS driver_name,
         driver.profile_image AS driver_pfp,
         t.pickup_lat,
         t.pickup_long,
         t.dropoff_lat,
         t.dropoff_long
       FROM deliveries d
       JOIN users AS customer ON d.customer_id = customer.id
       LEFT JOIN users AS driver   ON d.driver_id   = driver.id
       LEFT JOIN tracking t        ON t.delivery_id = d.id
       WHERE d.id = ?`,
      [deliveryId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Delivery not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// routes/DeliveryRoutes.js
router.post('/:id/apply', authenticateToken, async (req, res) => {
  const deliveryId = req.params.id;
  const driverId   = req.user.id;

  try {
    // 1) fetch the delivery
    const [rows] = await db.query(
      'SELECT customer_id, driver_id FROM deliveries WHERE id = ?',
      [deliveryId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }
    const delivery = rows[0];

    const [row] = await db.query(
      'SELECT name FROM users WHERE id = ?',
      [driverId]
    );
    if(row.length === 0){
      return res.status(404).json({ error: 'driver not found' });
    }
    const driverName = row[0];

    // 2) ensure it’s still unclaimed
    if (delivery.driver_id) {
      return res.status(400).json({ error: 'Delivery already taken' });
    }

    // 3) assign driver & change status
    await db.query(
      'UPDATE deliveries SET driver_id = ?, status = "pending_application" WHERE id = ?',
      [driverId, deliveryId]
    );

    // 4) notify the customer
    await db.query(
      `INSERT INTO notifications
         (user_id, actor_id, type, entity_id, message)
       VALUES (?, ?, 'application_request', ?, ?)`,
      [
        delivery.customer_id,      // <-- now defined
        driverId,
        deliveryId,
        `Driver ${driverName.name} wants to apply for your delivery request #${deliveryId}.`
      ]
    );

    res.json({ success: true, message: 'Applied for delivery and notified customer.' });

  } catch (error) {
    console.error('Error applying for delivery:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


// Customer responds to an application request
router.post("/:id/respond", authenticateToken, async (req, res) => {
  const { action } = req.body; // 'accept' or 'decline'
  const deliveryId = req.params.id;
  // load delivery
  const [[delivery]] = await db.query(`SELECT * FROM deliveries WHERE id = ?`, [deliveryId]);
  if (!delivery) return res.status(404).json({ error: "Not found" });

  if (action === "accept") {
    await db.query(
      `UPDATE deliveries 
         SET driver_id = ?, status = 'in_transit' 
       WHERE id = ?`,
      [delivery.driver_id, deliveryId]
    );
    // notify driver
    await db.query(
      `INSERT INTO notifications (user_id, actor_id, entity_id, type, message)
       VALUES (?, ?, ?, 'application_accepted', 'Your application has been accepted')`,
      [delivery.driver_id, req.user.id, deliveryId]
    );

    await db.query(
      `UPDATE payments SET driver_id = ? WHERE delivery_id = ?`,
      [delivery.driver_id, deliveryId]  
    );

  } else {
    await db.query(
      `UPDATE deliveries 
         SET status = 'pending', driver_id = NULL 
       WHERE id = ?`,
      [deliveryId]
    );
    // notify driver
    await db.query(
      `INSERT INTO notifications (user_id, actor_id, entity_id, type, message)
       VALUES (?, ?, ?, 'application_declined', 'Your application has been declined')`,
      [delivery.driver_id, req.user.id, deliveryId]
    );
  }

  res.json({ success: true });
});

// Driver marks as delivered
router.post("/:id/complete", authenticateToken, async (req, res) => {
  const deliveryId = req.params.id;
  const driverId = req.user.id;
  // load and check
  const [[delivery]] = await db.query(`SELECT * FROM deliveries WHERE id = ?`, [deliveryId]);
  if (!delivery || delivery.driver_id !== driverId) {
    return res.status(404).json({ error: "Not found or not yours" });
  }

  await db.query(
    `UPDATE deliveries 
       SET status = 'delivered' 
     WHERE id = ?`,
    [deliveryId]
  );

  // notify customer
  await db.query(
    `INSERT INTO notifications (user_id, actor_id, entity_id, type, message)
     VALUES (?, ?, ?, 'delivery_completed', 'Your request has been delivered successfully')`,
    [delivery.customer_id, driverId, deliveryId]
  );

  res.json({ success: true });
});



router.post('/', authenticateToken, async (req, res) => {
  const customer_id = req.user.id;
  const { pickupLoc, dropoffLoc, category, item_description, price, estimated_time } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO deliveries
       (customer_id, driver_id, pickup_location, dropoff_location, category, item_description, status, price, estimated_time, created_at)
       VALUES (?, NULL, ?, ?, ?, ?, 'pending', ?, ?, NOW())`,
      [customer_id, pickupLoc.address, dropoffLoc.address, category, item_description || null, price, estimated_time]
    );
    // Optionally insert initial tracking record (start)
    await db.query(
      `INSERT INTO tracking (delivery_id, pickup_lat, pickup_long, dropoff_lat, dropoff_long, timestamp)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [result.insertId, pickupLoc.latitude, pickupLoc.longitude, dropoffLoc.latitude, dropoffLoc.longitude]
    );

    // insert into payment table
    await db.query(
      `INSERT INTO payments(delivery_id, customer_id, amount, status)
       VALUES (?, ?, ?, 'pending')`,
       [result.insertId, customer_id, price]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
});

router.post("/:id/cancel", authenticateToken, async (req, res) => {
  const deliveryId = req.params.id;
  const userId     = req.user.id;

  // ensure it's your delivery and still pending
  const [[del]] = await db.query(
    `SELECT * FROM deliveries WHERE id = ? AND customer_id = ? AND status = 'pending'`,
    [deliveryId, userId]
  );
  if (!del) {
    return res.status(400).json({ error: "Cannot cancel" });
  }

  await db.query(
    `UPDATE deliveries SET status = 'canceled' WHERE id = ?`,
    [deliveryId]
  );

  await db.query(
    `UPDATE payments SET status = 'failed' WHERE delivery_id = ?`,
    [deliveryId]
  );
  res.json({ success: true });
});


// POST /api/delivery/:id/pay
router.post("/:id/pay", authenticateToken, async (req, res) => {
  const deliveryId = req.params.id;
  const { method } = req.body;
  const userId     = req.user.id;

  const [[payment]] = await db.query(
    `SELECT * FROM payments WHERE delivery_id = ?`,
    [deliveryId]
  );

  if (method === "credit_card") {
    await db.query(
      `UPDATE payments SET payment_method = 'credit_card' WHERE delivery_id = ?`,
      [deliveryId]
    );
  } else {
    await db.query(
      `UPDATE payments SET payment_method = 'cash', status = 'completed' WHERE delivery_id = ?`,
      [deliveryId]
    );

    await db.query(
      `INSERT INTO notifications (user_id, actor_id, entity_id, type, message)
     VALUES (?, ?, ?, 'payment_completed', 'You will be paid cash')`,
     [payment.driver_id, userId, deliveryId]
    );
  }

  return res.json({ success: true });
});

  

module.exports = router;
  