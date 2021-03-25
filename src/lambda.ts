import {
  APIGatewayProxyCallback,
  APIGatewayProxyEvent,
  Context as LambdaContext,
} from 'aws-lambda'
import { ApolloServer } from 'apollo-server-lambda'
import { APOLLO_CONFIG } from './base'

const server = new ApolloServer(APOLLO_CONFIG)

const graphqlHandler = (
  event: APIGatewayProxyEvent,
  context: LambdaContext,
  callback: APIGatewayProxyCallback,
): void => {
  context.callbackWaitsForEmptyEventLoop = false
  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  server.createHandler({
    cors: {
      origin: '*',
      credentials: true,
    },
  })(event, context, callback)
}

export { graphqlHandler }
