import { knex } from 'chen/sql';

/**
 * Apply database schema changes
 * @param {knex} db
 */
export async function up(db: knex) {
  await db.schema.createTable('tags', table => {
    table.increments('id');
    table.integer('app_id').unsigned().notNullable();
    table.string('name');
    table.boolean('is_active').notNullable().defaultTo(1);
    table.timestamps();

    table.foreign('app_id').references('id').inTable('apps');
    table.index(['is_active']);
    table.unique(['app_id', 'name']);
  });
}

/**
 * Rollback database schema changes
 * @param {knex} db
 */
export async function down(db: knex) {
  await db.schema.dropTable('tags');
}
