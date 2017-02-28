import { knex } from 'chen/sql';

/**
 * Apply database schema changes
 * @param {knex} db
 */
export async function up(db: knex) {
  await db.schema.table('guests', table => {
    table.string('profile_pic')['after']('email');
  });
}

/**
 * Rollback database schema changes
 * @param {knex} db
 */
export async function down(db: knex) {
  await db.schema.table('guests', table => {
    table.dropColumn('profile_pic');
  });
}
