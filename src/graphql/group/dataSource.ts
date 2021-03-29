import { Mongoose, Model } from 'mongoose'
import bcrypt from 'bcryptjs'
import dayjs from 'dayjs'
import { DataSource } from 'apollo-datasource'

import { slugify } from 'helpers/slugify'
import { IAuth, AuthSchema } from 'graphql/auth/model'
import { generateRandomHash } from 'helpers/hash'

import { IGroup, GroupSchema, GroupData } from './model'

interface CreateGroupArgs {
  name: string
  password: string
  isPublic?: boolean
}

class Groups extends DataSource {
  private connection: Mongoose
  private model: Model<IGroup>
  private authModel: Model<IAuth>

  constructor(connection: Mongoose) {
    super()
    this.connection = connection
    this.model = this.connection.model<IGroup>('group', GroupSchema)
    this.authModel = this.connection.model<IAuth>('auth', AuthSchema)
  }

  static adapter(group: IGroup): GroupData {
    return {
      name: group.name,
      slug: group.slug,
      isPublic: group.isPublic,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      participants: group.participants.map(
        ({ isAdmin, auth: { uuid, user } }) => ({
          isAdmin,
          uuid,
          user,
        }),
      ),
    }
  }

  async findOneBySlug(slug: string): Promise<GroupData | null> {
    const group = await this.model
      .findOne({ slug })
      .populate('participants.auth')
      .exec()

    if (!group) {
      return null
    }

    return Groups.adapter(group)
  }

  async create(
    { name, password, isPublic }: CreateGroupArgs,
    uuid?: string,
  ): Promise<GroupData> {
    let slug = slugify(name)
    const auth = await this.authModel.findOne({ uuid }).exec()
    const group = await this.model.findOne({ slug }).exec()

    if (group) {
      slug = `${slug}-${await generateRandomHash(8)}`
    }

    const newGroup = await this.model.create({
      name,
      password: await bcrypt.hash(password, 10),
      isPublic,
      slug,
      participants: [{ isAdmin: true, auth }],
      createdAt: dayjs().toDate(),
      updatedAt: dayjs().toDate(),
    })

    return Groups.adapter(newGroup)
  }

  userCanViewGroup(group: GroupData, uuid?: string): boolean {
    if (group.isPublic) {
      return true
    }

    return (
      group.participants.findIndex(participant => participant.uuid === uuid) !==
      -1
    )
  }
}

export { Groups }
