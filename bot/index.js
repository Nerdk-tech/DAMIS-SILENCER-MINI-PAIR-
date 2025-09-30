// bot/index.js
const {
  default: makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason
} = require("@whiskeysockets/baileys")

let sock = null
let isConnected = false

async function startBot() {
  try {
    // keep auth/session in /bot/session
    const { state, saveCreds } = await useMultiFileAuthState("./bot/session")
    const { version } = await fetchLatestBaileysVersion()

    sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: false,
      browser: ["DAMI'S SILENCER", "Mini-Pair", "1.0"]
    })

    sock.ev.on("creds.update", saveCreds)

    sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect } = update
      if (connection === "open") {
        isConnected = true
        console.log("✅ WhatsApp connected")
      } else if (connection === "close") {
        isConnected = false
        const reason = lastDisconnect?.error?.output?.statusCode
        console.log("❌ Disconnected", reason)
        if (reason !== DisconnectReason.loggedOut) {
          console.log("🔄 Restarting bot...")
          startBot() // auto-reconnect unless logged out
        }
      }
    })

    return sock
  } catch (err) {
    console.error("❌ Error starting bot:", err)
    throw err
  }
}

// function exposed for /pair endpoint
async function generatePairingCode(phone) {
  if (!sock) throw new Error("Socket not ready")
  if (typeof sock.requestPairingCode !== "function") {
    throw new Error("This version of Baileys doesn’t support pairing codes")
  }
  if (!phone) throw new Error("Phone number is required")
  const code = await sock.requestPairingCode(phone)
  console.log("📟 Pairing code for", phone, "→", code)
  return { code, expires: null }
}

startBot()

module.exports = { generatePairingCode, sock, isConnected }
