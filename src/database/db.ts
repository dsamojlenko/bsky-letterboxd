import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
import { getConfig } from '../utils/config';
import { logger } from '../utils/logger';
import { DatabaseError } from '../utils/errors';

dotenv.config();

const config = getConfig();

const db = new sqlite3.Database(config.DATABASE_FILE, (err) => {
  if (err) {
    logger.error('Could not connect to database', { error: err.message, file: config.DATABASE_FILE });
    throw new DatabaseError('Failed to connect to database', err);
  } else {
    logger.info('Connected to database', { file: config.DATABASE_FILE });
  }
});

// Enable foreign key constraints
db.run('PRAGMA foreign_keys = ON');

export default db;