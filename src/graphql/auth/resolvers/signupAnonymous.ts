import { Model, Connection } from 'mongoose'
import { MongoError } from 'mongodb'
import bcrypt from 'bcryptjs'
import { formatRFC3339 } from 'date-fns'

import { ApolloError, UserInputError, Resolver } from 'config/apollo'
import { logger } from 'config/logger'
import { generateRandomHash } from 'helpers/hash'

import { AuthModel, IAuth } from '../model'
import { generateCredentials } from './generateCredentials'

interface Args {
  name: string
  group: string
  password: string
  avatar?: string
}

interface Response {
  auth: IAuth
  accessToken: string
}

const signupAnonymousMutation: Resolver<Args, Response> = async (
  parent,
  { name, group, password, avatar },
  { dbConn },
) => {
  const Auth: Model<IAuth> = AuthModel(dbConn)
  try {
    const {
      uuid,
      accessToken,
      refreshToken,
      refreshTokenCreatedAt,
      refreshTokenExpiresAt,
    } = await generateCredentials(false)

    const auth = await Auth.create({
      uuid,
      email: `anonymous+${generateRandomHash(16)}@queridometro.com.br`,
      password: await bcrypt.hash(await generateRandomHash(), 10),
      refreshToken,
      refreshTokenCreatedAt,
      refreshTokenExpiresAt,
      createdAt: formatRFC3339(new Date()),
      updatedAt: formatRFC3339(new Date()),
      user: {
        anonymous: false,
        name,
        avatar,
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

export { signupAnonymousMutation }
