interface LogLevel {
  ERROR: 'ERROR';
  WARN: 'WARN';
  INFO: 'INFO';
  DEBUG: 'DEBUG';
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
} as const;

type LogLevelType = LogLevel[keyof LogLevel];

class Logger {
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: LogLevelType, message: string, meta?: any): string {
    const timestamp = this.getTimestamp();
    const metaString = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaString}`;
  }

  error(message: string, meta?: any): void {
    console.error(this.formatMessage(LOG_LEVELS.ERROR, message, meta));
  }

  warn(message: string, meta?: any): void {
    console.warn(this.formatMessage(LOG_LEVELS.WARN, message, meta));
  }

  info(message: string, meta?: any): void {
    console.log(this.formatMessage(LOG_LEVELS.INFO, message, meta));
  }

  debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(this.formatMessage(LOG_LEVELS.DEBUG, message, meta));
    }
  }
}

export const logger = new Logger();