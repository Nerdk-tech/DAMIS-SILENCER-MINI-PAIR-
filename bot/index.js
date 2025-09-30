// bot/index.js - exported StartBot and generatePairingCode
const path = require('path')
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeInMemoryStore, jidDecode } = require('@whiskeysockets/baileys')
const pino = require('pino')
const chalk = require('chalk')
const os = require('os')
const crypto = require('crypto')
globalThis.crypto = crypto.webcrypto

let store
try { store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) }) } catch(e){}

const usePairingCode = true

async function StartBot() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'session'))
    const ask = makeWASocket({
      logger: pino({ level: "silent" }),
      printQRInTerminal: !usePairingCode,
      auth: state,
      browser: ["Ubuntu", "Chrome", "20.0.04"]
    })
    try { store && store.bind && store.bind(ask.ev) } catch(e){}
    ask.ev.on("connection.update", async (update) => {
      const { connection } = update
      if (connection === 'open') {
        console.log(chalk.green('Bot connected!'))
      } else if (connection === 'close') {
        console.warn('Connection closed, retrying...')
      }
    })
    ask.ev.on('creds.update', saveCreds)
    // expose sock for status checks
    module.exports._sock = ask
    return ask
  } catch (e) {
    console.error('StartBot error', e)
    throw e
  }
}

async function generatePairingCode(phone) {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'session'))
    const sock = makeWASocket({
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
      auth: state,
      browser: ["Ubuntu", "Chrome", "20.0.04"]
    })
    sock.ev.on('creds.update', saveCreds)
    if (typeof sock.requestPairingCode === 'function') {
      const code = await sock.requestPairingCode(phone.trim(), "DAMI-BOTZ")
      return { code, expires: null }
    } else {
      throw new Error('requestPairingCode not available')
    }
  } catch (e) {
    console.error('generatePairingCode error', e)
    throw e
  }
}

module.exports = { StartBot, generatePairingCode }
