import axios from 'axios';
import { parseStringPromise } from 'xml2js';
import dotenv from 'dotenv';
import db from '../database/db';

dotenv.config();

const feedUri = process.env.FEED_URI;

if (!feedUri) {
  throw new Error('FEED_URI not set in .env file');
}

export const refreshFeed = async () => {
  try {
    const response = await axios.get(feedUri);
    const feed = await parseStringPromise(response.data);

    const items = feed.rss.channel[0].item;

    db.serialize(() => {
      const stmt = db.prepare(`
        INSERT INTO items (
          title, link, guid, pubDate, watchedDate, rewatch, filmTitle, filmYear, movieId, description, creator
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      for (const item of items) {
        const {
          title,
          link,
          guid,
          pubDate,
          'letterboxd:watchedDate': watchedDate,
          'letterboxd:rewatch': rewatch,
          'letterboxd:filmTitle': filmTitle,
          'letterboxd:filmYear': filmYear,
          'tmdb:movieId': movieId,
          description,
          'dc:creator': creator,
        } = item;

        stmt.run(
          title[0],
          link[0],
          guid[0]._,
          pubDate[0],
          watchedDate ? watchedDate[0] : null,
          rewatch ? rewatch[0] : null,
          filmTitle ? filmTitle[0] : null,
          filmYear ? parseInt(filmYear[0], 10) : null,
          movieId ? parseInt(movieId[0], 10) : null,
          description ? description[0] : null,
          creator ? creator[0] : null,
          (err: Error) => {
            if (err && (err as any).code !== 'SQLITE_CONSTRAINT') {
              console.error('Could not insert feed item', err);
            }
          }
        );
      };

      stmt.finalize();
    });
  } catch (error) {
    console.error('Error fetching or storing feed data', error);
  }
};
