import { signupMutation } from './signup'
import { signinMutation } from './signin'
import { authenticateQuery } from './authenticate'

export default {
  Query: {
    authenticate: authenticateQuery,
  },
  Mutation: {
    signup: signupMutation,
    signin: signinMutation,
  },
}
