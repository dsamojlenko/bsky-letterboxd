import db from './db';
import { DatabaseItem } from '../types';
import { logger } from '../utils/logger';
import { DatabaseError } from '../utils/errors';

export class DatabaseService {
  /**
   * Get the most recent unposted 'now watching' item
   */
  async getNowWatchingItem(): Promise<DatabaseItem | null> {
    return new Promise<DatabaseItem | null>((resolve, reject) => {
      const query = `
        SELECT * FROM items
        WHERE posted = 0
        AND guid LIKE '%watch%'
        ORDER BY pubDate DESC
        LIMIT 1
      `;
      
      db.get(query, (err, row: DatabaseItem | undefined) => {
        if (err) {
          logger.error('Failed to retrieve now watching item', { error: err.message });
          reject(new DatabaseError('Failed to retrieve now watching item', err));
          return;
        }
        
        resolve(row || null);
      });
    });
  }

  /**
   * Mark an item as posted
   */
  async markAsPosted(id: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const query = 'UPDATE items SET posted = 1 WHERE id = ?';
      
      db.run(query, id, function(err) {
        if (err) {
          logger.error('Failed to mark item as posted', { error: err.message, itemId: id });
          reject(new DatabaseError('Failed to mark item as posted', err));
          return;
        }
        
        if (this.changes === 0) {
          logger.warn('No item found to mark as posted', { itemId: id });
        } else {
          logger.info('Item marked as posted', { itemId: id });
        }
        
        resolve();
      });
    });
  }

  /**
   * Insert a new feed item into the database
   */
  async insertFeedItem(item: Omit<DatabaseItem, 'id' | 'posted'>): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const query = `
        INSERT INTO items (
          title, link, guid, pubDate, watchedDate, rewatch, filmTitle, filmYear, movieId, description, creator
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const values = [
        item.title,
        item.link,
        item.guid,
        item.pubDate,
        item.watchedDate,
        item.rewatch,
        item.filmTitle,
        item.filmYear,
        item.movieId,
        item.description,
        item.creator
      ];
      
      db.run(query, values, function(err) {
        if (err) {
          // Don't log constraint errors (duplicates) as errors
          if ((err as any).code === 'SQLITE_CONSTRAINT') {
            logger.debug('Duplicate item skipped', { guid: item.guid });
            resolve(); // Resolve successfully for duplicates
            return;
          }
          
          logger.error('Failed to insert feed item', { 
            error: err.message, 
            guid: item.guid,
            title: item.title 
          });
          reject(new DatabaseError('Failed to insert feed item', err));
          return;
        }
        
        logger.debug('Feed item inserted', { 
          itemId: this.lastID, 
          guid: item.guid,
          title: item.title 
        });
        resolve();
      });
    });
  }
}

export const databaseService = new DatabaseService();