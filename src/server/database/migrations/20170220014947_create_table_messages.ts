import { knex } from 'chen/sql';

/**
 * Apply database schema changes
 * @param {knex} db
 */
export async function up(db: knex) {
  await db.schema.createTable('messages', table => {
    table.increments('id');
    table.integer('chat_room_id').unsigned().notNullable();
    table.enum('origin', ['users', 'guests']).notNullable();
    table.integer('origin_id').notNullable();
    table.text('content').nullable();
    table.integer('file_id').unsigned().nullable();
    table.integer('link_id').unsigned().nullable();
    table.timestamps();

    table.foreign('chat_room_id').references('id').inTable('chat_rooms');
    table.foreign('file_id').references('id').inTable('files');
    table.foreign('link_id').references('id').inTable('links');
  });
}

/**
 * Rollback database schema changes
 * @param {knex} db
 */
export async function down(db: knex) {
  await db.schema.dropTable('messages');
}
