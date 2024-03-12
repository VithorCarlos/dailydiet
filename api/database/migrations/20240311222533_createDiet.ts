import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('diets', (table) => {
    table.increments('id').primary()
    table.string('name').notNullable()
    table.string('description').notNullable()
    table.boolean('isInDiet').notNullable()
    table.date('created_at').defaultTo(knex.fn.now())
    table.date('updated_at').defaultTo(knex.fn.now())
    table.string('user_id').references('id').inTable('users')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('diets')
}
