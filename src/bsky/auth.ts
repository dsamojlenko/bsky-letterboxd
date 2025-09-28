import { Bot } from '@skyware/bot';
import * as dotenv from 'dotenv';
import { getConfig } from '../utils/config';
import { logger } from '../utils/logger';
import { AuthenticationError } from '../utils/errors';

dotenv.config();

const config = getConfig();

export const bot = new Bot({
  eventEmitterOptions: {
    pollingInterval: 100,
  },
});

export const login = async (): Promise<Bot> => {
  try {
    logger.info('Attempting to log in to Bluesky', { username: config.BSKY_USERNAME });
    
    await bot.login({
      identifier: config.BSKY_USERNAME,
      password: config.BSKY_PASSWORD,
    });
    
    logger.info('Successfully logged in to Bluesky');
    return bot;
  } catch (error) {
    logger.error('Failed to log in to Bluesky', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      username: config.BSKY_USERNAME 
    });
    throw new AuthenticationError('Failed to authenticate with Bluesky');
  }
};
