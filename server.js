const express = require("express");
const path = require("path");

const app = express();

// Serve static files (CSS, JS, images) from "public" folder
app.use(express.static(path.join(__dirname, "public")));

// Serve index.html at root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Catch-all for unknown routes
app.use((req, res) => {
  res.status(404).send("404 - Not Found");
});

// Use Render's PORT or fallback (for local testing)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 DAMI'S SILENCER running on ${PORT}`);
});
