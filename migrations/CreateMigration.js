exports.up = async function (knex) {
  await knex.schema.createTable("users", (table) => {
    table.string('id', 100).primary().notNullable();
    table.string("username", 100).nullable();
    table.string("email", 100).nullable();
    table.string("password", 100).nullable();
  });
};
