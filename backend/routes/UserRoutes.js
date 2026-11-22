const express = require("express");
const db = require("../config/db");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");


const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";


// Get user by ID
router.get("/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const [rows] = await db.query(
      `SELECT id, name, email, phone, role, location, vehicle, bio, profile_image, created_at 
       FROM users 
       WHERE id = ?`, 
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Failed to fetch user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;


//  Get user
router.get("/users", authenticateToken, async (req, res) => {
  try {
    const [users] = await db.query("SELECT id, name, email, phone, role FROM users"); 
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+961(3|70|71|76|78|79|81|1|4|5|6|7|8|9)\d{6}$/;
const passwordStrength = pwd =>
  pwd.length >= 8 && /[A-Z]/.test(pwd) && /\d/.test(pwd);
//  Register New User
router.post("/register", async (req, res) => {
  const { name, email, phone, password, location, role } = req.body;

  // 1) All fields required
  if (!name || !email || !phone || !password || !location || !role) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // 2) Role must be customer or driver
  if (!["customer", "driver"].includes(role)) {
    return res
      .status(400)
      .json({ error: "Invalid role. Must be 'customer' or 'driver'." });
  }

  // 3) Email format
  if (!emailRegex.test(email)) {
    return res
      .status(400)
      .json({ error: "Invalid email format." });
  }

  // 4) Lebanese phone check
  if (!phoneRegex.test(phone)) {
    return res
      .status(400)
      .json({ error: "Invalid Lebanese phone number." });
  }

  // 5) Password strength
  if (!passwordStrength(password)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters long, include an uppercase letter and a number."
    });
  }

  try {
    // 6) Duplicate email?
    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already in use." });
    }

    // 7) Everything’s good → insert
    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      `
      INSERT INTO users
        (name, email, phone, password, location, role, created_at)
      VALUES (?, ?, ?, ?, ?, ?, NOW())
      `,
      [name, email, phone, hashed, location, role]
    );

    res.json({ message: "Registration successful." });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
});

//  Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    // 1. Find user
    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (rows.length === 0) {
      return res.status(401).json({ error: "User not found" });
    }
    const user = rows[0];

    // 2. Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // 3. Check for active ban
    const [[ban]] = await db.query(
      `SELECT * FROM user_bans
       WHERE user_id = ?
         AND (ban_until IS NULL OR ban_until > NOW())`,
      [user.id]
    );
    if (ban) {
      const untilMsg = ban.ban_until
        ? ` until ${ban.ban_until.toISOString()}`
        : "";
      return res
        .status(403)
        .json({ error: `Your account is banned${untilMsg}.` });
    }

    // 4. Issue JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 5. Respond
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileImage: user.profile_image,
        location: user.location,
        bio: user.bio,
        vehicle: user.vehicle,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


router.put("/update-profile", authenticateToken, async (req, res) => {
  const { name, email, phone, location, bio, vehicle} = req.body;
  const userId = req.user.id;

  try {
    await db.query(
      "UPDATE users SET name = ?, email = ?, phone = ?, location = ?, bio = ?, vehicle = ? WHERE id = ?",
      [name, email, phone, location, bio, vehicle, userId]
    );

    const [user] = await db.query("SELECT id, name, email, phone, role, location, bio, vehicle, profile_image FROM users WHERE id = ?", [userId]);

    res.json({ message: "Profile updated successfully!", user: { id: user[0].id, name: user[0].name, email: user[0].email, phone:user[0].phone, role: user[0].role, profileImage: user[0].profile_image, location: user[0].location, bio: user[0].bio, vehicle: user[0].vehicle } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Define the correct path to the images folder
const imageDir = path.join(__dirname, "../../assets/images"); // Adjust based on actual structure

// Ensure the folder exists
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}

// Storage config for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../assets/images")); // Correct path to save images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename file
  },
});

const upload = multer({ storage });

// Upload Profile Image Route
router.post("/upload-profile-image", authenticateToken, upload.single("profileImage"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const userId = req.user.id;
  const imageUrl = `/assets/images/${req.file.filename}`; // Ensure proper path

  try {
    // Save the image URL in the database
    await db.query("UPDATE users SET profile_image = ? WHERE id = ?", [imageUrl, userId]);

    res.json({ message: "Profile image uploaded successfully!", imageUrl });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/update-password", authenticateToken, async (req, res) => {
  const {password} = req.body;
  const userId = req.user.id;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await db.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId]);

    res.json({ message: "Password Updated Successfully"})
  } catch (error) {
    res.status(500).json({ error: error.message});
  }
});


module.exports = router;
