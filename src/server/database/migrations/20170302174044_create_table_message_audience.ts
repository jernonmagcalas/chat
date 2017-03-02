import { knex } from 'chen/sql';

/**
 * Apply database schema changes
 * @param {knex} db
 */
export async function up(db: knex) {
  await db.schema.createTable('message_audience', table => {
    table.increments('id');
    table.integer('message_id').unsigned().notNullable();
    table.enum('origin', ['users', 'guests']).notNullable();
    table.integer('origin_id').notNullable();
    table.timestamps();

    table.foreign('message_id').references('id').inTable('messages');

    table.index(['origin', 'origin_id']);
    table.unique(['origin', 'origin_id', 'message_id']);
  });
}

/**
 * Rollback database schema changes
 * @param {knex} db
 */
export async function down(db: knex) {
  await db.schema.dropTable('message_audience');
}
