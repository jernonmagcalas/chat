import { knex } from 'chen/sql';

/**
 * Apply database schema changes
 * @param {knex} db
 */
export async function up(db: knex) {
  return db.schema.createTable('user_apps', table => {
    table.increments('id');
    table.integer('app_id').unsigned().notNullable();
    table.integer('user_id').unsigned().notNullable();
    table.integer('access_level_id').unsigned().notNullable();
    table.timestamps();

    table.foreign('app_id').references('id').inTable('apps');
    table.foreign('user_id').references('id').inTable('users');
    table.foreign('access_level_id').references('id').inTable('access_levels');
    table.unique(['app_id', 'user_id']);
  });
}

/**
 * Rollback database schema changes
 * @param {knex} db
 */
export async function down(db: knex) {
  return db.schema.dropTable('user_apps');
}
