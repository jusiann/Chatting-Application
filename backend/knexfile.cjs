// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
require("dotenv").config();

module.exports = {
  development: {
    client: "pg",
    connection: {
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "chatapp123",
      database: process.env.DB_NAME || "chat_app",
      port: process.env.DB_PORT || 5432,
    },
    migrations: {
      directory: "./migrations",
    },
  },
};
