import { Connection } from 'mongoose'
import dayjs from 'dayjs'
import { ApolloError, UserInputError } from 'config/apollo'
import { logger } from 'config/logger'
import { slugify } from 'helpers/slugify'
import { generateRandomHash } from 'helpers/hash'

import { GroupModel, IGroup, IGroupEditable } from './model'

export default {
  Query: {
    group: async (
      parent: unknown,
      args: { slug: string },
      { dbConn }: { dbConn: Connection },
    ): Promise<IGroup> => {
      try {
        const Group = GroupModel(dbConn)
        const group = await Group.findOne({ slug: args.slug }).exec()
        if (group === null) {
          throw new UserInputError('group does not exists')
        }
        return group
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
    createGroup: async (
      parent: unknown,
      args: IGroupEditable,
      { dbConn }: { dbConn: Connection },
    ): Promise<IGroup> => {
      try {
        const Group = GroupModel(dbConn)
        let slug = slugify(args.name)
        const group = await Group.findOne({ slug }).exec()

        if (group) {
          slug = `${slug}-${await generateRandomHash(8)}`
        }

        const newGroup = await Group.create({
          ...args,
          isPublic: args.isPublic ?? false,
          slug,
          createdAt: dayjs().toDate(),
          updatedAt: dayjs().toDate(),
        })
        return newGroup
      } catch (error: unknown) {
        logger.error('> createGroup error: ', error)
        throw new ApolloError('Error while creating group')
      }
    },
  },
}
