import { scalarResolvers } from './scalar/resolvers'
import { groupResolvers } from './group/resolvers'
import { authResolvers } from './auth/resolvers'

const resolvers = [scalarResolvers, groupResolvers, authResolvers]

export { resolvers }
