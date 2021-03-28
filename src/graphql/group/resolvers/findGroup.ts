import { Connection } from 'mongoose'
import bcrypt from 'bcryptjs'
import dayjs from 'dayjs'
import {
  ApolloError,
  UserInputError,
  Resolver,
  AuthenticationError,
} from 'config/apollo'
import { logger } from 'config/logger'
import { slugify } from 'helpers/slugify'
import { generateRandomHash } from 'helpers/hash'
import { Role } from 'graphql/directives/auth'

import { AuthModel, IAuth } from 'graphql/auth/model'
import { GroupModel, GroupData, IGroup } from '../model'

const handleGroupSecurity = async (
  group: IGroup,
  uuid?: string,
): Promise<void> => {
  if (group.isPublic) {
    return
  }
  const userBelongsToGroup =
    group.participants.findIndex(
      participant => participant.auth.uuid === uuid,
    ) !== -1

  if (userBelongsToGroup) {
    return
  }

  throw new AuthenticationError('Unauthorized access')
}

const findGroup: Resolver<{ slug: string }, GroupData> = async (
  parent,
  { slug },
  { dbConn, uuid },
) => {
  try {
    const Group = GroupModel(dbConn)
    const group = await Group.findOne({ slug })
      .populate('participants.auth')
      .exec()

    if (group === null) {
      throw new UserInputError('group does not exists')
    }

    await handleGroupSecurity(group, uuid)

    return {
      name: group.name,
      slug: group.slug,
      isPublic: group.isPublic,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      participants: group.participants.map(
        ({ isAdmin, auth: { uuid, user } }) => ({
          isAdmin,
          uuid,
          user,
        }),
      ),
    }
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
