import { knex } from 'chen/sql';

/**
 * Apply database schema changes
 * @param {knex} db
 */
export async function up(db: knex) {
  await db.schema.createTable('chat_rooms', table => {
    table.increments('id');
    table.integer('tag_id').unsigned().notNullable();
    table.timestamps();

    table.foreign('tag_id').references('id').inTable('tags');
  });
}

/**
 * Rollback database schema changes
 * @param {knex} db
 */
export async function down(db: knex) {
  await db.schema.dropTable('chat_rooms');
}
