import db from './db';
import { logger } from '../utils/logger';
import { DatabaseError } from '../utils/errors';

export const initializeDatabase = async (): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    logger.info('Initializing database...');
    
    db.serialize(() => {
      // Create items table with flattened author data
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          link TEXT NOT NULL,
          guid TEXT UNIQUE NOT NULL,
          pubDate TEXT NOT NULL,
          watchedDate TEXT,
          rewatch TEXT,
          filmTitle TEXT,
          filmYear INTEGER,
          movieId INTEGER,
          description TEXT,
          creator TEXT,
          posted BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `;
      
      db.run(createTableQuery, (err) => {
        if (err) {
          logger.error('Could not create items table', { error: err.message });
          reject(new DatabaseError('Failed to create items table', err));
        } else {
          logger.info('Items table created or already exists');
          
          // Create indexes for better query performance
          const createIndexes = [
            'CREATE INDEX IF NOT EXISTS idx_items_posted ON items(posted);',
            'CREATE INDEX IF NOT EXISTS idx_items_guid ON items(guid);',
            'CREATE INDEX IF NOT EXISTS idx_items_pubdate ON items(pubDate);'
          ];
          
          let indexCount = 0;
          const totalIndexes = createIndexes.length;
          
          createIndexes.forEach((indexQuery) => {
            db.run(indexQuery, (indexErr) => {
              if (indexErr) {
                logger.warn('Could not create index', { error: indexErr.message, query: indexQuery });
              }
              
              indexCount++;
              if (indexCount === totalIndexes) {
                logger.info('Database initialization completed');
                resolve();
              }
            });
          });
        }
      });
    });
  });
};

if (require.main === module) {
  initializeDatabase().catch((err) => {
    logger.error('Database initialization failed', { error: err.message });
    process.exit(1);
  });
}