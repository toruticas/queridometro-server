import { Model, Connection } from 'mongoose'
import { MongoError } from 'mongodb'
import bcrypt from 'bcryptjs'
import { formatRFC3339 } from 'date-fns'

import { ApolloError, UserInputError } from 'config/apollo'
import { logger } from 'config/logger'

import { AuthModel, IAuth } from '../model'
import { generateCredentials } from './generateCredentials'

const signupMutation = async (
  parent: unknown,
  args: {
    name: string
    email: string
    password: string
    avatar?: string
  },
  { dbConn }: { dbConn: Connection },
): Promise<{ auth: IAuth; accessToken: string }> => {
  const Auth: Model<IAuth> = AuthModel(dbConn)
  try {
    const {
      uuid,
      accessToken,
      refreshToken,
      refreshTokenCreatedAt,
      refreshTokenExpiresAt,
    } = await generateCredentials()

    const auth = await Auth.create({
      uuid,
      email: args.email,
      password: await bcrypt.hash(args.password, 10),
      refreshToken,
      refreshTokenCreatedAt,
      refreshTokenExpiresAt,
      createdAt: formatRFC3339(new Date()),
      updatedAt: formatRFC3339(new Date()),
      user: {
        anonymous: false,
        name: args.name,
        avatar: args.avatar,
      },
    })

    return { auth, accessToken }
  } catch (e: unknown) {
    const error = e as MongoError
    logger.error('> signup Mutation error: ', error)

    if (error.name === 'MongoError' && error.code === 11000) {
      throw new UserInputError('Email already registered')
    }

    throw new ApolloError('Something went wrong')
  }
}

export { signupMutation }
