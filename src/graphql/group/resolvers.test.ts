import { Model } from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { differenceInDays } from 'date-fns'

import 'config/load'
import { gql } from 'config/apollo'
import { getConnection, closeConnection } from 'config/database'
import { testClient } from 'helpers/testClient'

import { GroupModel, IGroup } from './model'

const mongoServer = new MongoMemoryServer()

const GROUP_FIXTURE = {
  name: 'Rep Zeppelin',
}

const CREATE_GROUP = gql`
  mutation($name: String!) {
    createGroup(name: $name) {
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
    }
  }
`

describe('group resolvers', () => {
  let dbConn

  beforeAll(async () => {
    const mongoUri = await mongoServer.getUri()
    dbConn = await getConnection(mongoUri)
  })

  afterAll(async () => {
    await closeConnection()
    await mongoServer.stop()
  })

  test('create a group', async () => {
    const Group: Model<IGroup> = GroupModel(dbConn)
    const { query } = testClient()
    const response = await query({
      query: CREATE_GROUP,
      variables: GROUP_FIXTURE,
    })
    const auth = await Group.findOne({}).populate('group')
    expect(auth).toMatchObject(response.data.createGroup)
  })

  test('create a duplicate group name', async () => {
    const Group: Model<IGroup> = GroupModel(dbConn)
    const { query } = testClient()
    const response = await query({
      query: CREATE_GROUP,
      variables: GROUP_FIXTURE,
    })
    expect(response.data.createGroup.slug).not.toBe('rep-zeppelin')
  })

  test('fetch a group', async () => {
    const Group: Model<IGroup> = GroupModel(dbConn)
    const { mutate } = testClient()
    const response = await mutate({
      query: FETCH_GROUP,
      variables: { slug: 'rep-zeppelin' },
    })
    expect(response.data.group).toMatchObject(GROUP_FIXTURE)
  })

  test('fetch a nonexistent group', async () => {
    const Group: Model<IGroup> = GroupModel(dbConn)
    const { mutate } = testClient()
    const response = await mutate({
      query: FETCH_GROUP,
      variables: { slug: 'usp' },
    })
    expect(response.errors[0].extensions.code).toBe('BAD_USER_INPUT')
  })
})
