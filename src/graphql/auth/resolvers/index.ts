import { signupMutation } from './signup'
import { signupAnonymousMutation } from './signupAnonymous'
import { signinMutation } from './signin'
import { authenticateQuery } from './authenticate'

const authResolvers = {
  Query: {
    authenticate: authenticateQuery,
  },
  Mutation: {
    signupAnonymous: signupAnonymousMutation,
    signup: signupMutation,
    signin: signinMutation,
  },
}

export { authResolvers }
