import knex from 'knex'
import config from '../knexfile'

const useKnex = knex(config)

export { useKnex }
