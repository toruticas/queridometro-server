import mongoose, { Mongoose } from 'mongoose'
import { logger } from 'config/logger'

const { NODE_ENV, MONGO_CONNECTION, DEBUG } = process.env

const DEBUG_MODE = NODE_ENV !== 'production' && DEBUG === 'true'
mongoose.set('debug', DEBUG_MODE)

const MONGO_OPTIONS = {
  bufferCommands: false,
  bufferMaxEntries: 0,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
}

let cachedConnection: Mongoose | null = null

function getConnection(uri?: string): Promise<Mongoose> {
  if (cachedConnection === null) {
    return mongoose
      .connect(uri ? uri : String(MONGO_CONNECTION), MONGO_OPTIONS)
      .then((connection: Mongoose) => {
        cachedConnection = connection
        logger.info('connected to mongo')
        return cachedConnection
      })
  } else {
    logger.info('using cached connection')
    return Promise.resolve(cachedConnection)
  }
}

function closeConnection(): Promise<boolean> {
  if (cachedConnection !== null) {
    return new Promise(resolve => {
      mongoose.connection.close(false, () => {
        logger.info('connection closed')
        resolve(true)
      })
    })
  }

  return Promise.resolve(true)
}

export { getConnection, closeConnection }
