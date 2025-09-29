const { Boom } = require('@hapi/boom');
const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason, 
    makeInMemoryStore, 
    jidDecode 
} = require('@whiskeysockets/baileys');
const pino = require('pino');
const chalk = require('chalk');
const readline = require('readline');
const os = require('os');
const crypto = require('crypto');
globalThis.crypto = crypto.webcrypto;

const { smsg, fetchJson, await: awaitfunc, sleep } = require('./func');

// Init
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
const usePairingCode = true;

// ==============================================
// ANTI SPAM SYSTEM
// ==============================================
class AntiSpamSystem {
    constructor(ask) {
        this.ask = ask;
        this.userMessageCount = new Map();
        this.blockedUsers = new Set();
        this.suspiciousChars = /[\uA9FE\uA9F9\uA9FD\u202E\u202D]/g;
        this.linkRegex = /(https?:\/\/[^\s]+|wa\.me|whatsapp\.com)/gi;
    }

    async handleMessage(m) {
        try {
            const sender = m.key.remoteJid;
            if (!sender || m.key.fromMe) return false;

            if (this.blockedUsers.has(sender)) {
                await this.ask.sendMessage(sender, { text: "🚨 You are blocked for spam!" });
                return true;
            }

            const text = m.message?.conversation || m.message?.extendedTextMessage?.text || "";

            // Flood
            const count = (this.userMessageCount.get(sender) || 0) + 1;
            this.userMessageCount.set(sender, count);
            if (count >= 6) {
                await this.punishUser(m, "FLOOD (6+ messages)");
                return true;
            }

            // Malicious chars
            if (this.suspiciousChars.test(text)) {
                await this.punishUser(m, "⚖️ MALICIOUS CHARACTERS ⚖️");
                return true;
            }

            // Links spam
            const links = text.match(this.linkRegex) || [];
            if (links.length >= 2) {
                await this.punishUser(m, "Suspicious links");
                return true;
            }

            return false;
        } catch (error) {
            console.error('AntiSpam Error:', error);
            return false;
        }
    }

    async punishUser(m, reason) {
        const sender = m.key.remoteJid;
        try {
            await this.deleteMessage(m);
            await this.ask.updateBlockStatus(sender, "block");
            this.blockedUsers.add(sender);

            await this.ask.sendMessage(sender, { 
                text: `🚨 *You are blocked* 🚨\n\nReason: ${reason}\nYou can no longer contact this bot.\nContact admin for unblocking.`
            });

            console.log(chalk.red(`[ANTI-SPAM] ${sender} blocked for: ${reason}`));
        } catch (error) {
            console.error('Error punishUser:', error);
        }
    }

    async deleteMessage(m) {
        try {
            await this.ask.sendMessage(m.key.remoteJid, {
                delete: {
                    remoteJid: m.key.remoteJid,
                    fromMe: false,
                    id: m.key.id,
                    participant: m.key.participant
                }
            });
        } catch (error) {
            console.error('Error deleteMessage:', error);
        }
    }

    resetCounter(jid) {
        this.userMessageCount.delete(jid);
    }
}

// ==============================================
// Console helper
// ==============================================
const question = (text) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question(text, (answer) => {
            rl.close();
            resolve(answer);
        });
    });
};

// ==============================================
// MAIN BOT FUNCTION
// ==============================================
async function StartBot() {
    console.log(chalk.red(`\n${chalk.red("CREATED BY 𝑫𝑨𝑴𝑰 𝑰𝑺 𝑯𝑰𝑴")}\n`));
    console.log(
        chalk.white.bold(`🥀 BOT STARTING... \n` +
        `Platform: ${os.platform()} | CPU: ${os.cpus()[0].model}`)
    );

    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const ask = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: !usePairingCode,
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    const antiSpam = new AntiSpamSystem(ask);

    // Pairing
    if (!ask.authState.creds.registered) {
        console.log(chalk.blue("Enter your number without + (e.g. 234...)"));
        const phoneNumber = await question(chalk.blue('📱 Your Number\n> '));
        const customPairingCode = "DAMI-BOTZ";
        console.log(chalk.blue("⏳ Retrieving connection code..."));
        try {
            const code = await ask.requestPairingCode(phoneNumber.trim(), customPairingCode);
            console.log(chalk.red.bold(`✅ Your connection code: ${code}`));
        } catch (error) {
            console.log(chalk.red("❌ Invalid number, try again"));
        }
    }

    // Connection events
    ask.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            ask.newsletterFollow("120363377534493877@newsletter");
            ask.sendMessage(ask.user.id, {
                image: { url: "https://files.catbox.moe/1yhfx2.jpg" },
                caption: "✅ Bot connected successfully!"
            });
            console.log(chalk.green('Bot connected!'));
        } else if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            console.warn("Connection closed:", reason);
            await sleep(5000);
            StartBot();
        } else if (connection === 'connecting') {
            console.warn('Connecting...');
        }
    });

    // Messages
    ask.ev.on('messages.upsert', async ({ messages, type }) => {
        try {
            const msg = messages[0];
            if (type !== "notify" || !msg?.message) return;

            if (msg.key.remoteJid === "status@broadcast") {
                await ask.readMessages([msg.key]);
                await ask.sendMessage(msg.key.remoteJid, { react: { text: "🥀", key: msg.key }});
                return;
            }

            if (await antiSpam.handleMessage(msg)) return;

            const m = smsg(ask, msg, store);
            require(`../ask-xmd`)(ask, m, msg, store);

            if (msg.key.fromMe) antiSpam.resetCounter(msg.key.remoteJid);
        } catch (err) {
            console.error('Error in messages.upsert:', err);
        }
    });

    // Auto-typing
    ask.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const msg = messages[0];
            if (!msg) return;
            await ask.sendPresenceUpdate('composing', msg.key.remoteJid);
            await sleep(40000);
            await ask.sendPresenceUpdate('paused', msg.key.remoteJid);
        } catch (err) {
            console.error('Error in typing presence:', err);
        }
    });

    // Decode JID
    ask.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
            let decode = jidDecode(jid) || {};
            return decode.user && decode.server ? decode.user + '@' + decode.server : jid;
        } else return jid;
    };

    // Send text helper
    ask.sendText = (jid, text, quoted = '', options) => ask.sendMessage(jid, { text, ...options }, { quoted });

    // Contacts update
    ask.ev.on('contacts.update', update => {
        for (let contact of update) {
            let id = ask.decodeJid(contact.id);
            if (store && store.contacts) {
                store.contacts[id] = { id, name: contact.notify };
            }
        }
    });

    ask.ev.on('creds.update', saveCreds);

    return ask;
}

module.exports = { StartBot };