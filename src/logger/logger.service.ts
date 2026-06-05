import { Injectable, LoggerService, LogLevel, Optional } from '@nestjs/common';

@Injectable()
export class AppLoggerService implements LoggerService {
  private logLevel: string;
  private readonly levels: LogLevel[] = ['log', 'error', 'warn', 'debug', 'verbose'];

  constructor(@Optional() logLevel?: string) {
    this.logLevel = logLevel || process.env.LOG_LEVEL || 'info';
  }

  private shouldLog(level: string): boolean {
    const levelPriority: Record<string, number> = {
      error: 0,
      warn: 1,
      info: 2,
      log: 2,
      debug: 3,
      verbose: 4,
    };
    const currentPriority = levelPriority[this.logLevel] ?? 2;
    const messagePriority = levelPriority[level] ?? 2;
    return messagePriority <= currentPriority;
  }

  private formatOutput(level: string, message: string, context?: string, metadata?: Record<string, unknown>) {
    const entry: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      level,
      context: context || 'Application',
      message,
      ...metadata,
    };
    console.log(JSON.stringify(entry));
  }

  log(message: string, context?: string, metadata?: Record<string, unknown>) {
    if (this.shouldLog('info')) {
      this.formatOutput('info', message, context, metadata);
    }
  }

  error(message: string, trace?: string, context?: string, metadata?: Record<string, unknown>) {
    if (this.shouldLog('error')) {
      this.formatOutput('error', message, context, { ...metadata, trace });
    }
  }

  warn(message: string, context?: string, metadata?: Record<string, unknown>) {
    if (this.shouldLog('warn')) {
      this.formatOutput('warn', message, context, metadata);
    }
  }

  debug(message: string, context?: string, metadata?: Record<string, unknown>) {
    if (this.shouldLog('debug')) {
      this.formatOutput('debug', message, context, metadata);
    }
  }

  verbose(message: string, context?: string, metadata?: Record<string, unknown>) {
    if (this.shouldLog('verbose')) {
      this.formatOutput('verbose', message, context, metadata);
    }
  }
}