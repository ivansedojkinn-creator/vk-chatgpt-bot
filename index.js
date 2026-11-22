const express = require("express");
const { VK } = require("vk-io");
const OpenAI = require("openai");

const app = express();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const vk = new VK({
  token: process.env.VK_TOKEN
});

app.get("/", (req, res) => {
  res.send("VK ChatGPT Bot is running!");
});

vk.updates.on("message_new", async (context) => {
  try {
    if (context.senderId <= 0 || !context.text) return;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Ты дружелюбный русскоязычный ChatGPT-бот сообщества ВКонтакте. Отвечай понятно, вежливо и по существу."
        },
        {
          role: "user",
          content: context.text
        }
      ]
    });

    const answer =
      response.choices[0].message.content || "Не удалось сформировать ответ.";

    await context.send(answer);

  } catch (error) {
    console.error("Ошибка:", error);
    await context.send("Извини, произошла ошибка. Попробуй ещё раз.");
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log("Сервер запущен на порту " + PORT);

  try {
    await vk.updates.start();
    console.log("VK бот подключён!");
  } catch (error) {
    console.error("Ошибка подключения ВК:", error);
  }
});
