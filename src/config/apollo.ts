import { Connection } from 'mongoose'
// eslint-disable-next-line import/no-extraneous-dependencies
import { SchemaDirectiveVisitor } from 'graphql-tools'
import {
  ApolloError,
  UserInputError,
  gql,
  AuthenticationError,
} from 'apollo-server-core'

import { Role } from 'graphql/directives/auth'
import { Groups } from 'graphql/group/dataSource'

interface TContextBase {
  uuid?: string
  role?: Role
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

export interface TContext extends TContextBase {
  dbConn: Connection
  dataSources: {
    groups: Groups
  }
}

export interface Resolver<TArgs, TResponse> {
  (parent: unknown, args: TArgs, context: TContext): Promise<TResponse>
}

export {
  ApolloError,
  UserInputError,
  gql,
  AuthenticationError,
  SchemaDirectiveVisitor,
}
