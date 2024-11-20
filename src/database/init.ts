import db from './db';

export const initializeDatabase = async () => {
  return new Promise<void>((resolve, reject) => {
    db.serialize(() => {
      // Create items table with flattened author data
      db.run(
        `
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
          posted BOOLEAN DEFAULT 0
        );
      `,
        (err) => {
          if (err) {
            console.error('Could not create items table', err);
            reject(err);
          } else {
            console.log('items table created or already exists');
            resolve();
          }
        },
      );
    });
  });
};

initializeDatabase().catch((err) => {
  console.error(err);
  process.exit(1);
});