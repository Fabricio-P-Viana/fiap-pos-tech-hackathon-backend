export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("ratings", {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: Sequelize.INTEGER,
    },
    occurrenceId: {
      allowNull: false,
      unique: true,
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
    score: {
      allowNull: false,
      type: Sequelize.SMALLINT,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      allowNull: true,
      type: Sequelize.STRING(500),
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

  await queryInterface.addConstraint("ratings", {
    fields: ["score"],
    type: "check",
    where: {
      score: {
        [Sequelize.Op.between]: [1, 5],
      },
    },
    name: "ck_ratings_score",
  });
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable("ratings");
}
