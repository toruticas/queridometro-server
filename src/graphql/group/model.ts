import { Connection, Document, Schema, Model } from 'mongoose'

export interface IGroupEditable {
  name: string
  isPublic: boolean
}

export interface IGroup extends Document, IGroupEditable {
  slug: string
  createdAt: Date
  updatedAt: Date
}

const GroupSchema: Schema = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  isPublic: { type: Boolean, required: true },
  createdAt: { type: Date, required: true },
  updatedAt: { type: Date, required: true },
})

GroupSchema.index({ slug: 1 }, { unique: true })

const collectionName = 'group'

const GroupModel = (conn: Connection): Model<IGroup> =>
  conn.model<IGroup>(collectionName, GroupSchema)

export { GroupModel }
