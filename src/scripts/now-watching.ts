import { nowWatching } from "../bot/nowWatching";
import { login } from "../bsky/auth";
import { logger } from '../utils/logger';

const main = async (): Promise<void> => {
  try {
    logger.info('Starting manual now watching check');
    
    const bot = await login();
    await nowWatching(bot);
    
    logger.info('Now watching check completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Now watching check failed', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    process.exit(1);
  }
};

main();