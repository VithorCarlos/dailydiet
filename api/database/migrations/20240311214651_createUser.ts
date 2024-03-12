import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary()
    table.uuid('session_id').notNullable().index()
    table.string('name').notNullable()
    table.string('email').notNullable().unique().index()
    table.date('created_at').defaultTo(knex.fn.now()).notNullable()
    table.date('updated_at').defaultTo(knex.fn.now()).notNullable()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users')
}
