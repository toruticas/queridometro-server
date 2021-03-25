import { Connection } from 'mongoose'
// eslint-disable-next-line import/no-extraneous-dependencies
import { SchemaDirectiveVisitor } from 'graphql-tools'
import {
  ApolloError,
  UserInputError,
  gql,
  AuthenticationError,
} from 'apollo-server-core'

export interface Resolver<TArgs, TResponse> {
  (
    parent: unknown,
    args: TArgs,
    context: { dbConn: Connection },
  ): Promise<TResponse>
}

interface TContextBase {
  uuid?: string
}

export interface TContextLambda extends TContextBase {
  event: {
    headers: {
      Authorization: string
    }
  }
}

export interface TContextExpress extends TContextBase {
  req: {
    get: (header: string) => string
  }
}

export {
  ApolloError,
  UserInputError,
  gql,
  AuthenticationError,
  SchemaDirectiveVisitor,
}
