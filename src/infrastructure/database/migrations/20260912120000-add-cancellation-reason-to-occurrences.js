export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn("occurrences", "cancellationReason", {
    allowNull: true,
    type: Sequelize.TEXT,
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn("occurrences", "cancellationReason");
}
