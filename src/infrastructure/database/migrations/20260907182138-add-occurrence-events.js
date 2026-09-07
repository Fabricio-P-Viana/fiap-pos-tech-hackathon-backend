export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("occurrence_events", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    occurrenceId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: { model: "occurrences", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    type: {
      allowNull: false,
      type: Sequelize.ENUM(
        "CREATED",
        "STATUS_CHANGED",
        "PRIORITY_CHANGED",
        "ASSIGNEE_CHANGED"
      ),
    },
    previousValue: {
      allowNull: true,
      type: Sequelize.STRING(60),
    },
    newValue: {
      allowNull: true,
      type: Sequelize.STRING(60),
    },
    note: {
      allowNull: true,
      type: Sequelize.STRING(500),
    },
    actorId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE,
    },
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("occurrence_events");
}
