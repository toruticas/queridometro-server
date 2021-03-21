import winston from 'winston'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
      silent: process.env.NODE_ENV === 'test',
    }),
  ],
})

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV === 'development') {
  logger.add(
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
  )
  logger.add(new winston.transports.File({ filename: 'logs/combined.log' }))
}

export { logger }
