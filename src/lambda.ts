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
  server.createHandler({
    cors: {
      origin: '*',
      credentials: true,
    },
  })(event, context, callback)
}

export { graphqlHandler }
