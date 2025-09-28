import { Environment } from '../types';
import { logger } from './logger';

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

let cachedConfig: Environment | null = null;

export const validateEnvironment = (): Environment => {
  const requiredVars = [
    'DATABASE_FILE',
    'FEED_URI', 
    'BSKY_USERNAME',
    'BSKY_PASSWORD',
    'LETTERBOXD_USERNAME'
  ] as const;

  const missing: string[] = [];
  const config: Partial<Environment> = {};

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value) {
      missing.push(varName);
    } else {
      (config as any)[varName] = value;
    }
  }

  if (missing.length > 0) {
    const errorMessage = `Missing required environment variables: ${missing.join(', ')}`;
    logger.error(errorMessage);
    throw new ConfigError(errorMessage);
  }

  logger.info('Environment validation successful');
  return config as Environment;
};

export const getConfig = (): Environment => {
  if (cachedConfig === null) {
    cachedConfig = validateEnvironment();
  }
  return cachedConfig;
};