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
    }
  }
`

const SIGNIN = gql`
  mutation AuthSignin($email: String!, $password: String!) {
    signin(email: $email, password: $password) {
      accessToken
      auth {
        user {
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
  const { mutate } = testClient()
  let dbConn

  beforeAll(async () => {
    const mongoUri = await mongoServer.getUri()
    dbConn = await getConnection(mongoUri)

    const Auth: Model<IAuth> = AuthModel(dbConn)
    const response = await mutate({
      query: SIGNUP,
      variables: SIGNUP_FIXTURE,
    })
  })

  afterAll(async () => {
    await closeConnection()
    await mongoServer.stop()
  })

  test('signin successfully', async () => {
    const {
      errors,
      data: { signin },
    } = await mutate({
      query: SIGNIN,
      variables: {
        email: SIGNUP_FIXTURE.email,
        password: SIGNUP_FIXTURE.password,
      },
    })
    expect(errors).toBeUndefined()
    expect(signin.auth.user.name).toBe(SIGNUP_FIXTURE.name)
    expect(signin.auth.email).toBe(SIGNUP_FIXTURE.email)
  })

  test('signin with wrong password', async () => {
    const { errors, data } = await mutate({
      query: SIGNIN,
      variables: {
        email: SIGNUP_FIXTURE.email,
        password: '123456',
      },
    })
    expect(errors[0]).toBeDefined()
    expect(errors[0].message).toBe('Email or password invalid')
    expect(errors[0].extensions.code).toBe('BAD_USER_INPUT')
  })

  test('signin with nonexistent email', async () => {
    const { errors, data } = await mutate({
      query: SIGNIN,
      variables: {
        email: 'lorem@ipsum.dolor',
        password: SIGNUP_FIXTURE.password,
      },
    })
    expect(errors[0]).toBeDefined()
    expect(errors[0].message).toBe('Email or password invalid')
    expect(errors[0].extensions.code).toBe('BAD_USER_INPUT')
  })
})
