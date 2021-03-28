import { gql } from 'config/apollo'

export default gql`
  extend type Query {
    findGroup(slug: String!): Group @auth(role: UNKNOWN)
  }

  extend type Mutation {
    createGroup(name: String!, password: String!, isPublic: Boolean): Group
      @auth(role: USER)
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
