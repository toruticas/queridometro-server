import { gql } from 'config/apollo'

export default gql`
  extend type Query {
    group(slug: String!): Group
  }

  extend type Mutation {
    createGroup(name: String!, isPublic: Boolean): Group @auth
  }

  type Participant {
    isAdmin: Boolean!
    uuid: String!
    user: User!
  }

  type Group {
    " The name of the group "
    name: String!
    slug: String!
    isPublic: Boolean
    createdAt: DateTime!
    updatedAt: DateTime!
    participants: [Participant]
  }
`
