import { knex } from 'chen/sql';

/**
 * Apply database schema changes
 * @param {knex} db
 */
export async function up(db: knex) {
  await db.schema.createTable('chat_room_users', table => {
    table.increments('id');
    table.integer('chat_room_id').unsigned().notNullable();
    table.integer('origin_id').notNullable().unsigned();
    table.enum('origin', ['users', 'guests']).notNullable();
    table.integer('unread_count').notNullable().unsigned().defaultTo(0);
    table.dateTime('last_message_date').nullable();
    table.timestamps();

    table.foreign('chat_room_id').references('id').inTable('chat_rooms');
    table.index(['origin_id']);
    table.index(['last_message_date']);
    table.unique(['chat_room_id', 'origin_id', 'origin']);
  });
}

/**
 * Rollback database schema changes
 * @param {knex} db
 */
export async function down(db: knex) {
  await db.schema.dropTable('chat_room_users');
}
