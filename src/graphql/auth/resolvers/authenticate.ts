import { Model, Connection } from 'mongoose'

import { ApolloError, AuthenticationError } from 'config/apollo'
import { logger } from 'config/logger'

import { Role } from 'graphql/directives/auth'
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
      throw new AuthenticationError('Unauthorized access')
    }

    const {
      accessToken,
      refreshToken,
      refreshTokenCreatedAt,
      refreshTokenExpiresAt,
    } = await generateCredentials(auth.role)

    await auth
      .updateOne({
        refreshToken,
        refreshTokenCreatedAt,
        refreshTokenExpiresAt,
      })
      .exec()

    return { auth, accessToken }
  } catch (error: unknown) {
    if (error instanceof AuthenticationError) {
      throw error
    }
    logger.error('> signup Mutation error: ', error)
    throw new ApolloError('Something went wrong')
  }
}

export { authenticateQuery }
