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

const LOWER = [321, 515, 620, 713, 618, 811];

const MEDIUM = [100, 200, 230, 430, 530];

const LARGE = [193, 150, 230, 320, 136];

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
// COMMANDS
// =========================

bot.onText(/\/lower/, async (msg) => {

  if (!isOwner(msg)) return;

  CURRENT_MODE = "lower";

  bot.sendMessage(msg.chat.id,
    "✅ LOWER MODE ACTIVATED");
});

bot.onText(/\/medium/, async (msg) => {

  if (!isOwner(msg)) return;

  CURRENT_MODE = "medium";

  bot.sendMessage(msg.chat.id,
    "✅ MEDIUM MODE ACTIVATED");
});

bot.onText(/\/large/, async (msg) => {

  if (!isOwner(msg)) return;

  CURRENT_MODE = "large";

  bot.sendMessage(msg.chat.id,
    "✅ LARGE MODE ACTIVATED");
});

bot.onText(/\/all/, async (msg) => {

  if (!isOwner(msg)) return;

  CURRENT_MODE = "all";

  bot.sendMessage(msg.chat.id,
    "✅ ALL MODE ACTIVATED");
});

// =========================
// STATUS COMMAND
// =========================

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
// DUPLICATE PROTECTION
// =========================

let processed = new Set();

// =========================
// CHANNEL POST LISTENER
// =========================

bot.on("channel_post", async (msg) => {

  try {

    const username = msg.chat.username
      ? "@" + msg.chat.username
      : null;

    // IGNORE UNKNOWN CHANNELS
    if (!CHANNELS.includes(username)) return;

    const uniqueKey =
      `${username}_${msg.message_id}`;

    // DUPLICATE CHECK
    if (processed.has(uniqueKey)) return;

    processed.add(uniqueKey);

    // CREATE POST LINK
    const link =
      `https://t.me/${username.replace("@", "")}/${msg.message_id}`;

    console.log("📢 NEW POST:", link);

    // =========================
    // LOWER MODE
    // =========================

    if (CURRENT_MODE === "lower") {

      const qty =
        randomUnique(LOWER, lastLower);

      lastLower = qty;

      await sendOrder(
        PANELS.lower,
        link,
        qty
      );

    }

    // =========================
    // MEDIUM MODE
    // =========================

    else if (CURRENT_MODE === "medium") {

      const qty =
        randomUnique(MEDIUM, lastMedium);

      lastMedium = qty;

      await sendOrder(
        PANELS.medium,
        link,
        qty
      );

    }

    // =========================
    // LARGE MODE
    // =========================

    else if (CURRENT_MODE === "large") {

      const qty =
        randomUnique(LARGE, lastLarge);

      lastLarge = qty;

      await sendOrder(
        PANELS.large,
        link,
        qty
      );

    }

    // =========================
    // ALL MODE
    // =========================

    else if (CURRENT_MODE === "all") {

      // LOWER
      const lowerQty =
        randomUnique(LOWER, lastLower);

      lastLower = lowerQty;

      await sendOrder(
        PANELS.lower,
        link,
        lowerQty
      );

      await new Promise(r =>
        setTimeout(r, 20000));

      // MEDIUM
      const mediumQty =
        randomUnique(MEDIUM, lastMedium);

      lastMedium = mediumQty;

      await sendOrder(
        PANELS.medium,
        link,
        mediumQty
      );

      await new Promise(r =>
        setTimeout(r, 30000));

      // LARGE
      const largeQty =
        randomUnique(LARGE, lastLarge);

      lastLarge = largeQty;

      await sendOrder(
        PANELS.large,
        link,
        largeQty
      );

    }

  } catch (err) {

    console.log("❌ MAIN ERROR:", err.message);

  }

});
