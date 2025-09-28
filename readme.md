# Bluesky Letterboxd Bot

A Node.js bot that automatically posts your Letterboxd "Now Watching" activity to Bluesky.

## Features

- 🎬 Automatically detects when you start watching a film on Letterboxd
- 📱 Posts "Now Watching" updates to Bluesky with film details
- 🎯 Includes director information and film metadata
- 🔄 Runs on a configurable schedule (default: every 10 minutes)
- 📊 SQLite database for tracking posted items
- 📝 Comprehensive logging with structured output

## Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- A Bluesky account
- A Letterboxd account with RSS feed enabled

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dsamojlenko/bsky-letterboxd.git
cd bsky-letterboxd
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```env
# Bluesky credentials
BSKY_USERNAME=your-bluesky-handle
BSKY_PASSWORD=your-app-password

# Letterboxd settings
LETTERBOXD_USERNAME=your-letterboxd-username
FEED_URI=https://letterboxd.com/your-username/rss/

# Database
DATABASE_FILE=./letterboxd.db

# Optional: Set to 'development' for debug logs
NODE_ENV=production
```

### Getting Your Letterboxd RSS Feed

1. Go to your Letterboxd profile
2. Click on the RSS icon or go to `https://letterboxd.com/your-username/rss/`
3. Copy this URL for the `FEED_URI` environment variable

### Setting Up Bluesky App Password

1. Go to Bluesky Settings → Privacy and Security → App Passwords
2. Create a new app password for this bot
3. Use this app password (not your regular password) in the `.env` file

## Usage

### Initialize the Database

```bash
npm run db:init
```

### Run the Bot

Start the bot with automatic scheduling:
```bash
npm start
```

### Manual Commands

Refresh feed data manually:
```bash
npm run bot:get-feed
```

Post a single "now watching" update:
```bash
npm run bot:now-watching
```

## How It Works

1. **Feed Monitoring**: The bot periodically fetches your Letterboxd RSS feed
2. **Detection**: It looks for new "watched" entries that haven't been posted yet
3. **Metadata Extraction**: For each new entry, it fetches additional film metadata (director, etc.)
4. **Posting**: Creates a Bluesky post with the film title, director, and relevant hashtags
5. **Tracking**: Marks the item as posted to avoid duplicates

## Letterboxd Usage Pattern

This bot is designed for a specific Letterboxd workflow:
- Create a "watched" diary entry when you **start** watching a film
- The bot will detect this and post a "Now watching" update to Bluesky
- If you use Letterboxd differently, you may want to modify the posting text

## Project Structure

```
src/
├── index.ts              # Main application entry point
├── types/               # TypeScript type definitions
├── utils/               # Utility functions (logging, config, errors)
├── bsky/               # Bluesky authentication and API
├── bot/                # Bot logic (feed refresh, posting)
├── database/           # Database setup and services
└── scripts/            # Standalone utility scripts
```

## Configuration

### Cron Schedule

The default schedule runs every 10 minutes. To change this, modify the cron expression in `src/index.ts`:

```typescript
const letterboxdJob = new CronJob('*/10 * * * *', async () => {
  // Job logic
});
```

### Logging

Logs are structured JSON in production and include:
- Timestamp
- Log level (ERROR, WARN, INFO, DEBUG)
- Message
- Additional metadata

Set `NODE_ENV=development` for debug logs.

## Error Handling

The bot includes comprehensive error handling for:
- Network failures (Letterboxd/Bluesky API issues)
- Database connection problems
- Authentication failures
- Invalid feed data

Failed operations are logged with context, and the bot will continue running for subsequent attempts.

## Development

### Running in Development Mode

```bash
# Enable debug logging
NODE_ENV=development npm start
```

### Code Style

The project uses Prettier for code formatting:

```bash
npm run format  # (if you add this script)
```

### Adding New Features

The codebase is structured for easy extension:
- Add new bot functions in `src/bot/`
- Create new database operations in `src/database/service.ts`
- Add utility functions in `src/utils/`

## Troubleshooting

### Common Issues

1. **"No items to post"**: Check that your Letterboxd RSS feed contains "watched" entries
2. **Database errors**: Ensure the database file path is writable
3. **Authentication failures**: Verify your Bluesky credentials and app password
4. **Feed parsing errors**: Check that your Letterboxd RSS URL is correct

### Debugging

Enable debug logging by setting `NODE_ENV=development` in your `.env` file.

## License

MIT License - see LICENSE file for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Future Enhancements

- [ ] Support for "Just reviewed" posts
- [ ] List creation notifications
- [ ] Configurable post templates
- [ ] Multiple social media platforms
- [ ] Web dashboard for monitoring
