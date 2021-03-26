import { Connection, Document, Schema, Model } from 'mongoose'
import { IUser, IAuth } from '../auth/model'

interface IParticipantBase {
  isAdmin: boolean
}

interface IParticipantData extends IParticipantBase {
  uuid: string
  user: IUser
}

export interface IParticipant extends IParticipantBase {
  auth: IAuth
}

interface GroupBase {
  name: string
  isPublic?: boolean
  slug: string
  createdAt: Date
  updatedAt: Date
}

export interface GroupData extends GroupBase {
  participants: IParticipantData[]
}

export interface IGroup extends GroupBase, Document {
  participants: IParticipant[]
}

const ParticipantSchema: Schema = new Schema({
  isAdmin: { type: Boolean, required: true },
  auth: {
    type: 'ObjectId',
    ref: 'auth',
  },
})

const GroupSchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, index: true, unique: true },
  isPublic: { type: Boolean, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
  participants: [ParticipantSchema],
})

const collectionName = 'group'

const GroupModel = (conn: Connection): Model<IGroup> =>
  conn.model<IGroup>(collectionName, GroupSchema)

export { GroupModel }
