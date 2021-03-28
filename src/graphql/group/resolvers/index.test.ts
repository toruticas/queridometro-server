import { Model } from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { differenceInDays } from 'date-fns'

import 'config/load'
import { gql } from 'config/apollo'
import { getConnection, closeConnection } from 'config/database'

import { testClient } from 'helpers/testClient'
import { generateAuthContext } from 'helpers/testUtils'
import { AuthModel, IAuth } from 'graphql/auth/model'

import { GroupModel, IGroup } from '../model'

const mongoServer = new MongoMemoryServer()

const GROUP_FIXTURE = {
  name: 'Rep Zeppelin',
  password: 'q1w2e3',
  isPublic: false,
}

const CREATE_GROUP = gql`
  mutation($name: String!, $password: String!, $isPublic: Boolean) {
    createGroup(name: $name, password: $password, isPublic: $isPublic) {
      name
      slug
    }
  }
`
const FETCH_GROUP = gql`
  query($slug: String!) {
    findGroup(slug: $slug) {
      name
      slug
      isPublic
      participants {
        isAdmin
        user {
          name
        }
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

const SIGNUP_ANONYMOUS = gql`
  mutation AuthSignupAnonymous(
    $name: String!
    $avatar: String
    $groupSlug: String!
    $groupPassword: String!
  ) {
    signupAnonymous(
      name: $name
      avatar: $avatar
      groupSlug: $groupSlug
      groupPassword: $groupPassword
    ) {
      accessToken
      auth {
        user {
          name
        }
      }
    }
  }
`

const SIGNUP_ANONYMOUS_FIXTURE = {
  name: 'Rafael Silva',
  group: 'rep-zeppelin',
  password: 'q1w2e3',
}

describe('group resolvers', () => {
  const { mutate, query } = testClient()
  let tokenContext
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
    tokenContext = generateAuthContext(signup.accessToken)
  })

  afterAll(async () => {
    await closeConnection()
    await mongoServer.stop()
  })

  test('create a group', async () => {
    const Group: Model<IGroup> = GroupModel(dbConn)
    const {
      data: { createGroup },
    } = await query(
      {
        query: CREATE_GROUP,
        variables: GROUP_FIXTURE,
      },
      tokenContext,
    )
    const group = await Group.findOne({}).populate('group')
    expect(group).toMatchObject(createGroup)
  })

  test('create a group without auth', async () => {
    const Group: Model<IGroup> = GroupModel(dbConn)
    const { errors } = await query({
      query: CREATE_GROUP,
      variables: GROUP_FIXTURE,
    })
    expect(errors?.[0].message).toBe('Unauthorized access')
    expect(errors?.[0].extensions?.code).toBe('UNAUTHENTICATED')
  })

  test('create group as anonymous user', async () => {
    const Auth: Model<IAuth> = AuthModel(dbConn)
    const { mutate } = testClient()
    const {
      errors: authErrors,
      data: { signupAnonymous },
    } = await mutate({
      query: SIGNUP_ANONYMOUS,
      variables: {
        name: 'Rafael Silva',
        groupSlug: 'rep-zeppelin',
        groupPassword: 'q1w2e3',
      },
    })
    expect(authErrors).toBeUndefined()
    expect(signupAnonymous.auth.user.name).toBe(SIGNUP_ANONYMOUS_FIXTURE.name)

    const Group: Model<IGroup> = GroupModel(dbConn)
    const { errors } = await query(
      {
        query: CREATE_GROUP,
        variables: GROUP_FIXTURE,
      },
      generateAuthContext(signupAnonymous.accessToken),
    )
    expect(errors?.[0].message).toBe('Unauthorized access')
    expect(errors?.[0].extensions?.code).toBe('UNAUTHENTICATED')
  })

  test('create a duplicate group name', async () => {
    const Group: Model<IGroup> = GroupModel(dbConn)
    const {
      data: { createGroup },
    } = await query(
      {
        query: CREATE_GROUP,
        variables: GROUP_FIXTURE,
      },
      tokenContext,
    )
    expect(createGroup.slug).not.toBe('rep-zeppelin')
  })

  test('fetch a group', async () => {
    const Group: Model<IGroup> = GroupModel(dbConn)
    const {
      errors,
      data: { findGroup },
    } = await mutate(
      {
        query: FETCH_GROUP,
        variables: { slug: 'rep-zeppelin' },
      },
      tokenContext,
    )
    expect(findGroup).toMatchObject({
      name: 'Rep Zeppelin',
      slug: 'rep-zeppelin',
      isPublic: false,
    })
    expect(findGroup.participants[0]).toMatchObject({
      isAdmin: true,
      user: {
        name: 'Rafael Silva',
      },
    })
  })

  test('fetch a group non public', async () => {
    const Group: Model<IGroup> = GroupModel(dbConn)
    const {
      errors,
      data: { findGroup },
    } = await mutate({
      query: FETCH_GROUP,
      variables: { slug: 'rep-zeppelin' },
    })
    expect(errors?.[0].message).toBe('Unauthorized access')
    expect(errors?.[0].extensions?.code).toBe('UNAUTHENTICATED')
  })

  test('fetch a group non public with a authenticated user', async () => {
    const Auth: Model<IAuth> = AuthModel(dbConn)
    const Group: Model<IGroup> = GroupModel(dbConn)
    const {
      errors: signupErrors,
      data: { signup },
    } = await mutate({
      query: SIGNUP,
      variables: {
        name: 'Silva Rafael',
        email: 'gmail@toruticas.com',
        password: 'q1w2e3',
      },
    })
    const {
      errors,
      data: { findGroup },
    } = await mutate(
      {
        query: FETCH_GROUP,
        variables: { slug: 'rep-zeppelin' },
      },
      generateAuthContext(signup.accessToken),
    )
    expect(errors?.[0].message).toBe('Unauthorized access')
    expect(errors?.[0].extensions?.code).toBe('UNAUTHENTICATED')
  })

  test('fetch a nonexistent group', async () => {
    const Group: Model<IGroup> = GroupModel(dbConn)
    const { errors } = await mutate({
      query: FETCH_GROUP,
      variables: { slug: 'usp' },
    })
    expect(errors[0].extensions.code).toBe('BAD_USER_INPUT')
  })
})
