import crypto from 'crypto'

interface GenerateRandomHash {
  (size?: number): Promise<string>
}
const generateRandomHash: GenerateRandomHash = (size = 128) =>
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
