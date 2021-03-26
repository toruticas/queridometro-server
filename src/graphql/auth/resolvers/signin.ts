import { Model } from 'mongoose'
import { MongoError } from 'mongodb'
import bcrypt from 'bcryptjs'

import { ApolloError, UserInputError, Resolver } from 'config/apollo'
import { logger } from 'config/logger'

import { AuthModel, IAuth } from '../model'
import { generateCredentials } from './generateCredentials'

interface Args {
  email: string
  password: string
}

interface Response {
  auth: IAuth
  accessToken: string
}

const signinMutation: Resolver<Args, Response> = async (
  parent,
  { email, password },
  { dbConn },
) => {
  const Auth: Model<IAuth> = AuthModel(dbConn)
  try {
    const auth = await Auth.findOne({ email }).exec()
    if (!auth) {
      throw new UserInputError('Email or password invalid')
    }

    const valid = await bcrypt.compare(password, auth.password)
    if (!valid) {
      throw new UserInputError('Email or password invalid')
    }

    const {
      accessToken,
      refreshToken,
      refreshTokenCreatedAt,
      refreshTokenExpiresAt,
    } = await generateCredentials(auth.user.anonymous)

    await auth
      .updateOne({
        refreshToken,
        refreshTokenCreatedAt,
        refreshTokenExpiresAt,
      })
      .exec()

    return { auth, accessToken }
  } catch (e: unknown) {
    const error = e as MongoError
    logger.error('> signin Mutation error: ', error)

    if (error instanceof UserInputError) {
      throw error
    }

    if (error.name === 'MongoError' && error.code === 11000) {
      throw new UserInputError('Email already registered')
    }

    throw new ApolloError('Something went wrong')
  }
}

export { signinMutation }
