export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("categories", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    name: {
      allowNull: false,
      unique: true,
      type: Sequelize.STRING(60),
    },
    description: {
      allowNull: true,
      type: Sequelize.STRING(240),
    },
    active: {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: true,
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
  await queryInterface.dropTable("categories");
}
