import { gql } from 'config/apollo'

export default gql`
  type User {
    anonymous: Boolean!
    name: String!
    avatar: String
  }

  type Auth {
    uuid: ID!
    email: String!
    refreshToken: String!
    refreshTokenCreatedAt: DateTime
    refreshTokenExpiresAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    user: User!
  }

  type AuthResponse {
    auth: Auth!
    accessToken: String!
  }

  extend type Query {
    authenticate: AuthResponse! @auth
  }

  extend type Mutation {
    signup(
      name: String!
      email: String!
      password: String!
      avatar: String
    ): AuthResponse!

    signupAnonymous(
      group: String!
      name: String!
      password: String!
      avatar: String
    ): AuthResponse!

    signin(email: String!, password: String!): AuthResponse!
  }
`
