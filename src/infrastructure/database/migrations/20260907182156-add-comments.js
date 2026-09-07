export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("comments", {
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
    authorId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    body: {
      allowNull: false,
      type: Sequelize.TEXT,
    },
    isInternal: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: false,
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
  await queryInterface.dropTable("comments");
}
