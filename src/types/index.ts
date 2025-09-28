export interface DatabaseItem {
  id: number;
  title: string;
  link: string;
  guid: string;
  pubDate: string;
  watchedDate: string | null;
  rewatch: string | null;
  filmTitle: string | null;
  filmYear: number | null;
  movieId: number | null;
  description: string | null;
  creator: string | null;
  posted: boolean;
}

export interface LetterboxdFeedItem {
  title: string[];
  link: string[];
  guid: Array<{ _: string }>;
  pubDate: string[];
  'letterboxd:watchedDate'?: string[];
  'letterboxd:rewatch'?: string[];
  'letterboxd:filmTitle'?: string[];
  'letterboxd:filmYear'?: string[];
  'tmdb:movieId'?: string[];
  description?: string[];
  'dc:creator'?: string[];
}

export interface Environment {
  DATABASE_FILE: string;
  FEED_URI: string;
  BSKY_USERNAME: string;
  BSKY_PASSWORD: string;
  LETTERBOXD_USERNAME: string;
}

export interface FilmMetadata {
  directorLabel: string | null;
  directorData: string | null;
}