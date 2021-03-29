import { Document, Connection, Schema, Model } from 'mongoose'
import { Role } from 'graphql/directives/auth'

export interface IUser {
  name: string
  avatar?: string
}

export interface IAuth extends Document {
  uuid: string
  email: string
  role: Role
  password: string
  refreshToken: string
  refreshTokenCreatedAt: Date | string
  refreshTokenExpiresAt: Date | string
  createdAt: Date | string
  updatedAt: Date | string
  user: IUser
}

const AuthSchema = new Schema({
  uuid: { type: String, required: true },
  email: { type: String, required: true },
  role: { type: String, required: true },
  password: { type: String, required: true },
  refreshToken: { type: String, required: true },
  refreshTokenCreatedAt: { type: Date, required: true },
  refreshTokenExpiresAt: { type: Date, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
  user: {
    name: { type: String, required: true },
    avatar: { type: String },
  },
})

AuthSchema.index({ email: 1 }, { unique: true })

const collectionName = 'auth'

const AuthModel = (conn: Connection): Model<IAuth> =>
  conn.model<IAuth>(collectionName, AuthSchema)

export { AuthModel, AuthSchema }
