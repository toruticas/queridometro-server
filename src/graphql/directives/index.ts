import AuthDirective from 'graphql/directives/auth'
import { SchemaDirectiveVisitor } from 'config/apollo'

const schemaDirectives: Record<string, typeof SchemaDirectiveVisitor> = {
  auth: AuthDirective,
}

export { schemaDirectives }
