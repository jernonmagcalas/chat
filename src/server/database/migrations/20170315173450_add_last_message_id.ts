import { knex } from 'chen/sql';

/**
 * Apply database schema changes
 * @param {knex} db
 */
export async function up(db: knex) {
  await db.schema.table('chat_room_users', table => {
    table.integer('last_message_id').unsigned()['after']('unread_count');
    table.foreign('last_message_id').references('id').inTable('messages');
  });
}

/**
 * Rollback database schema changes
 * @param {knex} db
 */
export async function down(db: knex) {
  await db.schema.table('chat_room_users', table => {
    table.dropForeign(['last_message_id']).dropColumn('last_message_id');
  });
}
