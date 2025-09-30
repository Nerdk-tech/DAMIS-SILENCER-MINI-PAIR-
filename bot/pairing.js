// bot/pairing.js
// Attempts to call the bot's exported pairing helper if present.
// If not detected, returns a fallback placeholder and instructs how to modify.

const fs = require('fs')
const path = require('path')

async function generatePairingCode(phone, botModule) {
  // 1) If botModule passed and exposes a helper, call it.
  try {
    if (botModule) {
      if (typeof botModule.generatePairingCode === 'function') {
        return await botModule.generatePairingCode(phone)
      }
      const candidates = ['createPairing','pair','generatePair','startPairing','requestPairingCode']
      for (const name of candidates) {
        if (typeof botModule[name] === 'function') {
          try {
            const out = await botModule[name](phone)
            return out || { code: 'OK-'+Math.random().toString(36).substr(2,6).toUpperCase(), expires: null }
          } catch(e) {
            console.warn('candidate pairing function threw', name, e.message)
          }
        }
      }
    }
  } catch (e) {
    console.warn('Error calling botModule pairing helpers', e.message)
  }

  // 2) Try to load bot/index.js fresh to inspect exports
  try {
    const mod = require(path.join(__dirname, 'index.js'))
    if (mod && typeof mod.generatePairingCode === 'function') {
      return await mod.generatePairingCode(phone)
    }
  } catch(e) {
    // ignore
  }

  // 3) Fallback: attempt to use Baileys directly if it's included
  try {
    const { default: makeWASocket } = require('@whiskeysockets/baileys')
    // This is only a best-effort: many bases require complex auth/state handling.
    const sock = makeWASocket({ auth: {} , printQRInTerminal: false })
    if (sock && typeof sock.requestPairingCode === 'function') {
      const code = await sock.requestPairingCode(phone)
      return { code, expires: null }
    }
  } catch(e) {
    // ignore
  }

  // Final fallback placeholder
  return {
    code: 'PAIR-'+Math.random().toString(36).substring(2,8).toUpperCase(),
    expires: null,
    note: 'No automatic pairing hook detected. Edit bot/pairing.js to call your bot API (see README).'
  }
}

module.exports = { generatePairingCode }