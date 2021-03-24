import { getConnection } from 'config/database'
import { Config } from 'apollo-server-core'

import resolvers from 'graphql/resolvers'
import typeDefs from 'graphql/schema'
import { schemaDirectives } from 'graphql/directives'

const { NODE_ENV } = process.env

const APOLLO_CONFIG: Config = {
  typeDefs,
  resolvers,
  playground: {
    endpoint: process.env.IS_OFFLINE
      ? 'http://localhost:3000/playground'
      : `${process.env.BASE_URL}/playground`,
  },
  introspection: true,
  schemaDirectives,
  context: async context => {
    const dbConn = await getConnection()
    return { dbConn, ...context }
  },
  debug: NODE_ENV === 'production',
  subscriptions: false,
}

export { APOLLO_CONFIG }
