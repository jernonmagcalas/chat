import { knex } from 'chen/sql';

/**
 * Apply database schema changes
 * @param {knex} db
 */
export async function up(db: knex) {
  await db.schema.table('users', table => {
    table.dropUnique(['username']);
  });
}

/**
 * Rollback database schema changes
 * @param {knex} db
 */
export async function down(db: knex) {
  await db.schema.table('users', table => {
    table.unique(['username']);
  });
}
