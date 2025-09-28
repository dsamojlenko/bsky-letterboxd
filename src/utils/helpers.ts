import { DatabaseItem } from '../types';

/**
 * Sleep for a specified number of milliseconds
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry a function with exponential backoff
 */
export const retry = async <T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts?: number;
    baseDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
  } = {}
): Promise<T> => {
  const {
    maxAttempts = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === maxAttempts) {
        throw lastError;
      }

      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt - 1),
        maxDelay
      );
      
      await sleep(delay);
    }
  }

  throw lastError!;
};

/**
 * Validate that a string is a valid URL
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Truncate text to a maximum length with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Check if an item is a "now watching" type based on its GUID
 */
export const isNowWatchingItem = (item: DatabaseItem): boolean => {
  return item.guid.includes('watch');
};

/**
 * Format a date string for display
 */
export const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleString();
  } catch {
    return dateString;
  }
};

/**
 * Sanitize text for posting (remove excessive whitespace, etc.)
 */
export const sanitizeText = (text: string): string => {
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\n\s*\n/g, '\n');
};