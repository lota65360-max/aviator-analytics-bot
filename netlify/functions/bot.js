exports.handler = async (event) => {
  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;

    if (!token) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Telegram bot token is not configured" })
      };
    }

    const body = JSON.parse(event.body || "{}");
    const message = body.message;

    if (!message || !message.chat) {
      return {
        statusCode: 200,
        body: JSON.stringify({ ok: true })
      };
    }

    const chatId = message.chat.id;
    const text = message.text || "";

    let reply = "📊 Aviator Analytics Bot\n\n";
    
    if (text === "/start") {
      reply +=
        "স্বাগতম! 👋\n\n" +
        "আমি historical/statistical data analysis-এর জন্য তৈরি।\n" +
        "পরবর্তী crash নিশ্চিতভাবে predict করা সম্ভব নয়।\n\n" +
        "Commands:\n" +
        "/start - শুরু করুন\n" +
        "/status - Bot status";
    } else if (text === "/status") {
      reply += "🟢 Bot is online.";
    } else {
      reply += "আপনার command বুঝতে পারিনি। /start লিখুন।";
    }

    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: reply
        })
      }
    );

    const result = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message
      })
    };
  }
};
