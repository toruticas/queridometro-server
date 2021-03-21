import crypto from 'crypto'

const generateRandomHash = (size = 128): Promise<string> =>
  new Promise((resolve, reject) => {
    crypto.randomBytes(size / 2, (err, buffer) => {
      if (err) {
        reject(err)
      } else {
        resolve(buffer.toString('hex'))
      }
    })
  })

export { generateRandomHash }
