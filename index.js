
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

console.log("🚀 Multi Panel Reaction Bot Started");

// =========================
// BOT CONFIG
// =========================

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, {
  polling: true
});

// =========================
// OWNER ID
// =========================

const OWNER_ID = 6402927432;

// =========================
// TARGET CHANNELS
// =========================

const CHANNELS = [
  "@Dnexon55Pros",
  "@URVIGAMER",
  "@Tricky_Earner_Is_Live",
  "@rajagameofficial34",
  "@GROW_MASTER",
  "@Raja_Game_bunny",
  "@rajagame_srishti",
  "@Tashanwin3",
  "@Pawanchauhan9319",
  "@NumberWinChannel",
  "@damanpr0"
];

// =========================
// MODES
// =========================

let CURRENT_MODE = "all";

// =========================
// PANELS
// =========================

const PANELS = {

  lower: {
    name: "Lower Panel",
    url: "https://smmlite.com/api/v2",
    key: process.env.API_KEY_LOWER,
    service: "5160"
  },

  medium: {
    name: "Medium Panel",
    url: "https://groompanel.com/api/v2",
    key: process.env.API_KEY_MEDIUM,
    service: "6921"
  },

  large: {
    name: "Large Panel",
    url: "https://www.smmbin.com/api/v2",
    key: process.env.API_KEY_LARGE,
    service: "7330"
  }

};

// =========================
// QUANTITY POOLS
// =========================

const LOWER = [57, 15, 10, 13, 18, 11];
const MEDIUM = [100, 200, 230, 430, 530];
const LARGE = [193, 150, 230, 320, 136];

// =========================
// CUSTOM QUANTITY (NEW FEATURE)
// =========================

let customQuantity = {
  lower: null,   // null means use random pool
  medium: null,
  large: null
};

// =========================
// ANTI REPEAT SYSTEM
// =========================

let lastLower = null;
let lastMedium = null;
let lastLarge = null;

