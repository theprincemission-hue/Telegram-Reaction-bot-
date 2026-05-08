const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

console.log("🚀 Bot Started");

// 🔐 ENV
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// 📢 YOUR CHANNELS
const CHANNELS = [
  "@Dnexon55Pros",
  "@Godgamerislive",
  "@trickyearnerislive",
  "@TrickyBhaiIsLive",
  "@trickybhaiiiislive",
  "@MasterMind_Prediction"
];

// 🔥 SMMLITE PANEL (YOUR CONFIG)
const ACTIVE_PANEL = {
  name: "SMMLite",
  url: "https://smmlite.com/api/v2",
  key: process.env.API_KEY,
  service: "5160"
};

// 📦 SEND ORDER FUNCTION
async function sendOrder(link, quantity) {
  try {
    console.log("👉 Sending Link:", link);
    console.log("👉 Service:", ACTIVE_PANEL.service);
    console.log("👉 Quantity:", quantity);

    const res = await axios.post(ACTIVE_PANEL.url, {
      key: ACTIVE_PANEL.key,
      action: "add",
      service: ACTIVE_PANEL.service,
      link: link,
      quantity: quantity
    });

    console.log("👉 API Response:", res.data);

    if (res.data && res.data.order) {
      console.log("✅ Order Success ID:", res.data.order);
      return true;
    } else {
      console.log("❌ Order Failed");
    }

  } catch (err) {
    console.log("❌ Error:", err.message);
  }
  return false;
}

// 🧠 DUPLICATE PROTECTION (FIXED)
let processed = new Set();

// 📩 CHANNEL POST LISTENER
bot.on("channel_post", async (msg) => {
  try {
    const username = msg.chat.username ? "@" + msg.chat.username : null;

    // ❌ Ignore unknown channels
    if (!CHANNELS.includes(username)) return;

    const uniqueKey = `${username}_${msg.message_id}`;

    if (processed.has(uniqueKey)) return;
    processed.add(uniqueKey);

    // 🔗 Correct link format
    const link = `https://t.me/${username.replace("@", "")}/${msg.message_id}`;

    console.log("📢 New Post Detected:", link);

    // ⚡ SAFE TEST MODE (ONLY ONE ORDER FIRST)
    const burst = [1620];

    for (let qty of burst) {
      await sendOrder(link, qty);
      await new Promise(r => setTimeout(r, 30000)); // 30 sec delay
    }

  } catch (err) {
    console.log("❌ Error:", err.message);
  }
});
