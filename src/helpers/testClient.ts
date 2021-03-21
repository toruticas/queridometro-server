import { createTestClient } from 'apollo-server-testing'
import { ApolloServer } from 'apollo-server'
import { APOLLO_CONFIG } from '../base'
import { ApolloServerExpressConfig } from 'apollo-server-express'
import { Config } from 'apollo-server-core'

/**
 * Test client with custom context argument that can be set per query or mutate call
 * @param config Apollo Server config object
 * @param ctxArg Default argument object to be passed
 */
const testClient = (ctxArg = {}, overrideConfig?: Config) => {
  const config: Config = overrideConfig
    ? { ...APOLLO_CONFIG, ...overrideConfig }
    : APOLLO_CONFIG

  const baseCtxArg = ctxArg
  let currentCtxArg = baseCtxArg

  // eslint-disable-next-line jest/unbound-method
  const { query, mutate } = createTestClient(
    new ApolloServer({
      ...config,
      context: () =>
        typeof config.context === 'function'
          ? config.context(currentCtxArg)
          : {},
    }),
  )

  // Wraps query and mutate function to set context arguments
  const wrap = (fn: any) => (args: any, _ctxArg?: any) => {
    currentCtxArg = _ctxArg === null ? baseCtxArg : _ctxArg
    return fn(args)
  }

  return { query: wrap(query), mutate: wrap(mutate) }
}

export { testClient }
