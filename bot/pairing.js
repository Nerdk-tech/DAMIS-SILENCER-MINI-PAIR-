const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const pino = require('pino');

async function generatePairingCode(phone) {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const sock = makeWASocket({
        logger: pino({ level: "silent" }),
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    const customPairingCode = "DAMI-BOTZ";
    const code = await sock.requestPairingCode(phone.trim(), customPairingCode);
    await saveCreds();
    return code;
}

module.exports = { generatePairingCode };