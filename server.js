const express = require('express')
const path = require('path')

const app = express()
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

let botModule = null
try {
  // require the bot index; many Telexwa bases start when required
  botModule = require('./bot/index.js')
  console.log('Bot module loaded.')
} catch (e) {
  console.warn('Could not require ./bot/index.js — the bot may still be runnable manually.', e.message)
}

// pairing wrapper uses bot/pairing.js
const { generatePairingCode } = require('./bot/pairing')

app.post('/pair', async (req, res) => {
  const { phone } = req.body || {}
  if (!phone) return res.status(400).json({ message: 'Phone required' })
  try {
    const out = await generatePairingCode(phone, botModule)
    res.json(out)
  } catch (err) {
    console.error('pair error', err)
    res.status(500).json({ message: 'Pairing failed', error: err.message })
  }
})

app.get('/status', (req, res) => {
  // Try to infer connection status from botModule
  try {
    let status = { connected: false, details: 'Not connected or not detected' }
    if (botModule) {
      if (typeof botModule.isConnected === 'boolean') {
        status.connected = botModule.isConnected
        status.details = 'botModule.isConnected flag'
      } else if (botModule.wsState) {
        status.connected = botModule.wsState === 'open'
        status.details = 'botModule.wsState'
      } else if (botModule.sock && botModule.sock.ws && botModule.sock.ws.readyState === 1) {
        status.connected = true
        status.details = 'botModule.sock websocket open'
      } else if (botModule?.authFile || botModule?.auth) {
        status.details = 'Auth files detected - not currently connected'
      } else {
        status.details = 'bot module loaded but connection not detected automatically'
      }
    } else {
      // fallback: check for common auth/session files
      const fs = require('fs')
      const possible = [
        './bot/auth_info.json', './bot/session.json', './bot/system/database/session.json',
        './bot/system/database/owner.json'
      ]
      for (const p of possible) {
        if (fs.existsSync(p)) {
          status.details = `Found ${p}`
          break
        }
      }
    }
    res.json(status)
  } catch (e) {
    res.json({ connected: false, details: 'Error checking status: ' + e.message })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`DAMI'S SILENCER running on port ${PORT}`))