import {
  ApolloError,
  UserInputError,
  Resolver,
  AuthenticationError,
} from 'config/apollo'
import { logger } from 'config/logger'

import { GroupData } from '../model'

const findGroup: Resolver<{ slug: string }, GroupData> = async (
  parent,
  { slug },
  { uuid, dataSources },
) => {
  try {
    const group = await dataSources.groups.findOneBySlug(slug)
    if (group === null) {
      throw new UserInputError('group does not exists')
    }

    if (!dataSources.groups.userCanViewGroup(group, uuid)) {
      throw new AuthenticationError('Unauthorized access')
    }

    return group
  } catch (error: unknown) {
    const isAHandledError =
      error instanceof AuthenticationError || error instanceof UserInputError

    if (isAHandledError) {
      throw error
    }
    logger.error('> group error: ', error)
    throw new ApolloError('Error retrieving group')
  }
}

export { findGroup }
