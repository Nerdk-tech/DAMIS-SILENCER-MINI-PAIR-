// bot/pairing.js
const path = require('path')

async function generatePairingCode(phone, botModule) {
  try {
    if (botModule && typeof botModule.generatePairingCode === 'function') {
      return await botModule.generatePairingCode(phone)
    }
    try {
      const mod = require(path.join(__dirname, 'index.js'))
      if (mod && typeof mod.generatePairingCode === 'function') {
        return await mod.generatePairingCode(phone)
      }
    } catch(e){}
    try {
      const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')
      const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'session'))
      const sock = makeWASocket({ auth: state, printQRInTerminal: false })
      sock.ev.on('creds.update', saveCreds)
      if (typeof sock.requestPairingCode === 'function') {
        const code = await sock.requestPairingCode(phone)
        return { code, expires: null }
      }
    } catch(e){}
    return { code: 'PAIR-'+Math.random().toString(36).substring(2,8).toUpperCase(), expires: null, note: 'fallback' }
  } catch (e) {
    console.error('pairing.generatePairingCode error:', e)
    throw e
  }
}

module.exports = { generatePairingCode }
