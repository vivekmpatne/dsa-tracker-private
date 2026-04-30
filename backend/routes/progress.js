const express = require("express");
const router = express.Router();
const Progress = require("../models/Progress");


router.get("/", async (req, res) => {
  res.json({ progress: {} });
});

router.post("/", async (req, res) => {
  res.json({ message: "Saved" });
});

// ─── YOUR EXISTING CODE ───

// SAVE
router.post("/save", async (req, res) => {
  const { userId, data } = req.body;

  let existing = await Progress.findOne({ userId });

  if (existing) {
    existing.data = data;
    await existing.save();
  } else {
    await Progress.create({ userId, data });
  }

  res.json({ message: "Saved" });
});

// LOAD
router.get("/:userId", async (req, res) => {
  const progress = await Progress.findOne({ userId: req.params.userId });
  res.json(progress?.data || {});
});

module.exports = router;