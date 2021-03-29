import jwt from 'jsonwebtoken'
import { defaultFieldResolver, GraphQLField } from 'graphql'
import {
  AuthenticationError,
  SchemaDirectiveVisitor,
  TContextLambda,
  TContextExpress,
} from 'config/apollo'
import { Role } from './enums'

const { JWT_SECRET } = process.env

interface JwtData {
  iat: number
  exp: number
  uuid: string
  role: Role
}

type TContext = TContextExpress | TContextLambda

const handleError = (role: string, e: unknown) => {
  const error = e as Error

  if (role === 'UNKNOWN') {
    return
  }

  if (error.name === 'TokenExpiredError') {
    throw new AuthenticationError('Token expired')
  }

  throw new AuthenticationError('Unauthorized access')
}

class AuthDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field: GraphQLField<unknown, TContext>): void {
    const originalResolve = field.resolve ?? defaultFieldResolver
    const requiredRole: string = this.args.role

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
        const { uuid, role } = jwt.verify(token, String(JWT_SECRET)) as JwtData

        args[2].uuid = uuid
        args[2].role = role
      } catch (e: unknown) {
        handleError(requiredRole, e)
      }

      return originalResolve.apply(this, args)
    }
  }
}

export { AuthDirective }
