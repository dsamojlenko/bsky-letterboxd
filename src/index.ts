import { CronJob } from 'cron';
import { nowWatching } from './bot/nowWatching';
import { login } from './bsky/auth';
import { logger } from './utils/logger';

let isJobRunning = false;

const start = async (): Promise<void> => {
  try {
    logger.info('Starting the Bluesky Letterboxd bot...');

    const bot = await login();

    const letterboxdJob = new CronJob('*/10 * * * *', async () => {
      if (isJobRunning) {
        logger.warn('Previous job still running, skipping this execution');
        return;
      }

      isJobRunning = true;
      try {
        await nowWatching(bot);
      } catch (error) {
        logger.error('Error in scheduled job', { 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      } finally {
        isJobRunning = false;
      }
    });

    letterboxdJob.start();
    logger.info('Cron job started - checking every 10 minutes');
    
    // Keep the process alive
    process.on('SIGINT', () => {
      logger.info('Received SIGINT, stopping gracefully...');
      letterboxdJob.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      logger.info('Received SIGTERM, stopping gracefully...');
      letterboxdJob.stop();
      process.exit(0);
    });
    
  } catch (error) {
    logger.error('Failed to start bot', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    process.exit(1);
  }
};

start().catch((err) => {
  logger.error('Unhandled error during startup', { error: err.message });
  process.exit(1);
});
