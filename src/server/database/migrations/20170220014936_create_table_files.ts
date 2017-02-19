import { knex } from 'chen/sql';

/**
 * Apply database schema changes
 * @param {knex} db
 */
export async function up(db: knex) {
  await db.schema.createTable('files', table => {
    table.increments('id');
    table.string('name').notNullable();
    table.string('file_name').notNullable();
    table.string('type');
    table.timestamps();
  });
}

/**
 * Rollback database schema changes
 * @param {knex} db
 */
export async function down(db: knex) {
  await db.schema.dropTable('files');
}
