const { extractMessageContent, getDevice, jidNormalizedUser, proto, delay, getContentType, areJidsSameUser } = require("@whiskeysockets/baileys");
const chalk = require("chalk");
const fs = require("fs");
const Crypto = require("crypto");
const axios = require("axios");
const moment = require("moment-timezone");
const { sizeFormatter } = require("human-readable");
const util = require("util");
const { defaultMaxListeners } = require("stream");
const Jimp = require("jimp"); // ✅ FIXED: import Jimp

// ========== HELPERS ==========
exports.unixTimestampSeconds = (date = new Date()) => Math.floor(date.getTime() / 1000);

exports.generateMessageTag = (epoch) => {
  let tag = exports.unixTimestampSeconds().toString();
  if (epoch) tag += ".--" + epoch;
  return tag;
};

exports.processTime = (timestamp, now) => {
  return moment.duration(now - moment(timestamp * 1000)).asSeconds();
};

exports.getRandom = (ext) => `${Math.floor(Math.random() * 10000)}${ext}`;

exports.checkBandwidth = async () => {
  let ind = 0;
  let out = 0;
  for (let i of await require("node-os-utils").netstat.stats()) {
    ind += parseInt(i.inputBytes);
    out += parseInt(i.outputBytes);
  }
  return {
    download: exports.bytesToSize(ind),
    upload: exports.bytesToSize(out),
  };
};

exports.getBuffer = async (url, options) => {
  try {
    const res = await axios.get(url, {
      responseType: "arraybuffer",
      headers: { "DNT": 1, "Upgrade-Insecure-Request": 1 },
      ...options,
    });
    return res.data;
  } catch (err) {
    return err;
  }
};

exports.formatSize = (bytes) => {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
};

exports.fetchJson = async (url, options) => {
  try {
    const res = await axios.get(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      ...options,
    });
    return res.data;
  } catch (err) {
    return err;
  }
};

exports.reSize = async (buffer, w, h) => {
  const image = await Jimp.read(buffer);
  return await image.resize(w, h).getBufferAsync(Jimp.MIME_JPEG);
};

exports.runtime = (seconds) => {
  seconds = Number(seconds);
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${d ? d + "d " : ""}${h ? h + "h " : ""}${m ? m + "m " : ""}${s ? s + "s" : ""}`;
};

exports.clockString = (ms) => {
  let h = isNaN(ms) ? "--" : Math.floor(ms / 3600000);
  let m = isNaN(ms) ? "--" : Math.floor(ms / 60000) % 60;
  let s = isNaN(ms) ? "--" : Math.floor(ms / 1000) % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, 0)).join(":");
};

exports.sleep = (ms) => new Promise((r) => setTimeout(r, ms));

exports.isUrl = (url) => /^https?:\/\/\S+$/gi.test(url);

exports.getTime = (format, date) => {
  return date ? moment(date).locale("id").format(format) : moment.tz("Asia/Jakarta").locale("id").format(format);
};

exports.formatp = sizeFormatter({
  std: "JEDEC",
  decimalPlaces: 2,
  keepTrailingZeroes: false,
  render: (literal, symbol) => `${literal} ${symbol}B`,
});

exports.formatDate = (n, locale = "id") => {
  let d = new Date(n);
  return d.toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });
};

exports.jsonformat = (obj) => JSON.stringify(obj, null, 2);

exports.logic = (check, inp, out) => {
  if (inp.length !== out.length) throw new Error("Input and Output must have same length");
  for (let i in inp) if (util.isDeepStrictEqual(check, inp[i])) return out[i];
  return null;
};

exports.generateProfilePicture = async (buffer) => {
  const jimp = await Jimp.read(buffer);
  const cropped = jimp.crop(0, 0, jimp.getWidth(), jimp.getHeight());
  return {
    img: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
    preview: await cropped.scaleToFit(720, 720).getBufferAsync(Jimp.MIME_JPEG),
  };
};

exports.bytesToSize = (bytes, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

// ========== SERIALIZER ==========
exports.smsg = (ask, m, store) => {
  if (!m) return m;
  let M = proto.WebMessageInfo;
  if (m.key) {
    m.id = m.key.id;
    m.chat = m.key.remoteJid;
    m.fromMe = m.key.fromMe;
    m.isGroup = m.chat.endsWith("@g.us");
    m.sender = ask.decodeJid(m.fromMe ? ask.user.id : (m.participant || m.key.participant || m.chat));
  }
  if (m.message) {
    m.mtype = getContentType(m.message);
    m.msg = (m.mtype == "viewOnceMessage" ? m.message[m.mtype].message[getContentType(m.message[m.mtype].message)] : m.message[m.mtype]);
    m.text = m.message.conversation || m.msg.caption || m.msg.text || "";
  }
  m.reply = (text, chatId = m.chat, options = {}) =>
    Buffer.isBuffer(text) ? ask.sendMessage(chatId, { image: text, caption: "" }, { quoted: m }) : ask.sendMessage(chatId, { text, ...options }, { quoted: m });
  return m;
};

// ========== AUTO RELOAD ==========
let file = require.resolve(__filename);
fs.watchFile(file, () => {
  fs.unwatchFile(file);
  console.log(chalk.redBright(`Update ${__filename}`));
  delete require.cache[file];
  require(file);
});
