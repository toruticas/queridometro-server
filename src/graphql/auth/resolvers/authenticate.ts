import { Model, Connection } from 'mongoose'
import bcrypt from 'bcryptjs'
import { formatRFC3339, addMilliseconds } from 'date-fns'

import { ApolloError, UserInputError } from 'config/apollo'
import { logger } from 'config/logger'
import { generateCredentials } from './generateCredentials'

import { AuthModel, IAuth, IUser } from '../model'

const authenticateQuery = async (
  parent: unknown,
  args: {},
  { dbConn, uuid }: { dbConn: Connection; uuid: string },
): Promise<{ auth: IAuth; accessToken: string }> => {
  const Auth: Model<IAuth> = AuthModel(dbConn)
  try {
    const auth = await Auth.findOne({ uuid }).exec()
    if (!auth) {
      throw new Error('olar')
    }

    const {
      accessToken,
      refreshToken,
      refreshTokenCreatedAt,
      refreshTokenExpiresAt,
    } = await generateCredentials()

    await auth
      .updateOne({
        refreshToken,
        refreshTokenCreatedAt,
        refreshTokenExpiresAt,
      })
      .exec()

    return { auth, accessToken }
  } catch (error) {
    logger.error('> signup Mutation error: ', error)
    if (error.name === 'MongoError' && error.code === 11000) {
      throw new UserInputError('Phone number already registered')
    } else {
      throw new ApolloError('Something went wrong')
    }
  }
}

export { authenticateQuery }
