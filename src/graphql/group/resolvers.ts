import { Connection } from 'mongoose'
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

import { GroupModel, IGroupData, IGroup } from './model'
import { AuthModel, IAuth } from '../auth/model'

interface CreateGroupArgs {
  name: string
  isPublic?: boolean
}

const createGroup: Resolver<CreateGroupArgs, IGroup> = async (
  parent,
  args,
  { dbConn, uuid },
): Promise<IGroup> => {
  try {
    const Group = GroupModel(dbConn)
    const Auth = AuthModel(dbConn)
    let slug = slugify(args.name)
    const group = await Group.findOne({ slug }).exec()
    const auth = await Auth.findOne({ uuid }).exec()

    if (!auth) {
      throw new AuthenticationError('Unauthorized access')
    }

    if (group) {
      slug = `${slug}-${await generateRandomHash(8)}`
    }

    const newGroup = await Group.create({
      ...args,
      isPublic: args.isPublic ?? false,
      slug,
      participants: [{ isAdmin: true, auth }],
      createdAt: dayjs().toDate(),
      updatedAt: dayjs().toDate(),
    })
    return newGroup
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      throw error
    }
    logger.error('> createGroup error: ', error)
    throw new ApolloError('Error while creating group')
  }
}

export default {
  Query: {
    group: async (
      parent: unknown,
      args: { slug: string },
      { dbConn }: { dbConn: Connection },
    ): Promise<IGroupData> => {
      try {
        const Group = GroupModel(dbConn)
        const group = await Group.findOne({ slug: args.slug })
          .populate('participants.auth')
          .exec()
        if (group === null) {
          throw new UserInputError('group does not exists')
        }

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
        if (error instanceof UserInputError) {
          throw error
        }
        logger.error('> group error: ', error)
        throw new ApolloError('Error retrieving group')
      }
    },
  },

  Mutation: {
    createGroup,
  },
}
