import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import dotenv from 'dotenv';
import { getConfig } from '../utils/config';
import { logger } from '../utils/logger';
import { NetworkError } from '../utils/errors';
import { databaseService } from '../database/service';
import { LetterboxdFeedItem, DatabaseItem } from '../types';

dotenv.config();

const config = getConfig();

const parseLetterboxdItem = (item: LetterboxdFeedItem): Omit<DatabaseItem, 'id' | 'posted'> => {
  return {
    title: item.title[0],
    link: item.link[0],
    guid: item.guid[0]._,
    pubDate: item.pubDate[0],
    watchedDate: item['letterboxd:watchedDate']?.[0] || null,
    rewatch: item['letterboxd:rewatch']?.[0] || null,
    filmTitle: item['letterboxd:filmTitle']?.[0] || null,
    filmYear: item['letterboxd:filmYear'] ? parseInt(item['letterboxd:filmYear'][0], 10) : null,
    movieId: item['tmdb:movieId'] ? parseInt(item['tmdb:movieId'][0], 10) : null,
    description: item.description?.[0] || null,
    creator: item['dc:creator']?.[0] || null,
  };
};

export const refreshFeed = async (): Promise<void> => {
  try {
    logger.info('Fetching Letterboxd feed', { feedUri: config.FEED_URI });
    
    const response = await axios.get(config.FEED_URI, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'bsky-letterboxd-bot/1.0'
      }
    });
    
    const feed = await parseStringPromise(response.data);
    
    if (!feed?.rss?.channel?.[0]?.item) {
      logger.warn('No items found in feed');
      return;
    }

    const items: LetterboxdFeedItem[] = feed.rss.channel[0].item;
    logger.info('Processing feed items', { count: items.length });

    let insertedCount = 0;
    let skippedCount = 0;
    
    for (const item of items) {
      try {
        const parsedItem = parseLetterboxdItem(item);
        await databaseService.insertFeedItem(parsedItem);
        insertedCount++;
      } catch (error) {
        // Item likely already exists (constraint error), which is fine
        skippedCount++;
      }
    }
    
    logger.info('Feed refresh completed', { 
      totalItems: items.length,
      inserted: insertedCount,
      skipped: skippedCount
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error fetching or storing feed data', { error: errorMessage });
    
    if (axios.isAxiosError(error)) {
      throw new NetworkError('Failed to fetch Letterboxd feed', error);
    }
    
    throw error;
  }
};
