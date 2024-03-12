// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      session_id: string
      name: string
      email: string
      created_at: string
      updated_at: string
    }
    diets: {
      id: number
      name: string
      description: string
      isInDiet: boolean
      user_id: string
      created_at: string
      updated_at: string
    }
  }
}
