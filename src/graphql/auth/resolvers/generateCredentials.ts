import jwt from 'jsonwebtoken'
import { formatRFC3339, addMilliseconds } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'
import { generateRandomHash } from 'helpers/hash'
import { Role } from 'graphql/directives/auth'

export interface Credentials {
  uuid: string
  accessToken: string
  refreshToken: string
  refreshTokenCreatedAt: string
  refreshTokenExpiresAt: string
}

const { JWT_SECRET } = process.env

const ACCESS_TOKEN_TTL = 3 * 24 * 60 * 60
const REFRESH_TOKEN_TTL = 10 * 24 * 60 * 60 * 1000

const generateCredentials = async (role: Role): Promise<Credentials> => {
  const refreshToken = await generateRandomHash()
  const uuid = uuidv4()
  const accessToken = jwt.sign({ uuid, role }, String(JWT_SECRET), {
    expiresIn: ACCESS_TOKEN_TTL,
  })

  return {
    uuid,
    accessToken,
    refreshToken,
    refreshTokenCreatedAt: formatRFC3339(new Date()),
    refreshTokenExpiresAt: formatRFC3339(
      addMilliseconds(new Date(), REFRESH_TOKEN_TTL),
    ),
  }
}

export { generateCredentials }
