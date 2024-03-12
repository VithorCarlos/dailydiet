import { Knex } from 'knex'
import { env } from './src/env'

const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection:
    env.NODE_ENV === 'development'
      ? {
          filename: env.DATABASE_URL,
        }
      : env.DATABASE_URL,
  migrations: {
    directory: './database/migrations',
    extension: 'ts',
  },
  useNullAsDefault: true,
}

export default config
