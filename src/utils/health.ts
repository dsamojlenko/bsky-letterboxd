import { databaseService } from '../database/service';
import { logger } from './logger';
import { getConfig } from './config';
import axios from 'axios';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  checks: {
    database: boolean;
    letterboxdFeed: boolean;
    blueskyAuth: boolean;
  };
  errors: string[];
}

export class HealthChecker {
  async checkDatabase(): Promise<boolean> {
    try {
      // Try to query the database
      await databaseService.getNowWatchingItem();
      return true;
    } catch (error) {
      logger.error('Database health check failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return false;
    }
  }

  async checkLetterboxdFeed(): Promise<boolean> {
    try {
      const config = getConfig();
      const response = await axios.get(config.FEED_URI, { 
        timeout: 5000,
        validateStatus: (status) => status === 200
      });
      
      return response.data.includes('<rss');
    } catch (error) {
      logger.error('Letterboxd feed health check failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return false;
    }
  }

  async checkBlueskyAuth(): Promise<boolean> {
    try {
      // This is a simple check - in a real implementation you might want to
      // check if the bot is still authenticated or try a lightweight API call
      const config = getConfig();
      return !!(config.BSKY_USERNAME && config.BSKY_PASSWORD);
    } catch (error) {
      logger.error('Bluesky auth health check failed', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      return false;
    }
  }

  async performHealthCheck(): Promise<HealthStatus> {
    logger.info('Performing health check');
    
    const errors: string[] = [];
    
    const [database, letterboxdFeed, blueskyAuth] = await Promise.all([
      this.checkDatabase().catch(() => {
        errors.push('Database connection failed');
        return false;
      }),
      this.checkLetterboxdFeed().catch(() => {
        errors.push('Letterboxd feed unavailable');
        return false;
      }),
      this.checkBlueskyAuth().catch(() => {
        errors.push('Bluesky authentication invalid');
        return false;
      })
    ]);

    const allChecksPass = database && letterboxdFeed && blueskyAuth;
    
    const healthStatus: HealthStatus = {
      status: allChecksPass ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        database,
        letterboxdFeed,
        blueskyAuth
      },
      errors
    };

    logger.info('Health check completed', healthStatus);
    
    return healthStatus;
  }
}

export const healthChecker = new HealthChecker();