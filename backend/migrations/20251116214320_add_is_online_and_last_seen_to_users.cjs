
exports.up = function(knex) {
  return knex.schema.table('users', (table) => {
    table.boolean('is_online').defaultTo(false);
    table.timestamp('last_seen').nullable();
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('is_online');
    table.dropColumn('last_seen');
  });
};
