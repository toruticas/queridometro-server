import { signupMutation } from './signup'
import { authenticateQuery } from './authenticate'

export default {
  Query: {
    authenticate: authenticateQuery,
  },
  Mutation: {
    signup: signupMutation,
  },
}
