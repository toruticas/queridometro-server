const generateAuthContext = (token: string) => {
  return {
    req: {
      get() {
        return token
      },
    },
  }
}

export { generateAuthContext }
