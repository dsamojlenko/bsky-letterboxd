import { Bot } from "@skyware/bot";
import { nowWatching } from "../bot/nowWatching";

const run = async () => {
  const bot = new Bot({
    eventEmitterOptions: {
      pollingInterval: 100,
    },
  });

  await bot.login({
    identifier: process.env.BSKY_USERNAME!,
    password: process.env.BSKY_PASSWORD!,
  });

  nowWatching(bot);
}

run();