function randomUnique(arr, lastValue) {
  let filtered = arr.filter(x => x !== lastValue);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

// =========================
// GET QUANTITY (with custom override)
// =========================

function getQuantity(panelKey, lastValue) {
  // Agar custom quantity set hai to wahi use karo
  if (customQuantity[panelKey] !== null) {
    return customQuantity[panelKey];
  }
  // Warna random pool se lo
  let pool;
  if (panelKey === 'lower') pool = LOWER;
  else if (panelKey === 'medium') pool = MEDIUM;
  else pool = LARGE;
  return randomUnique(pool, lastValue);
}

// =========================
// SEND ORDER
// =========================

async function sendOrder(panel, link, quantity) {
  try {
    console.log(`🚀 Sending Order`);
    console.log(`📦 Panel: ${panel.name}`);
    console.log(`🔗 Link: ${link}`);
    console.log(`📊 Quantity: ${quantity}`);

    const res = await axios.post(panel.url, {
      key: panel.key,
      action: "add",
      service: panel.service,
      link: link,
      quantity: quantity
    });

    console.log("✅ API RESPONSE:", res.data);

    if (res.data.order) {
      console.log(`✅ SUCCESS ORDER ID: ${res.data.order}`);
    } else {
      console.log("❌ FAILED");
    }
  } catch (err) {
    console.log("❌ ERROR:", err.message);
  }
}

// =========================
// ONLY OWNER CAN USE COMMANDS
// =========================

function isOwner(msg) {
  return msg.from.id === OWNER_ID;
}

// =========================
// EXISTING COMMANDS
// =========================

bot.onText(/\/lower/, async (msg) => {
  if (!isOwner(msg)) return;
  CURRENT_MODE = "lower";
  bot.sendMessage(msg.chat.id, "✅ LOWER MODE ACTIVATED");
});

bot.onText(/\/medium/, async (msg) => {
  if (!isOwner(msg)) return;
  CURRENT_MODE = "medium";
  bot.sendMessage(msg.chat.id, "✅ MEDIUM MODE ACTIVATED");
});

bot.onText(/\/large/, async (msg) => {
  if (!isOwner(msg)) return;
  CURRENT_MODE = "large";
  bot.sendMessage(msg.chat.id, "✅ LARGE MODE ACTIVATED");
});

bot.onText(/\/all/, async (msg) => {
  if (!isOwner(msg)) return;
  CURRENT_MODE = "all";
  bot.sendMessage(msg.chat.id, "✅ ALL MODE ACTIVATED");
});

bot.onText(/\/status/, async (msg) => {
  if (!isOwner(msg)) return;
  bot.sendMessage(msg.chat.id,
`🤖 BOT STATUS

🔥 CURRENT MODE: ${CURRENT_MODE}

📢 CHANNELS:
${CHANNELS.join("\n")}
`
  );
});

// =========================
// NEW COMMANDS FOR CUSTOM QUANTITY
// =========================

// /qty <number> - set custom quantity for current mode
bot.onText(/\/qty (.+)/, async (msg, match) => {
  if (!isOwner(msg)) return;
  const num = parseInt(match[1]);
  if (isNaN(num) || num <= 0) {
    return bot.sendMessage(msg.chat.id, "❌ Please provide a valid positive number. Example: `/qty 500`");
  }
  
  let panelKey = null;
  if (CURRENT_MODE === "lower") panelKey = "lower";
  else if (CURRENT_MODE === "medium") panelKey = "medium";
  else if (CURRENT_MODE === "large") panelKey = "large";
  else {
    return bot.sendMessage(msg.chat.id, "❌ Cannot set custom quantity in `all` mode. Switch to lower/medium/large first.");
  }
  
  customQuantity[panelKey] = num;
  bot.sendMessage(msg.chat.id, `✅ Custom quantity set to **${num}** for **${CURRENT_MODE.toUpperCase()}** mode.`);
});

// /resetqty - reset custom quantity for current mode
bot.onText(/\/resetqty/, async (msg) => {
  if (!isOwner(msg)) return;
  let panelKey = null;
  if (CURRENT_MODE === "lower") panelKey = "lower";
  else if (CURRENT_MODE === "medium") panelKey = "medium";
  else if (CURRENT_MODE === "large") panelKey = "large";
  else {
    return bot.sendMessage(msg.chat.id, "❌ Reset not allowed in `all` mode. Switch to a single mode.");
  }
  
  customQuantity[panelKey] = null;
  bot.sendMessage(msg.chat.id, `✅ Custom quantity removed for **${CURRENT_MODE.toUpperCase()}** mode. Now using random pool.`);
});

// /showqty - show current custom quantity for each mode
bot.onText(/\/showqty/, async (msg) => {
  if (!isOwner(msg)) return;
  let msgText = `📊 **Custom Quantities**\n\n`;
  msgText += `Lower: ${customQuantity.lower !== null ? customQuantity.lower : "❌ (random pool)"}\n`;
  msgText += `Medium: ${customQuantity.medium !== null ? customQuantity.medium : "❌ (random pool)"}\n`;
  msgText += `Large: ${customQuantity.large !== null ? customQuantity.large : "❌ (random pool)"}`;
  bot.sendMessage(msg.chat.id, msgText);
});

// =========================
// DUPLICATE PROTECTION
// =========================

let processed = new Set();

// =========================
// CHANNEL POST LISTENER (MODIFIED to use getQuantity)
// =========================

bot.on("channel_post", async (msg) => {
  try {
    const username = msg.chat.username ? "@" + msg.chat.username : null;
    if (!CHANNELS.includes(username)) return;

    const uniqueKey = `${username}_${msg.message_id}`;
    if (processed.has(uniqueKey)) return;
    processed.add(uniqueKey);

    const link = `https://t.me/${username.replace("@", "")}/${msg.message_id}`;
    console.log("📢 NEW POST:", link);

    // =========================
    // LOWER MODE
    // =========================
    if (CURRENT_MODE === "lower") {
      const qty = getQuantity("lower", lastLower);
      lastLower = (customQuantity.lower === null) ? qty : lastLower; // update last only if random
      await sendOrder(PANELS.lower, link, qty);
    }
    // =========================
    // MEDIUM MODE
    // =========================
    else if (CURRENT_MODE === "medium") {
      const qty = getQuantity("medium", lastMedium);
      lastMedium = (customQuantity.medium === null) ? qty : lastMedium;
      await sendOrder(PANELS.medium, link, qty);
    }
    // =========================
    // LARGE MODE
    // =========================
    else if (CURRENT_MODE === "large") {
      const qty = getQuantity("large", lastLarge);
      lastLarge = (customQuantity.large === null) ? qty : lastLarge;
      await sendOrder(PANELS.large, link, qty);
    }
    // =========================
    // ALL MODE
    // =========================
    else if (CURRENT_MODE === "all") {
      // LOWER
      const lowerQty = getQuantity("lower", lastLower);
      lastLower = (customQuantity.lower === null) ? lowerQty : lastLower;
      await sendOrder(PANELS.lower, link, lowerQty);
      await new Promise(r => setTimeout(r, 20000));
      
      // MEDIUM
      const mediumQty = getQuantity("medium", lastMedium);
      lastMedium = (customQuantity.medium === null) ? mediumQty : lastMedium;
      await sendOrder(PANELS.medium, link, mediumQty);
      await new Promise(r => setTimeout(r, 30000));
      
      // LARGE
      const largeQty = getQuantity("large", lastLarge);
      lastLarge = (customQuantity.large === null) ? largeQty : lastLarge;
      await sendOrder(PANELS.large, link, largeQty);
    }
  } catch (err) {
    console.log("❌ MAIN ERROR:", err.message);
  }
});
