require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./config/db");
const users = require("./routes/UserRoutes");
const deliveries = require("./routes/DeliveryRoutes");
const reviews = require("./routes/reviewRoutes");
const friends = require("./routes/friendRoutes");
const messages = require("./routes/messageRoutes");
const notifications = require("./routes/NotificationRoutes");
const payments = require("./routes/paymentRoutes");
const reports = require("./routes/reportRoutes");
const bans = require("./routes/banRoutes");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // Parses incoming JSON data
app.use("/api/user", users);
app.use("/api/delivery", deliveries);
app.use("/api/review", reviews);
app.use("/api/friend", friends);
app.use("/api/message", messages);
app.use("/api/notifications", notifications);
app.use("/api/payment", payments);
app.use("/api/report", reports);
app.use("/api/ban", bans);
app.use("/assets/images", express.static(path.join(__dirname, "../assets/images"))); // Move up one level correctly





db.query("SELECT 1")
  .then(() => console.log("Connected to MySQL Database"))
  .catch((err) => console.error("Database Connection Failed:", err));

// Test route
app.get("/", (req, res) => {
  res.send("Delivery App Backend is Running!");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 