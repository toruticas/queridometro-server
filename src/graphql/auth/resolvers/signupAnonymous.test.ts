import jwt from 'jsonwebtoken'
import { Model } from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { differenceInDays } from 'date-fns'

import 'config/load'
import { gql } from 'config/apollo'
import { getConnection, closeConnection } from 'config/database'
import { generateAuthContext } from 'helpers/testUtils'
import { testClient } from 'helpers/testClient'

import { GroupModel, IGroup } from 'graphql/group/model'
import { AuthModel, IAuth } from '../model'

const mongoServer = new MongoMemoryServer()

const CREATE_GROUP = gql`
  mutation($name: String!, $password: String!, $isPublic: Boolean) {
    createGroup(name: $name, password: $password, isPublic: $isPublic) {
      name
      slug
    }
  }
`

const SIGNUP_ANONYMOUS = gql`
  mutation AuthSignupAnonymous(
    $name: String!
    $groupSlug: String!
    $groupPassword: String!
    $avatar: String
  ) {
    signupAnonymous(
      name: $name
      groupSlug: $groupSlug
      groupPassword: $groupPassword
      avatar: $avatar
    ) {
      accessToken
      auth {
        user {
          name
          avatar
        }
        uuid
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
    }
  }
`

describe('auth resolvers', () => {
  const { mutate, query } = testClient()
  let dbConn

  beforeAll(async () => {
    const mongoUri = await mongoServer.getUri()
    dbConn = await getConnection(mongoUri)
    const SIGNUP_FIXTURE = {
      name: 'Rafael Silva',
      email: 'toruticas@gmail.com',
      password: 'q1w2e3',
    }
    const Auth: Model<IAuth> = AuthModel(dbConn)
    const {
      errors: signupErrors,
      data: { signup },
    } = await mutate({
      query: SIGNUP,
      variables: SIGNUP_FIXTURE,
    })
    const Group: Model<IGroup> = GroupModel(dbConn)
    const {
      data: { createGroup },
    } = await query(
      {
        query: CREATE_GROUP,
        variables: {
          name: 'Rep Zeppelin',
          password: 'q1w2e3',
          isPublic: false,
        },
      },
      generateAuthContext(signup.accessToken),
    )
  })

  afterAll(async () => {
    await closeConnection()
    await mongoServer.stop()
  })

  test('signup anonymous', async () => {
    const Auth: Model<IAuth> = AuthModel(dbConn)
    const SIGNUP_ANONYMOUS_FIXTURE = {
      name: 'Rafael Silva',
      groupSlug: 'rep-zeppelin',
      groupPassword: 'q1w2e3',
    }
    const response = await mutate({
      query: SIGNUP_ANONYMOUS,
      variables: SIGNUP_ANONYMOUS_FIXTURE,
    })
    expect(response.errors).toBeUndefined()
    expect(response.data.signupAnonymous.auth.user.name).toBe(
      SIGNUP_ANONYMOUS_FIXTURE.name,
    )
  })

  test('signup anonymous with unexistent group', async () => {
    const Auth: Model<IAuth> = AuthModel(dbConn)
    const SIGNUP_ANONYMOUS_FIXTURE = {
      name: 'Rafael Silva',
      groupSlug: 'lorem-ipsum',
      groupPassword: 'q1w2e3',
    }
    const { errors, data } = await mutate({
      query: SIGNUP_ANONYMOUS,
      variables: SIGNUP_ANONYMOUS_FIXTURE,
    })
    expect(data).toBeNull()
    expect(errors?.[0].message).toBe('Group slug or password is not invalid')
    expect(errors?.[0].extensions?.code).toBe('BAD_USER_INPUT')
  })

  test('signup anonymous with group wrong password', async () => {
    const Auth: Model<IAuth> = AuthModel(dbConn)
    const SIGNUP_ANONYMOUS_FIXTURE = {
      name: 'Rafael Silva',
      groupSlug: 'rep-zeppelin',
      groupPassword: 'e3w2q1',
    }
    const { errors, data } = await mutate({
      query: SIGNUP_ANONYMOUS,
      variables: SIGNUP_ANONYMOUS_FIXTURE,
    })
    expect(data).toBeNull()
    expect(errors?.[0].message).toBe('Group slug or password is not invalid')
    expect(errors?.[0].extensions?.code).toBe('BAD_USER_INPUT')
  })
})
