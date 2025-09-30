const express = require('express')
const path = require('path')
const { makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys')

const app = express()
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

// simple in-memory socket
let sock = null

async function generatePairingCode(phone) {
  if (!phone) throw new Error('Phone number required')

  const { state, saveCreds } = await useMultiFileAuthState('./bot/session')
  sock = makeWASocket({
    auth: state,
    printQRInTerminal: false
  })

  const code = await sock.requestPairingCode(phone)
  return code
}

// API route: generate pairing code
app.post('/pair', async (req, res) => {
  const { phone } = req.body || {}
  if (!phone) return res.status(400).json({ message: 'Phone required' })

  try {
    const code = await generatePairingCode(phone)
    res.json({ success: true, code })
  } catch (err) {
    console.error('Pair error', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// Status endpoint
app.get('/status', (req, res) => {
  const connected = sock?.ws?.readyState === 1
  res.json({ connected })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => console.log(`🚀 DAMI'S SILENCER running on ${PORT}`))
