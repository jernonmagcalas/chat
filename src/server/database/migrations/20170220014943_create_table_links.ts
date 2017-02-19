import { knex } from 'chen/sql';

/**
 * Apply database schema changes
 * @param {knex} db
 */
export async function up(db: knex) {
  await db.schema.createTable('links', table => {
    table.increments('id');
    table.string('url').notNullable();
    table.string('title').notNullable();
    table.string('content', 500).nullable();
    table.string('image').nullable();
    table.timestamps();
    table.unique(['url']);
  });
}

/**
 * Rollback database schema changes
 * @param {knex} db
 */
export async function down(db: knex) {
  await db.schema.dropTable('links');
}
