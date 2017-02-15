import { knex } from 'chen/sql';

/**
 * Apply database schema changes
 * @param {knex} db
 */
export async function up(db: knex) {
  return db.schema.createTable('access_levels', table => {
    table.increments('id');
    table.integer('app_id').unsigned().notNullable();
    table.string('name');
    table.enum('type', ['owner', 'staff']);
    table.timestamps();

    table.index(['type']);
    table.foreign('app_id').references('id').inTable('apps');
  });
}

/**
 * Rollback database schema changes
 * @param {knex} db
 */
export async function down(db: knex) {
  return db.schema.dropTable('access_levels');
}
