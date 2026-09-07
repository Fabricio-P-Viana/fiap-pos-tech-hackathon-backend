export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("occurrences", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    requesterId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    assigneeId: {
      allowNull: true,
      type: Sequelize.INTEGER,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    },
    categoryId: {
      allowNull: false,
      type: Sequelize.INTEGER,
      references: { model: "categories", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    title: {
      allowNull: false,
      type: Sequelize.STRING(120),
    },
    description: {
      allowNull: false,
      type: Sequelize.TEXT,
    },
    status: {
      allowNull: false,
      type: Sequelize.ENUM(
        "OPEN",
        "IN_ANALYSIS",
        "IN_PROGRESS",
        "RESOLVED",
        "CANCELLED"
      ),
    },
    priority: {
      allowNull: false,
      type: Sequelize.ENUM("LOW", "MEDIUM", "HIGH", "CRITICAL"),
    },
    locationText: {
      allowNull: true,
      type: Sequelize.STRING(160),
    },
    locationReference: {
      allowNull: true,
      type: Sequelize.STRING(160),
    },
    latitude: {
      allowNull: true,
      type: Sequelize.DOUBLE,
    },
    longitude: {
      allowNull: true,
      type: Sequelize.DOUBLE,
    },
    resolution: {
      allowNull: true,
      type: Sequelize.TEXT,
    },
    resolvedAt: {
      allowNull: true,
      type: Sequelize.DATE,
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
  await queryInterface.dropTable("occurrences");
}
