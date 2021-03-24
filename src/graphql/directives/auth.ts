import jwt from 'jsonwebtoken'
import { defaultFieldResolver } from 'graphql'
import { AuthenticationError, SchemaDirectiveVisitor } from 'config/apollo'
import { GraphQLField } from 'graphql'

const { JWT_SECRET, RUNNER } = process.env
const IS_LAMBDA = RUNNER === 'lambda'

interface JwtData {
  iat: number
  exp: number
  uuid: string
}

interface TContextBase {
  uuid: string
}

interface TContextLambda extends TContextBase {
  event: {
    headers: {
      Authorization: string
    }
  }
}

interface TContextExpress extends TContextBase {
  req: {
    get: (header: string) => string
  }
}

type TContext = TContextExpress | TContextLambda

class AuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field: GraphQLField<any, TContext>): void {
    const originalResolve = field.resolve || defaultFieldResolver

    field.resolve = function resolve(...args) {
      const context = args[2]
      let authorization

      if ('event' in context) {
        const { event } = context
        authorization = event.headers.Authorization
      } else {
        const { req: request } = context
        authorization = request.get('Authorization')
      }

      if (!authorization) {
        throw new AuthenticationError("There's no bearer token")
      }

      const token = authorization.replace('Bearer ', '')
      const { uuid } = jwt.verify(token, String(JWT_SECRET)) as JwtData

      args[2].uuid = uuid

      return originalResolve.apply(this, args)
    }
  }
}

export default AuthDirective
