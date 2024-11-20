import { CronJob } from 'cron';

const start = async () => {
  console.log('Starting the hoffbot...');

  const letterboxdJob = new CronJob('0 10 * * *', async () => {
    // await dailyHoff();
  });

  letterboxdJob.start();
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
