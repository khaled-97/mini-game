type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  component: string
  message: string
  details?: unknown
}

class Logger {
  private static instance: Logger
  private logs: LogEntry[] = []
  private readonly maxLogs = 1000

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  private createLogEntry(
    level: LogLevel,
    component: string,
    message: string,
    details?: unknown
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      details,
    }
  }

  private addLog(entry: LogEntry) {
    this.logs.unshift(entry)
    if (this.logs.length > this.maxLogs) {
      this.logs.pop()
    }

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      const consoleMsg = `[${entry.level.toUpperCase()}] ${entry.component}: ${entry.message}`
      switch (entry.level) {
        case 'debug':
          console.debug(consoleMsg, entry.details || '')
          break
        case 'info':
          console.info(consoleMsg, entry.details || '')
          break
        case 'warn':
          console.warn(consoleMsg, entry.details || '')
          break
        case 'error':
          console.error(consoleMsg, entry.details || '')
          break
      }
    }
  }

  debug(component: string, message: string, details?: unknown) {
    this.addLog(this.createLogEntry('debug', component, message, details))
  }

  info(component: string, message: string, details?: unknown) {
    this.addLog(this.createLogEntry('info', component, message, details))
  }

  warn(component: string, message: string, details?: unknown) {
    this.addLog(this.createLogEntry('warn', component, message, details))
  }

  error(component: string, message: string, details?: unknown) {
    this.addLog(this.createLogEntry('error', component, message, details))
  }

  getLogs(level?: LogLevel): LogEntry[] {
    return level ? this.logs.filter(log => log.level === level) : this.logs
  }

  clearLogs() {
    this.logs = []
  }
}

export const logger = Logger.getInstance()

// Error handling utilities
export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export function validateNumber(value: string, options?: {
  min?: number
  max?: number
  integer?: boolean
}): number | ValidationError {
  const num = Number(value)
  
  if (isNaN(num)) {
    return new ValidationError('Please enter a valid number')
  }

  if (options?.integer && !Number.isInteger(num)) {
    return new ValidationError('Please enter a whole number')
  }

  if (options?.min !== undefined && num < options.min) {
    return new ValidationError(`Number must be at least ${options.min}`)
  }

  if (options?.max !== undefined && num > options.max) {
    return new ValidationError(`Number must be no more than ${options.max}`)
  }

  return num
}

export function validateText(value: string, options?: {
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  patternMessage?: string
}): string | ValidationError {
  if (options?.minLength !== undefined && value.length < options.minLength) {
    return new ValidationError(`Text must be at least ${options.minLength} characters`)
  }

  if (options?.maxLength !== undefined && value.length > options.maxLength) {
    return new ValidationError(`Text must be no more than ${options.maxLength} characters`)
  }

  if (options?.pattern && !options.pattern.test(value)) {
    return new ValidationError(options.patternMessage || 'Text format is invalid')
  }

  return value
}

export default logger
