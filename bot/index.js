// index.js

// ====== DEPENDENCIES ======
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = require("@whiskeysockets/baileys");

const fs = require("fs");
const chalk = require("chalk");

// Import your handler (the big switch-case you showed)
const zynHandler = require("./xmd"); // make sure file name is correct

// ====== MAIN FUNCTION ======
async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState("./session");
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        printQRInTerminal: true, // show QR code in console (alternative to pairing code)
        auth: state,
        browser: ["DAMI'S SILENCER", "Chrome", "1.0.0"],
    });

    // 🔑 If no session, request a pairing code
    if (!sock.authState.creds.registered) {
        const phoneNumber = "2348054671458"; // change to your WhatsApp number
        const code = await sock.requestPairingCode(phoneNumber);
        console.log(chalk.green.bold(`✅ Your WhatsApp pairing code: ${code}`));
    }

    // 🔄 Handle connection updates
    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            const reason = lastDisconnect?.error?.output?.statusCode;
            console.log(chalk.red(`❌ Connection closed. Reason: ${reason}`));
            if (reason !== DisconnectReason.loggedOut) {
                connectToWhatsApp(); // auto reconnect
            } else {
                console.log("❌ Logged out. Delete /session and re-run to pair again.");
            }
        } else if (connection === "open") {
            console.log(chalk.blue.bold("✅ DAMI'S SILENCER BOT CONNECTED ✅"));
        }
    });

    // 💾 Save session credentials
    sock.ev.on("creds.update", saveCreds);

    // 📩 Forward messages to handler
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;
        await zynHandler(sock, msg, msg.message, {}); // pass sock + message to handler
    });
}

// ====== START BOT ======
connectToWhatsApp();
