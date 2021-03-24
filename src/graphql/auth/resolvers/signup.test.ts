import jwt from 'jsonwebtoken'
import { Model } from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { differenceInDays } from 'date-fns'

import 'config/load'
import { gql } from 'config/apollo'
import { getConnection, closeConnection } from 'config/database'
import { testClient } from 'helpers/testClient'

import { AuthModel, IAuth } from '../model'

const mongoServer = new MongoMemoryServer()

const SIGNUP_FIXTURE = {
  name: 'Rafael Silva',
  email: 'toruticas@gmail.com',
  password: 'q1w2e3',
}

const SIGNUP = gql`
  mutation AuthSignup(
    $name: String!
    $email: String!
    $password: String!
    $avatar: String
  ) {
    signup(name: $name, email: $email, password: $password, avatar: $avatar) {
      accessToken
      auth {
        user {
          anonymous
          name
          avatar
        }
        uuid
        email
        refreshToken
        refreshTokenCreatedAt
        refreshTokenExpiresAt
      }
    }
  }
`

describe('auth resolvers', () => {
  let dbConn

  beforeAll(async () => {
    const mongoUri = await mongoServer.getUri()
    dbConn = await getConnection(mongoUri)
  })

  afterAll(async () => {
    await closeConnection()
    await mongoServer.stop()
  })

  it('signup an user', async () => {
    const Auth: Model<IAuth> = AuthModel(dbConn)
    const { mutate } = testClient()
    const response = await mutate({
      query: SIGNUP,
      variables: SIGNUP_FIXTURE,
    })
    expect(response.errors).toBeUndefined()
    expect(response.data.signup.auth.user.name).toBe(SIGNUP_FIXTURE.name)
    expect(response.data.signup.auth.email).toBe(SIGNUP_FIXTURE.email)
  })

  // it('signin and renew token', async () => {
  //   const { mutate } = testClient()
  //   const {
  //     data: {
  //       signin: {
  //         refreshToken,
  //         user: { _id: userId },
  //       },
  //     },
  //   } = await mutate({
  //     mutation: SIGNIN,
  //     variables: {
  //       phoneNumber: USER_FIXTURE.phoneNumber,
  //       password: USER_FIXTURE.password,
  //     },
  //   })
  //   const {
  //     data: {
  //       renewToken: { user },
  //     },
  //   } = await mutate({
  //     mutation: RENEW_TOKEN,
  //     variables: { token: refreshToken, id: userId },
  //   })

  //   expect(user).toEqual({
  //     name: USER_FIXTURE.name,
  //     phoneNumber: USER_FIXTURE.phoneNumber,
  //   })
  // })
})
