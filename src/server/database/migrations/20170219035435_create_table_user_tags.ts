import { knex } from 'chen/sql';

/**
 * Apply database schema changes
 * @param {knex} db
 */
export async function up(db: knex) {
  await db.schema.createTable('user_tags', table => {
    table.increments('id');
    table.integer('app_id').unsigned().notNullable();
    table.integer('user_id').unsigned().notNullable();
    table.integer('tag_id').unsigned().notNullable();
    table.timestamps();

    table.foreign('app_id').references('id').inTable('apps');
    table.foreign('user_id').references('id').inTable('users');
    table.foreign('tag_id').references('id').inTable('tags');
    table.unique(['app_id', 'user_id', 'tag_id']);
  });
}

/**
 * Rollback database schema changes
 * @param {knex} db
 */
export async function down(db: knex) {
  await db.schema.dropTable('user_tags');
}
