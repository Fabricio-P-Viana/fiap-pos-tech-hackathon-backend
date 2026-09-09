const categories = [
  {
    name: "Iluminação",
    description: "Problemas em lâmpadas, postes e iluminação das áreas comuns.",
  },
  {
    name: "Equipamentos",
    description: "Equipamentos quebrados ou com necessidade de manutenção.",
  },
  {
    name: "Acessibilidade",
    description: "Solicitações relacionadas à acessibilidade e inclusão.",
  },
  {
    name: "Limpeza",
    description: "Problemas de limpeza, conservação e descarte de resíduos.",
  },
  {
    name: "Vazamentos",
    description: "Vazamentos, infiltrações e problemas hidráulicos.",
  },
  {
    name: "Segurança",
    description: "Ocorrências relacionadas à segurança do local.",
  },
  {
    name: "Manutenção",
    description: "Solicitações gerais de manutenção predial.",
  },
  {
    name: "Outros",
    description: "Ocorrências que não se enquadram nas demais categorias.",
  },
];

export async function up(queryInterface, Sequelize) {
  const existingCategories = await queryInterface.sequelize.query(
    "SELECT name FROM categories WHERE name IN (:names)",
    {
      replacements: { names: categories.map((category) => category.name) },
      type: Sequelize.QueryTypes.SELECT,
    }
  );

  const existingNames = new Set(
    existingCategories.map((category) => category.name)
  );
  const now = new Date();
  const missingCategories = categories
    .filter((category) => !existingNames.has(category.name))
    .map((category) => ({
      ...category,
      active: true,
      createdAt: now,
      updatedAt: now,
    }));

  if (missingCategories.length > 0) {
    await queryInterface.bulkInsert("categories", missingCategories);
  }
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete("categories", {
    name: categories.map((category) => category.name),
  });
}
