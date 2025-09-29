const axios = require("axios");
const moment = require("moment-timezone");

// Fetch JSON helper
const fetchJson = async (url, options = {}) => {
    try {
        const res = await axios.get(url, options);
        return res.data;
    } catch (err) {
        console.error("fetchJson error:", err.message);
        return null;
    }
};

// Sleep helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Await helper (renamed because await is reserved)
const awaitfunc = (time) => new Promise(resolve => setTimeout(resolve, time));

// Smart message wrapper
const smsg = (conn, m, store) => {
    if (!m) return m;

    try {
        const M = {};
        M.id = m.key.id;
        M.chat = m.key.remoteJid;
        M.fromMe = m.key.fromMe;
        M.isGroup = M.chat.endsWith("@g.us");
        M.sender = m.key.fromMe 
            ? conn.user.id 
            : (M.isGroup ? m.key.participant : m.key.remoteJid);

        if (m.message) {
            M.type = Object.keys(m.message)[0];
            M.text = (
                m.message.conversation ||
                m.message.extendedTextMessage?.text ||
                m.message.caption ||
                ""
            );
        } else {
            M.type = null;
            M.text = "";
        }

        return M;
    } catch (err) {
        console.error("smsg error:", err);
        return m;
    }
};

// Format time helper (instead of human-readable)
const formatTime = (ms) => {
    const sec = Math.floor((ms / 1000) % 60);
    const min = Math.floor((ms / (1000 * 60)) % 60);
    const hr = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const day = Math.floor(ms / (1000 * 60 * 60 * 24));

    return `${day}d ${hr}h ${min}m ${sec}s`;
};

// Format date with timezone
const formatDate = (tz = "Africa/Lagos") => {
    return moment().tz(tz).format("YYYY-MM-DD HH:mm:ss");
};

module.exports = { fetchJson, sleep, await: awaitfunc, smsg, formatTime, formatDate };
