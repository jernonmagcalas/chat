import { knex } from 'chen/sql';

/**
 * Apply database schema changes
 * @param {knex} db
 */
export async function up(db: knex) {
  await db.schema.createTable('guests', table => {
    table.increments('id');
    table.integer('app_id').unsigned().notNullable();
    table.string('session_id').notNullable();
    table.string('email').nullable();
    table.timestamps();

    table.foreign('app_id').references('id').inTable('apps');
    table.unique(['app_id', 'session_id']);
  })
}

/**
 * Rollback database schema changes
 * @param {knex} db
 */
export async function down(db: knex) {
  await db.schema.dropTable('guests');
}
