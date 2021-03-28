import { gql } from 'config/apollo'

const directivesSchema = gql`
  enum Role {
    ADMIN
    USER
    ANONYMOUS
    UNKNOWN
  }

  directive @auth(role: Role = UNKNOWN) on FIELD_DEFINITION
`
export { directivesSchema }
