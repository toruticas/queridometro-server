import { Mongoose } from 'mongoose'
import { TContext } from 'config/apollo'
import { Groups } from './group/dataSource'

const dataSources = (dbConn: Mongoose): TContext => {
  return {
    groups: new Groups(dbConn),
  }
}

export { dataSources }
