import { TContextExpress } from 'config/apollo'

const generateAuthContext = (token: string): TContextExpress => {
  const context: TContextExpress = {
    req: {
      get() {
        return token
      },
    },
  }

  return context
}

export { generateAuthContext }
