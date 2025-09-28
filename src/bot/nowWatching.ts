import axios from "axios";
import * as dotenv from 'dotenv';
import * as cheerio from 'cheerio';
import { Bot } from "@skyware/bot";
import { refreshFeed } from "./refreshFeed";
import { getConfig } from '../utils/config';
import { logger } from '../utils/logger';
import { NetworkError } from '../utils/errors';
import { databaseService } from '../database/service';
import { DatabaseItem, FilmMetadata } from '../types';

dotenv.config();

const config = getConfig();

const extractFilmMetadata = async (filmUri: string): Promise<FilmMetadata> => {
  try {
    logger.debug('Fetching film metadata', { filmUri });
    
    const filmPage = await axios.get(filmUri, {
      timeout: 10000,
      headers: {
        'User-Agent': 'bsky-letterboxd-bot/1.0'
      }
    });

    const $ = cheerio.load(filmPage.data);
    const directorLabel = $('meta[name="twitter:label1"]').attr('content') || null;
    const directorData = $('meta[name="twitter:data1"]').attr('content') || null;

    return { directorLabel, directorData };
  } catch (error) {
    logger.error('Failed to extract film metadata', { 
      filmUri, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    
    if (axios.isAxiosError(error)) {
      throw new NetworkError('Failed to fetch film page', error);
    }
    
    throw error;
  }
};

const buildFilmUri = (itemLink: string, username: string): string => {
  // Convert user's watch link to the general film page
  return itemLink.replace(`${username}/`, '').replace(/\/\d+\/?$/, '');
};

const formatNowWatchingPost = (item: DatabaseItem, metadata: FilmMetadata): string => {
  const { directorLabel, directorData } = metadata;
  
  let text = `Now watching:\n\n${item.title}`;
  
  if (directorLabel && directorData) {
    text += `\n${directorLabel}: ${directorData}`;
  }
  
  text += '\n\n#filmsky #NowWatching';
  
  return text;
};

export const nowWatching = async (bot: Bot): Promise<void> => {
  try {
    logger.info('Starting now watching check');
    
    // Refresh feed to get latest items
    await refreshFeed();
    
    // Get the most recent unposted watching item
    const item = await databaseService.getNowWatchingItem();

    if (!item) {
      logger.info('No new items to post');
      return;
    }

    logger.info('Processing now watching item', { 
      itemId: item.id, 
      title: item.title,
      guid: item.guid 
    });

    const filmUri = buildFilmUri(item.link, config.LETTERBOXD_USERNAME);
    const metadata = await extractFilmMetadata(filmUri);
    
    const postText = formatNowWatchingPost(item, metadata);
    
    logger.info('Posting to Bluesky', { 
      title: item.title,
      filmUri,
      directorInfo: metadata.directorData 
    });

    await bot.post({
      text: postText,
      external: filmUri,
    });

    await databaseService.markAsPosted(item.id);
    
    logger.info('Successfully posted now watching', { 
      itemId: item.id, 
      title: item.title 
    });
    
  } catch (error) {
    logger.error('Error in now watching process', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    throw error;
  }
};