import axios from "axios";
import db from "../database/db"
import * as dotenv from 'dotenv';
import * as cheerio from 'cheerio';
import { Bot } from "@skyware/bot";

dotenv.config();

const retrieveNowWatching = async () => {
  return new Promise<any>((resolve, reject) => {
    db.get(`
      SELECT * FROM items
      WHERE posted = 0
      ORDER BY pubDate DESC
      LIMIT 1
    `, (err, row) => {
      if (err) {
        reject(err);
      }

      resolve(row);
    });
  });
}

const setPosted = async (id: number) => {
  return new Promise<void>((resolve, reject) => {
    db.run(`
      UPDATE items
      SET posted = 1
      WHERE id = ?
    `, id, (err) => {
      if (err) {
        reject(err);
      }

      resolve();
    });
  });
};

export const nowWatching = async (bot: Bot) => {
  const item = await retrieveNowWatching();

  if (!item) {
    console.log('No items to post');
    return;
  }

  const filmUri = item.link.replace('dsamojlenko/', '').replace(/\/\d+\/?$/, '');
  const filmPage = await axios.get(filmUri);

  const $ = cheerio.load(filmPage.data);
  const directorLabel = $('meta[name="twitter:label1"]').attr('content');
  const directorData = $('meta[name="twitter:data1"]').attr('content');

  console.log('Now watching:', item.title);
  console.log(filmUri);
  console.log(directorLabel, directorData);

  try {
    await bot.post({
      text: `Now watching:\n\n${item.title}\n${directorLabel}: ${directorData}\n\n#filmsky`,
      external: filmUri,
    })

    await setPosted(item.id);
  } catch (err) {
    console.error(err);
  };

}