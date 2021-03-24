import { gql } from 'config/apollo'

const directivesSchema = gql`
  directive @auth on FIELD_DEFINITION
`
export { directivesSchema }
