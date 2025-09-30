require('./system/config');
const { Boom } = require('@hapi/boom');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeInMemoryStore, jidDecode } = require('@whiskeysockets/baileys');
const pino = require('pino');
const chalk = require('chalk');
const readline = require('readline');
const os = require('os');
const crypto = require('crypto');
globalThis.crypto = crypto.webcrypto;
const { smsg, fetchJson, await: awaitfunc, sleep } = require('./system/func');

// Initialisation
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });
const usePairingCode = true;

// ==============================================
// ANTI SPAM SYSTEM
// ==============================================
class AntiSpamSystem {
    constructor(ask) {
        this.ask = ask;
        this.userMessageCount = new Map();
        this.blockedUsers = new Map();
        this.suspiciousChars = /[\uA9FE\uA9F9\uA9FD\u202E\u202D]/g;
        this.linkRegex = /(https?:\/\/[^\s]+|wa\.me|whatsapp\.com)/gi;
    }

    async handleMessage(m) {
        try {
            const sender = m.key.remoteJid;
            if (!sender || m.key.fromMe) return false;

            if (this.blockedUsers.has(sender)) {
                await this.ask.sendMessage(sender, { 
                    text: "🚨 you are blocked for spam!" 
                });
                return true;
            }

            const text = m.message?.conversation || m.message?.extendedTextMessage?.text || "";
            
            // Détection flood
            const count = (this.userMessageCount.get(sender) || 0) + 1;
            this.userMessageCount.set(sender, count);
            if (count >= 6) {
                await this.punishUser(m, "FLOOD (6+ messages)");
                return true;
            }

            // suspicious characters
            if (this.suspiciousChars.test(text)) {
                await this.punishUser(m, "⚖️ MALICIOUS CHARACTERS⚖️");
                return true;
            }

            // Détection liens spam
            const links = text.match(this.linkRegex) || [];
            if (links.length >= 2) {
                await this.punishUser(m, "suspicious links");
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
            // 1. Supprimer le message
            await this.deleteMessage(m);

            // 2. Bloquer l'utilisateur
            await this.ask.updateBlockStatus(sender, "block");
            this.blockedUsers.add(sender);

            // 3. Envoyer un avertissement
            await this.ask.sendMessage(sender, { 
                text: `🚨 *You are blocked* 🚨\n\n` +
                      `Reason: ${reason}\n` +
                      `you can no longer contact this bot.\n` +
                      `Contact admin for unblocking.`
            });

            console.log(chalk.red(`[ANTI-SPAM] ${sender} blocked for: ${reason}`));
        } catch (error) {
            console.error('Erreur punishUser:', error);
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

/// Function to ask questions in the console
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

// Displaying server information
console.log(chalk.red(`\n${chalk.red("CREATED BY 𝑫𝑨𝑴𝑰 𝑰𝑺 𝑯𝑰𝑴")}\n`));
console.log(
    chalk.white.bold(` 🥀 2025 BOT CREATED BY 𝑫𝑨𝑴𝑰 𝑰𝑺 𝑯𝑰𝑴 ⚠️
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
𝕯𝖆𝖒𝖎’𝖘 𝖘𝖎𝖑𝖊𝖓𝖈𝖊𝖗 BASE - 𝑫𝑨𝑴𝑰 𝑰𝑺 𝑯𝑰𝑴
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
${chalk.green.bold("Server Info:")}
• Platform   : ${os.platform()}
• Architecture: ${os.arch()}
• CPU Model  : ${os.cpus()[0].model}
• Total Memory: ${(os.totalmem() / 1024 / 1024).toFixed(2)} MB
• Free Memory : ${(os.freemem() / 1024 / 1024).toFixed(2)} MB
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬
`));
// Function to start the bot
async function StartBot() {
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const ask = makeWASocket({
        logger: pino({ level: "silent" }),
        printQRInTerminal: !usePairingCode,
        auth: state,
        browser: ["Ubuntu", "Chrome", "20.0.04"]
    });

    // Anti-spam initialization
    const antiSpam = new AntiSpamSystem(ask);

    // Connection handling
    if (!ask.authState.creds.registered) {
        console.log(chalk.blue("Enter your number, without the plus (+) e.g. 241"));
        const phoneNumber = await question(chalk.blue('📱 Your Number\n> '));
        const customPairingCode = "DAMI-BOTZ";
        console.log(chalk.blue("⏳ Please wait a moment to retrieve a connection code..."));
        try {
            const code = await ask.requestPairingCode(phoneNumber.trim(), customPairingCode);
            console.log(chalk.red.bold(`✅ Your connection code: ${code}`));
        } catch (error) {
            console.log(chalk.red("❌ Unable to retrieve code, please enter a valid number..."));
        }
    }

    // Event listener for connection updates
    ask.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === 'open') {
            ask.newsletterFollow("120363377534493877@newsletter");
            ask.sendMessage(ask.user.id, {
                image: { url: "https://files.catbox.moe/1yhfx2.jpg" },
                caption: "✅ Bot connected successfully!"
            });
        }
    });
}
                caption: `
 ──✧* 𝕯𝖆𝖒𝖎’𝖘 𝖘𝖎𝖑𝖊𝖓𝖈𝖊𝖗 *✧───╮
├ ❏ DEV NUMBER: +2349120185747
├ ❏ BOT NAME : *𝕯𝖆𝖒𝖎’𝖘 𝖘𝖎𝖑𝖊𝖓𝖈𝖊𝖗*
├ ❏ TOTAL COMMANDS : 47
├ ❏ PREFIX : *${global.prefix}*
├ ❏ DEV : 𝑫𝑨𝑴𝑰 𝑰𝑺 𝑯𝑰𝑴
├ ❏ VERSION : *2.0*
╰──────────────╯
╭──✧*WA GROUP*✧───╮
├ ❏ *${global.group}*
╰──────────────╯
╭──✧*WA CHANNEL*✧───╮
├ ❏ *${global.chanel}*
╰──────────────╯
> 𝖳𝖧𝖤 𝖡𝖮𝖳 𝕯𝖆𝖒𝖎’𝖘 𝖘𝖎𝖑𝖊𝖓𝖈𝖊𝖗 IS CONNECTED ✅..!!
> 𝖯𝖮𝖶𝖤𝖱ED BY 𝑫𝑨𝑴𝑰 𝑰𝑺 𝑯𝑰𝑴`
});
console.log(chalk.green('Bot connected!'));
} else if (connection === 'close') {
    const reason = lastDisconnect?.error?.output?.statusCode;
    if (reason === DisconnectReason.badSession) {
        console.warn('Bad session, please delete session and scan again.');
        process.exit();
    } else if (reason === DisconnectReason.connectionClosed) {
        console.warn('Connection closed, attempting to reconnect...');
        await sleep(5000);
        StartBot();
    } else if (reason === DisconnectReason.connectionLost) {
        console.warn('Connection lost, attempting to reconnect...');
        await sleep(5000);
        StartBot();
    } else if (reason === DisconnectReason.connectionReplaced) {
        console.warn('Session replaced, logging out...');
        ask.logout();
    } else if (reason === DisconnectReason.loggedOut) {
        console.warn('Logged out, please scan again.');
        ask.logout();
    } else if (reason === DisconnectReason.restartRequired) {
        console.warn('Restart required, restarting...');
        await StartBot();
    } else if (reason === DisconnectReason.timedOut) {
        console.warn('Connection timed out, attempting to reconnect...');
        await sleep(5000);
        StartBot();
    } else {
        console.warn('Connection closed for unknown reason, attempting to reconnect...');
        await sleep(5000);
        StartBot();
    }
} else if (connection === "connecting") {
    console.warn('Connecting...');
}
    // Message handler with anti-spam
