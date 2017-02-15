import { knex } from 'chen/sql';

/**
 * Apply database schema changes
 * @param {knex} db
 */
export async function up(db: knex) {
  return db.schema.createTable('access_tokens', table => {
    table.increments('id');
    table.string('token').notNullable();
    table.integer('user_id').unsigned();
    table.integer('app_id').unsigned().notNullable();
    table.string('scope', 500);
    table.dateTime('expiration');
    table.boolean('active').defaultTo(1).notNullable();
    table.timestamps();

    table.unique(['token']);
    table.index(['active']);
    table.foreign('user_id').references('id').inTable('users');
    table.foreign('app_id').references('id').inTable('apps');
  });
}

/**
 * Rollback database schema changes
 * @param {knex} db
 */
export async function down(db: knex) {
  return db.schema.dropTable('access_tokens');
}
