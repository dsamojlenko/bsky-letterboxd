import { CronJob } from 'cron';
import { nowWatching } from './bot/nowWatching';
import * as process from 'process';
import { login } from './bsky/auth';

const start = async () => {
  console.log('Starting the bot...');

  const bot = await login();

  const letterboxdJob = new CronJob('*/10 * * * *', async () => {
    nowWatching(bot);
  });

  letterboxdJob.start();
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
