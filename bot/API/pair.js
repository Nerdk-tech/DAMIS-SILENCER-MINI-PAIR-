const express = require("express");
const router = express.Router();
const { generatePairingCode } = require("../bot/pairing");

router.post("/", async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Phone number required" });

    try {
        const code = await generatePairingCode(phone);
        res.json({ success: true, code });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;