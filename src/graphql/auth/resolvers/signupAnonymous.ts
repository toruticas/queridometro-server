import { Model, Connection } from 'mongoose'
import { MongoError } from 'mongodb'
import bcrypt from 'bcryptjs'
import { formatRFC3339 } from 'date-fns'

import { ApolloError, UserInputError, Resolver } from 'config/apollo'
import { logger } from 'config/logger'
import { generateRandomHash } from 'helpers/hash'

import { Role } from 'graphql/directives/auth'
import { AuthModel, IAuth } from '../model'
import { GroupModel, GroupData, IGroup } from 'graphql/group/model'
import { generateCredentials } from './generateCredentials'

interface Args {
  name: string
  groupSlug: string
  groupPassword: string
  avatar?: string
}

interface Response {
  auth: IAuth
  accessToken: string
}

const signupAnonymousMutation: Resolver<Args, Response> = async (
  parent,
  { name, groupSlug, groupPassword, avatar },
  { dbConn },
) => {
  try {
    const Group = GroupModel(dbConn)
    const Auth: Model<IAuth> = AuthModel(dbConn)
    const group = await Group.findOne({ slug: groupSlug }).exec()

    if (group === null) {
      throw new UserInputError('Group slug or password is not invalid')
    }

    const valid = await bcrypt.compare(groupPassword, group.password)
    if (!valid) {
      throw new UserInputError('Group slug or password is not invalid')
    }

    const {
      uuid,
      accessToken,
      refreshToken,
      refreshTokenCreatedAt,
      refreshTokenExpiresAt,
    } = await generateCredentials(Role.Anonymous)

    const auth = await Auth.create({
      uuid,
      email: `anonymous+${generateRandomHash(16)}@queridometro.com.br`,
      role: Role.Anonymous,
      password: await bcrypt.hash(await generateRandomHash(), 10),
      refreshToken,
      refreshTokenCreatedAt,
      refreshTokenExpiresAt,
      createdAt: formatRFC3339(new Date()),
      updatedAt: formatRFC3339(new Date()),
      user: {
        name,
        avatar,
      },
    })

    await group
      .updateOne({
        participants: [...group.participants, { isAdmin: false, auth }],
      })
      .exec()

    return { auth, accessToken }
  } catch (error: unknown) {
    if (error instanceof UserInputError) {
      throw error
    }

    if (error instanceof MongoError && error.code === 11000) {
      throw new UserInputError('Email already registered')
    }

    logger.error('> signup Mutation error: ', error)
    throw new ApolloError('Something went wrong')
  }
}

export { signupAnonymousMutation }
