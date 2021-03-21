import { gql } from 'config/apollo'

export default gql`
  extend type Query {
    group(slug: String!): Group
  }

  extend type Mutation {
    createGroup(name: String!): Group
  }

  type Group {
    " The name of the group "
    name: String!
    slug: String!
    createdAt: DateTime!
    updatedAt: DateTime!
  }
`
