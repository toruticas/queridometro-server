import { Mongoose } from 'mongoose'
import { Role } from 'graphql/directives/enums'

import { Groups } from './group/dataSource'

export interface TDataSources {
  groups: Groups
}

export interface TContext {
  dbConn: Mongoose
  dataSources: TDataSources
  uuid?: string
  role?: Role
}

const dataSources = (dbConn: Mongoose): TDataSources => {
  return {
    groups: new Groups(dbConn),
  }
}

export { dataSources }
