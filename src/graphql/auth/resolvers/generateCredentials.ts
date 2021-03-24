import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import { formatRFC3339, addMilliseconds } from 'date-fns'
import { v4 as uuidv4 } from 'uuid'

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

const randomToken = (size = 128): Promise<string> =>
  new Promise((resolve, reject) => {
    crypto.randomBytes(size / 2, (err, buffer) => {
      if (err) {
        reject(err)
      } else {
        resolve(buffer.toString('hex'))
      }
    })
  })

const generateCredentials = async (): Promise<Credentials> => {
  const refreshToken = await randomToken()
  const uuid = uuidv4()
  const accessToken = jwt.sign({ uuid }, String(JWT_SECRET), {
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
