const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

console.log("🚀 Bot Started");

// 🔐 ENV
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// 📢 MULTI CHANNEL SUPPORT
const CHANNELS = [
  "@channel1",   // 👉 yahan apna channel daalo
  "@channel2"
];

// 🔥 ACTIVE SMM PANEL (SMMLite)
const ACTIVE_PANEL = {
  name: "SMMLite",
  url: "https://smmlite.com/api/v2",
  key: process.env.API_KEY,
  service: "1234" // ⚠️ yahan apna REAL service ID daalo
};

// 📦 SEND ORDER FUNCTION
async function sendOrder(link, quantity) {
  try {
    console.log(`📤 Sending ${quantity} via ${ACTIVE_PANEL.name}`);

    const res = await axios.post(ACTIVE_PANEL.url, {
      key: ACTIVE_PANEL.key,
      action: "add",
      service: ACTIVE_PANEL.service,
      link: link,
      quantity: quantity
    });

    if (res.data && res.data.order) {
      console.log("✅ Order Success:", res.data.order);
      return true;
    } else {
      console.log("❌ Order Failed:", res.data);
    }

  } catch (err) {
    console.log("❌ Error:", err.message);
  }
  return false;
}

// 🧠 DUPLICATE PROTECTION
let processed = new Set();

// 📩 LISTENER
bot.on("channel_post", async (msg) => {
  try {
    const username = msg.chat.username ? "@" + msg.chat.username : null;

    // ❌ ignore other channels
    if (!CHANNELS.includes(username)) return;

    // ❌ prevent duplicate
    if (processed.has(msg.message_id)) return;
    processed.add(msg.message_id);

    // 🔗 post link
    const link = `https://t.me/${username.replace("@", "")}/${msg.message_id}`;
    console.log("📢 New Post:", link);

    // ⚡ BURST MODE (fast delivery)
    const burst = [100, 100, 200];

    for (let qty of burst) {
      await sendOrder(link, qty);
      await new Promise(r => setTimeout(r, 15000)); // 15 sec delay
    }

  } catch (err) {
    console.log("❌ Error:", err.message);
  }
});