ask.ev.on('messages.upsert', async ({ messages, type }) => {
    try {
        const msg = messages[0] || messages[messages.length - 1];
        if (type !== "notify") return;
        if (!msg?.message) return;

        // Status handling
        if (msg.key && msg.key.remoteJid === "status@broadcast") {
            await ask.readMessages([msg.key]);
            await ask.sendMessage(msg.key.remoteJid, { react: { text: "🥀", key: msg.key }});
            return;
        }

        // Anti-spam check
        if (await antiSpam.handleMessage(msg)) return;

        const m = smsg(ask, msg, store);
        require(`./ask-xmd`)(ask, m, msg, store);

        // Reset counter if bot replied
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
        console.error('Error in messages.upsert (typing):', err);
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
ask.sendText = (jid, text, quoted = '', options) => ask.sendMessage(jid, { text: text, ...options }, { quoted });

// Update contacts
ask.ev.on('contacts.update', update => {
    for (let contact of update) {
        let id = ask.decodeJid(contact.id);
        if (store && store.contacts) {
            store.contacts[id] = { id, name: contact.notify };
        }
    }
});

// Save credentials on update
ask.ev.on('creds.update', saveCreds);

return ask;
}

StartBot().catch(err => {
    console.error('Error in StartBot:', err);
    process.exit(1);
});