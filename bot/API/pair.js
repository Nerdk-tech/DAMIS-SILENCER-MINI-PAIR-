// bot/api/pair.js
const express = require("express");
const router = express.Router();
const { generatePairingCode } = require("../system/pairing");  // ✅ fixed path

// POST /api/pair
router.post("/", async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: "Phone number is required" });
  }

  try {
    const code = await generatePairingCode(phone);
    res.json({ success: true, code });
  } catch (err) {
    console.error("❌ Pairing error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
