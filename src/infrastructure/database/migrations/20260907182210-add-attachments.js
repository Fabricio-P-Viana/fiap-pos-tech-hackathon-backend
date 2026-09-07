export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("attachments", {
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
    filePath: {
      allowNull: false,
      type: Sequelize.STRING(300),
    },
    mimeType: {
      allowNull: false,
      type: Sequelize.STRING(60),
    },
    sizeBytes: {
      allowNull: false,
      type: Sequelize.INTEGER,
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
  await queryInterface.dropTable("attachments");
}
