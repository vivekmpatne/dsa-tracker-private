// backend/routes/auth.js
const express  = require("express");
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const User     = require("../models/User");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "kk-secret-change-me";

// ── POST /api/auth/register ──────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // 2. Check duplicate BEFORE creating
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered. Please login." });
    }

    // 3. Hash + save
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: email.toLowerCase().trim(),
      password: hash,
    });

    // 4. Return token immediately (no need to login separately)
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "30d" });

    return res.status(201).json({
      message: "Account created successfully",
      token,
      email: user.email,
      userId: user._id,
    });

  } catch (err) {
    // Catch MongoDB duplicate key (race condition edge case)
    if (err.code === 11000) {
      return res.status(409).json({ message: "Email already registered. Please login." });
    }
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 2. Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 4. Return token — flat shape, frontend reads data.token + data.email directly
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: "30d" });

    return res.status(200).json({
      message: "Login successful",
      token,
      email: user.email,
      userId: user._id.toString(),
    });

  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error. Please try again." });
  }
});

module.exports = router;

// const express = require("express");
// const router = express.Router();
// const User = require("../models/User");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");

// // REGISTER
// router.post("/register", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ message: "Missing fields" });
//     }

//     const existingUser = await User.findOne({ email });

//     if (existingUser) {
//       return res.status(409).json({ message: "User already exists" });
//     }

//     const hash = await bcrypt.hash(password, 10);

//     const user = new User({
//       email,
//       password: hash
//     });

//     await user.save();

//     return res.status(201).json({
//       message: "User created",
//       email: user.email
//     });

//   } catch (err) {
//     console.error("REGISTER ERROR:", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// });


// // LOGIN
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   const user = await User.findOne({ email });
//   if (!user) return res.json({ error: "User not found" });

//   const match = await bcrypt.compare(password, user.password);
//   if (!match) return res.json({ error: "Wrong password" });

//   const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

//   res.json({ token, email: user.email });
// });

// module.exports = router;