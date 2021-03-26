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

const SIGNUP_ANONYMOUS_FIXTURE = {
  name: 'Rafael Silva',
  group: 'rep-zeppelin',
  password: 'q1w2e3',
}

const SIGNUP_ANONYMOUS = gql`
  mutation AuthSignupAnonymous(
    $name: String!
    $group: String!
    $password: String!
    $avatar: String
  ) {
    signupAnonymous(
      name: $name
      group: $group
      password: $password
      avatar: $avatar
    ) {
      accessToken
      auth {
        user {
          anonymous
          name
          avatar
        }
        uuid
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

  test('signup anonymous', async () => {
    const Auth: Model<IAuth> = AuthModel(dbConn)
    const { mutate } = testClient()
    const response = await mutate({
      query: SIGNUP_ANONYMOUS,
      variables: SIGNUP_ANONYMOUS_FIXTURE,
    })
    expect(response.errors).toBeUndefined()
    expect(response.data.signupAnonymous.auth.user.name).toBe(
      SIGNUP_ANONYMOUS_FIXTURE.name,
    )
  })
})
