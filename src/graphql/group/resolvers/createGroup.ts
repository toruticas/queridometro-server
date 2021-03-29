import { ApolloError, Resolver, AuthenticationError } from 'config/apollo'
import { logger } from 'config/logger'
import { Role } from 'graphql/directives/auth'

import { GroupData } from '../model'

interface CreateGroupArgs {
  name: string
  password: string
  isPublic?: boolean
}

const createGroup: Resolver<CreateGroupArgs, GroupData> = async (
  parent,
  { name, password, isPublic = false },
  { dataSources, uuid, role },
): Promise<GroupData> => {
  try {
    if (!role || role !== Role.User) {
      throw new AuthenticationError('Unauthorized access')
    }

    const group = await dataSources.groups.create(
      { name, password, isPublic },
      uuid,
    )
    return group
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      throw error
    }
    logger.error('> createGroup error: ', error)
    throw new ApolloError('Error while creating group')
  }
}

export { createGroup }
