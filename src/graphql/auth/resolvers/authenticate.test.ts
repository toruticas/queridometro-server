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

const AUTHENTICATE = gql`
  query Authenticate {
    authenticate {
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

  it('signup an authenticate', async () => {
    const Auth: Model<IAuth> = AuthModel(dbConn)
    const { mutate, query } = testClient()
    const {
      errors: signupErrors,
      data: { signup },
    } = await mutate({
      query: SIGNUP,
      variables: SIGNUP_FIXTURE,
    })
    expect(signupErrors).toBeUndefined()
    expect(signup.auth.user.name).toBe(SIGNUP_FIXTURE.name)
    expect(signup.auth.email).toBe(SIGNUP_FIXTURE.email)

    const {
      errors: authenticateErrors,
      data: { authenticate },
    } = await mutate(
      {
        query: AUTHENTICATE,
        variables: {},
      },
      {
        req: {
          get() {
            return signup.accessToken
          },
        },
      },
    )

    expect(signupErrors).toBeUndefined()
    expect(authenticate.auth.user.name).toBe(SIGNUP_FIXTURE.name)
    expect(authenticate.auth.email).toBe(SIGNUP_FIXTURE.email)
  })
})
