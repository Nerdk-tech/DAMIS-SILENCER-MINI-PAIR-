const express = require('express')
const path = require('path')

const app = express()
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

// Start bot module
let botModule = null
try {
  botModule = require('./bot/index.js')
  // If botModule exports StartBot, start it in background
  if (typeof botModule.StartBot === 'function') {
    botModule.StartBot().then((sock) => {
      console.log('Bot started (StartBot resolved).')
      // store sock if returned
      botModule._sock = sock
    }).catch(err => {
      console.error('Bot StartBot() error:', err && err.message ? err.message : err)
    })
  } else {
    console.log('Bot module loaded (no StartBot exported).')
  }
} catch (e) {
  console.warn('Could not require ./bot/index.js:', e && e.message ? e.message : e)
}

// /pair endpoint uses bot/pairing.js which calls bot/index.js helpers
app.post('/pair', async (req, res) => {
  const phone = req.body?.phone
  if (!phone) return res.status(400).json({ success: false, message: 'Phone required' })

  try {
    // Load pairing helper
    const pairing = require('./bot/pairing')
    const out = await pairing.generatePairingCode(phone, botModule)
    // Normalize output
    if (typeof out === 'string') return res.json({ success: true, code: out })
    if (out && out.code) return res.json({ success: true, code: out.code, expires: out.expires || null, note: out.note })
    return res.json({ success: true, code: out })
  } catch (err) {
    console.error('pair error', err)
    return res.status(500).json({ success: false, message: err.message || 'Pairing failed' })
  }
})

// status endpoint
app.get('/status', (req, res) => {
  try {
    let status = { connected: false, details: 'No bot detected' }
    const fs = require('fs')
    if (botModule && botModule._sock) {
      const sock = botModule._sock
      const ready = sock?.socket?.connected || sock?.wsState === 'open' || sock?._events
      status.connected = !!ready
      status.details = ready ? 'Bot socket looks active' : 'Bot loaded but socket not active'
    } else {
      const possible = [
        './bot/session', './bot/auth_info.json', './bot/session.json', './bot/system/database/session.json'
      ]
      for (const p of possible) if (fs.existsSync(p)) status.details = `Found ${p}`
    }
    res.json(status)
  } catch (e) {
    res.json({ connected: false, details: 'Error: ' + (e && e.message) })
  }
})

// fallback serve index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`🚀 DAMI'S SILENCER running on ${PORT}`))
