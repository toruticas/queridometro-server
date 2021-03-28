import { gql } from 'config/apollo'

const scalarSchema = gql`
  scalar Date
  scalar Time
  scalar DateTime
`

export { scalarSchema }
