import { gql } from 'config/apollo'
import scalarSchema from './scalar/schema'
import groupSchema from './group/schema'
import authSchema from './auth/schema'
import { directivesSchema } from './directives/schema'

const linkSchema = gql`
  type Query {
    _: Boolean
  }
  type Mutation {
    _: Boolean
  }
  type Subscription {
    _: Boolean
  }
`

export default [
  linkSchema,
  directivesSchema,
  scalarSchema,
  groupSchema,
  authSchema,
]
