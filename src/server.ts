import { ApolloServer } from 'apollo-server'

import 'config/load'
import { logger } from 'config/logger'

import { APOLLO_CONFIG } from './base'

const server = new ApolloServer(APOLLO_CONFIG)

server
  .listen()
  .then(({ url }: { url: string }): void => {
    logger.info(`🚀 Server ready at ${url}`)
  })
  .catch((e: unknown) => {
    logger.error('Something went wrong while starting server', e)
  })
