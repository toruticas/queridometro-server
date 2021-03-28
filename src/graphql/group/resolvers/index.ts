import { findGroup } from './findGroup'
import { createGroup } from './createGroup'

const groupResolvers = {
  Query: {
    findGroup,
  },
  Mutation: {
    createGroup,
  },
}

export { groupResolvers }
