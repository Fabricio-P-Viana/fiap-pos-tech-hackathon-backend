import bcrypt from "bcrypt";

const SEED_PASSWORD = "senha123";
const SALT_ROUNDS = 10;

const seedUsers = [
  {
    name: "Carla Mendes",
    email: "carla.gestora@resolveai.test",
    role: "MANAGER",
  },
  {
    name: "Rafael Souza",
    email: "rafael.gestor@resolveai.test",
    role: "MANAGER",
  },
  {
    name: "Juliana Prado",
    email: "juliana.gestora@resolveai.test",
    role: "MANAGER",
  },
  { name: "Ana Lima", email: "ana.lima@resolveai.test", role: "REQUESTER" },
  {
    name: "Bruno Costa",
    email: "bruno.costa@resolveai.test",
    role: "REQUESTER",
  },
  {
    name: "Fernanda Rocha",
    email: "fernanda.rocha@resolveai.test",
    role: "REQUESTER",
  },
  {
    name: "Diego Martins",
    email: "diego.martins@resolveai.test",
    role: "REQUESTER",
  },
  {
    name: "Patrícia Alves",
    email: "patricia.alves@resolveai.test",
    role: "REQUESTER",
  },
];

export async function up(queryInterface, Sequelize) {
  const existingUsers = await queryInterface.sequelize.query(
    "SELECT email FROM users WHERE email IN (:emails)",
    {
      replacements: { emails: seedUsers.map((user) => user.email) },
      type: Sequelize.QueryTypes.SELECT,
    }
  );

  const existingEmails = new Set(existingUsers.map((user) => user.email));
  const missingUsers = seedUsers.filter(
    (user) => !existingEmails.has(user.email)
  );

  if (missingUsers.length === 0) return;

  const password = await bcrypt.hash(SEED_PASSWORD, SALT_ROUNDS);
  const now = new Date();

  await queryInterface.bulkInsert(
    "users",
    missingUsers.map((user) => ({
      ...user,
      password,
      createdAt: now,
      updatedAt: now,
    }))
  );
}

export async function down(queryInterface) {
  await queryInterface.bulkDelete("users", {
    email: seedUsers.map((user) => user.email),
  });
}
