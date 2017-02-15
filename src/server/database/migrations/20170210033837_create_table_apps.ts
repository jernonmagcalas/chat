import { knex } from 'chen/sql';

/**
 * Apply database schema changes
 * @param {knex} db
 */
export async function up(db: knex) {
  return db.schema.createTable('apps', table => {
    table.increments('id');
    table.string('name').notNullable();
    table.string('slug').notNullable();
    table.string('domain');
    table.string('key').notNullable();
    table.string('secret').notNullable();
    table.timestamps();

    table.unique(['slug']);
    table.unique(['key']);
  });
}

/**
 * Rollback database schema changes
 * @param {knex} db
 */
export async function down(db: knex) {
  return db.schema.dropTable('apps');
}
