import path from 'path'
import dotenv from 'dotenv'

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
}

dotenv.config({
  path: path.resolve(process.cwd(), `.env.${process.env.NODE_ENV}`),
})
