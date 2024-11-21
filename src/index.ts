import { CronJob } from 'cron';
import { nowWatching } from './bot/nowWatching';

const start = async () => {
  console.log('Starting the bot...');

  const letterboxdJob = new CronJob('*/20 * * * *', async () => {
    nowWatching();
  });

  letterboxdJob.start();
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
