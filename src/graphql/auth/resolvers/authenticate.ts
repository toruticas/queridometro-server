import { Model, Connection } from 'mongoose'

import { ApolloError } from 'config/apollo'
import { logger } from 'config/logger'

import { AuthModel, IAuth } from '../model'
import { generateCredentials } from './generateCredentials'

const authenticateQuery = async (
  parent: unknown,
  args: unknown,
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
  } catch (error: unknown) {
    logger.error('> signup Mutation error: ', error)
    throw new ApolloError('Something went wrong')
  }
}

export { authenticateQuery }
