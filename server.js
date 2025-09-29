const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { StartBot } = require("./bot/system/start");  // ✅ fixed path

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/pair", require("./bot/api/pair"));  // ✅ also fix path

// Start bot & server
StartBot()
  .then(() => {
    console.log("✅ Bot started");
    app.listen(PORT, () => console.log(`🌍 Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error("❌ Failed to start bot:", err);
  });
