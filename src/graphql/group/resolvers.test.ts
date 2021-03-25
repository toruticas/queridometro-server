import { Model } from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { differenceInDays } from 'date-fns'

import 'config/load'
import { gql } from 'config/apollo'
import { getConnection, closeConnection } from 'config/database'

import { testClient } from 'helpers/testClient'
import { generateAuthContext } from 'helpers/testUtils'
import { AuthModel, IAuth } from 'graphql/auth/model'

import { GroupModel, IGroup } from './model'

const mongoServer = new MongoMemoryServer()

const GROUP_FIXTURE = {
  name: 'Rep Zeppelin',
  isPublic: false,
}

const CREATE_GROUP = gql`
  mutation($name: String!, $isPublic: Boolean) {
    createGroup(name: $name, isPublic: $isPublic) {
      name
      slug
    }
  }
`
const FETCH_GROUP = gql`
  query($slug: String!) {
    group(slug: $slug) {
      name
      slug
      isPublic
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
    const response = await query(
      {
        query: CREATE_GROUP,
        variables: GROUP_FIXTURE,
      },
      tokenContext,
    )
    const group = await Group.findOne({}).populate('group')
    expect(group).toMatchObject(response.data.createGroup)
  })

  test('create a duplicate group name', async () => {
    const Group: Model<IGroup> = GroupModel(dbConn)
    const response = await query(
      {
        query: CREATE_GROUP,
        variables: GROUP_FIXTURE,
      },
      tokenContext,
    )
    expect(response.data.createGroup.slug).not.toBe('rep-zeppelin')
  })

  test('fetch a group', async () => {
    const Group: Model<IGroup> = GroupModel(dbConn)
    const response = await mutate({
      query: FETCH_GROUP,
      variables: { slug: 'rep-zeppelin' },
    })
    expect(response.data.group).toMatchObject(GROUP_FIXTURE)
  })

  test('fetch a nonexistent group', async () => {
    const Group: Model<IGroup> = GroupModel(dbConn)
    const response = await mutate({
      query: FETCH_GROUP,
      variables: { slug: 'usp' },
    })
    expect(response.errors[0].extensions.code).toBe('BAD_USER_INPUT')
  })
})
