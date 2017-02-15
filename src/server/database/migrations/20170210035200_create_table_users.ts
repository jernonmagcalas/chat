import { knex } from 'chen/sql';

/**
 * Apply database schema changes
 * @param {knex} db
 */
export async function up(db: knex) {
  return db.schema.createTable('users', table => {
    table.increments('id');
    table.string('first_name');
    table.string('last_name');
    table.string('email').notNullable();
    table.string('password').nullable();
    table.string('profile_pic').nullable();
    table.boolean('is_active').notNullable().defaultTo(1);
    table.timestamps();

    table.unique(['email']);
  });
}

/**
 * Rollback database schema changes
 * @param {knex} db
 */
export async function down(db: knex) {
  return db.schema.dropTable('users');
}
