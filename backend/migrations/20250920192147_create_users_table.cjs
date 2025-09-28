exports.up = async function (knex) {
  await knex.schema.createTable("users", (table) => {
    table.increments("id").primary(); // SERIAL PRIMARY KEY
    table.string("first_name", 50).notNullable();
    table.string("last_name", 50).notNullable();
    table.string("email", 100).notNullable().unique();
    table.string("password", 256).notNullable();
    table.string("title", 100);
    table.string("department", 100);
    table.text("profile_pic");
    table.string("profile_pic_id", 100);
    table.string("reset_code", 32);
    table.timestamp("reset_time");
    table.integer("failed_login_attempts").defaultTo(0);
    table.timestamp("last_failed_login");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("last_seen");
    table.boolean("is_online").defaultTo(false);
  });

  await knex.schema.raw(
    "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);"
  );
  await knex.schema.raw(
    "CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);"
  );
  await knex.schema.raw(
    "CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);"
  );

  await knex.schema.createTable("messages", (table) => {
    table.increments("id").primary(); // SERIAL PRIMARY KEY
    table
      .integer("sender_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table
      .integer("receiver_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.text("content");
    table.string("status", 20).defaultTo("sent");
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.timestamp("delivered_at");
    table.timestamp("read_at");
    table.text("file_key");
    table.text("file_type");

    // Eğer isimlendirilmiş constraint istersen:
    table
      .foreign("sender_id", "fk_sender")
      .references("users.id")
      .onDelete("CASCADE");
    table
      .foreign("receiver_id", "fk_receiver")
      .references("users.id")
      .onDelete("CASCADE");
  });
  // index ekleme
  await knex.schema.raw(
    "CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id)"
  );
  await knex.schema.raw(
    "CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id)"
  );
  await knex.schema.raw(
    "CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at)"
  );

  await knex.schema.createTable("notifications", (table) => {
    table.increments("id").primary(); // SERIAL PRIMARY KEY

    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table
      .integer("sender_id")
      .unsigned()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");

    table.string("type", 50).notNullable();
    table.text("content").notNullable();
    table.jsonb("data").defaultTo("{}");
    table.boolean("is_read").defaultTo(false);
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("read_at");

    // Indexleri ekleme
    table.index("user_id", "idx_notifications_user_id");
    table.index("created_at", "idx_notifications_created_at");
    table.index("is_read", "idx_notifications_is_read");
  });

  await knex.schema.createTable("groups", (table) => {
    table.increments("id").primary(); // SERIAL PRIMARY KEY
    table.string("name", 100).notNullable();
    table.text("description");
    table
      .integer("created_by")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");
    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());

    // Indexler
    table.index("name", "idx_groups_name");
    table.index("created_by", "idx_groups_created_by");
    table.index("created_at", "idx_groups_created_at");
  });
  await knex.schema.createTable("group_members", (table) => {
    table.increments("id").primary(); // SERIAL PRIMARY KEY

    table
      .integer("group_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("groups")
      .onDelete("CASCADE");

    table
      .integer("user_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table.timestamp("joined_at").defaultTo(knex.fn.now());
    table.string("role", 20).notNullable().defaultTo("member");
    table.bigInteger("last_read_message_id");
    table.timestamp("last_read_at");
    table.integer("unread_count").notNullable().defaultTo(0);

    // Indexler
    table.index("group_id", "idx_group_members_group_id");
    table.index("user_id", "idx_group_members_user_id");
    table.index("role", "idx_group_members_role");
  });
  await knex.schema.createTable("group_messages", (table) => {
    table.increments("id").primary(); // SERIAL PRIMARY KEY

    table
      .integer("group_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("groups")
      .onDelete("CASCADE");

    table
      .integer("sender_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("users")
      .onDelete("CASCADE");

    table.text("content").notNullable();
    table.string("status", 20).defaultTo("sent");
    table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
    table.text("file_key");
    table.text("file_type");

    // Indexler
    table.index("group_id", "idx_group_messages_group_id");
    table.index("sender_id", "idx_group_messages_sender_id");
    table.index("created_at", "idx_group_messages_created_at");
    table.index(["group_id", "id"], "idx_messages_group_id_id");
  });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("group_messages")
    .dropTableIfExists("group_members")
    .dropTableIfExists("groups")
    .dropTableIfExists("notifications")
    .dropTableIfExists("messages")
    .dropTableIfExists("users");
};
