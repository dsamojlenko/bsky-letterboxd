import { CronJob } from 'cron';
import { nowWatching } from './bot/nowWatching';
import { Bot } from '@skyware/bot';
import * as process from 'process';

const start = async () => {
  console.log('Starting the bot...');

  const bot = new Bot({
    eventEmitterOptions: {
      pollingInterval: 100,
    },
  });

  await bot.login({
    identifier: process.env.BSKY_USERNAME!,
    password: process.env.BSKY_PASSWORD!,
  });

  const letterboxdJob = new CronJob('*/10 * * * *', async () => {
    nowWatching(bot);
  });

  letterboxdJob.start();
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
