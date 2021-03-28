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
import { findGroup } from './findGroup'

interface CreateGroupArgs {
  name: string
  password: string
  isPublic?: boolean
}

const createGroup: Resolver<CreateGroupArgs, IGroup> = async (
  parent,
  { name, password, isPublic = false },
  { dbConn, uuid },
): Promise<IGroup> => {
  try {
    const Group = GroupModel(dbConn)
    const Auth = AuthModel(dbConn)
    let slug = slugify(name)
    const group = await Group.findOne({ slug }).exec()
    const auth = await Auth.findOne({ uuid }).exec()

    if (!auth || auth.role !== Role.User) {
      throw new AuthenticationError('Unauthorized access')
    }

    if (group) {
      slug = `${slug}-${await generateRandomHash(8)}`
    }

    const newGroup = await Group.create({
      name,
      password: await bcrypt.hash(password, 10),
      isPublic,
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

export { createGroup }
