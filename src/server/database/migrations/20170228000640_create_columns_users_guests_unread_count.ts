import { knex } from 'chen/sql';

/**
 * Apply database schema changes
 * @param {knex} db
 */
export async function up(db: knex) {
  await db.schema.table('users', table => {
    table.integer('unread_count').unsigned().notNullable().defaultTo(0)['after']('is_active');
  });

  await db.schema.table('guests', table => {
    table.integer('unread_count').unsigned().notNullable().defaultTo(0)['after']('email');
  });
}

/**
 * Rollback database schema changes
 * @param {knex} db
 */
export async function down(db: knex) {
  await db.schema.table('users', table => {
    table.dropColumn('unread_count');
  });

  await db.schema.table('guests', table => {
    table.dropColumn('unread_count');
  });
}
