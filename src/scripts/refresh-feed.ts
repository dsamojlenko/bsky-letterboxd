import { refreshFeed } from "../bot/refreshFeed";
import { logger } from '../utils/logger';

const main = async () => {
  try {
    logger.info('Starting manual feed refresh');
    await refreshFeed();
    logger.info('Feed refresh completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Feed refresh failed', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    process.exit(1);
  }
};

main();