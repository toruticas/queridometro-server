import jwt from 'jsonwebtoken'
import { defaultFieldResolver, GraphQLField } from 'graphql'
import { AuthenticationError, SchemaDirectiveVisitor } from 'config/apollo'

const { JWT_SECRET } = process.env

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
  visitFieldDefinition(field: GraphQLField<unknown, TContext>): void {
    const originalResolve = field.resolve ?? defaultFieldResolver

    field.resolve = function resolve(...args) {
      const context = args[2]
      let authorization = ''

      try {
        if ('event' in context) {
          const { event } = context
          authorization = event.headers.Authorization
        } else {
          const { req: request } = context
          authorization = request.get('Authorization')
        }

        if (!authorization) {
          throw new Error()
        }

        const token = authorization.replace('Bearer ', '')
        const { uuid } = jwt.verify(token, String(JWT_SECRET)) as JwtData

        args[2].uuid = uuid
      } catch (e: unknown) {
        const error = e as Error
        if (error.name === 'TokenExpiredError') {
          throw new AuthenticationError('Token expired')
        } else {
          throw new AuthenticationError('Unauthorized access')
        }
      }

      return originalResolve.apply(this, args)
    }
  }
}

export default AuthDirective
