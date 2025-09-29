// index.js
require('./system/config');
const { StartBot } = require('./system/start');

// Launch bot
StartBot().catch(err => {
    console.error('❌ Bot start failed:', err);
    process.exit(1);
});