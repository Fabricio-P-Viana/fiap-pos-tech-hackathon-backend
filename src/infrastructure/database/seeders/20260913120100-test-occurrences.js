const HOUR_MS = 60 * 60 * 1000;

const CARLA = "carla.gestora@resolveai.test";
const RAFAEL = "rafael.gestor@resolveai.test";
const JULIANA = "juliana.gestora@resolveai.test";
const ANA = "ana.lima@resolveai.test";
const BRUNO = "bruno.costa@resolveai.test";
const FERNANDA = "fernanda.rocha@resolveai.test";
const DIEGO = "diego.martins@resolveai.test";
const PATRICIA = "patricia.alves@resolveai.test";

const SEED_EMAILS = [CARLA, RAFAEL, JULIANA, ANA, BRUNO, FERNANDA, DIEGO, PATRICIA];

const scenarios = [
  {
    requester: ANA,
    category: "Iluminação",
    title: "Lâmpadas queimadas no corredor do bloco B",
    description:
      "Três lâmpadas do corredor do 2º andar do bloco B estão queimadas e o trecho fica totalmente escuro à noite.",
    priority: "HIGH",
    locationText: "Bloco B, 2º andar",
    locationReference: "Próximo à escada de emergência",
    openedHoursAgo: 26,
  },
  {
    requester: BRUNO,
    category: "Vazamentos",
    title: "Vazamento de água na garagem G2",
    description:
      "Há um vazamento forte vindo do teto da garagem G2, com água acumulando perto das vagas 40 a 45.",
    priority: "CRITICAL",
    locationText: "Garagem G2",
    locationReference: "Vagas 40 a 45",
    openedHoursAgo: 3,
  },
  {
    requester: FERNANDA,
    category: "Limpeza",
    title: "Lixeira do térreo sem coleta",
    description:
      "A lixeira de recicláveis do térreo não é recolhida há dois dias e já está transbordando.",
    priority: "LOW",
    locationText: "Térreo, área de descarte",
    openedHoursAgo: 50,
  },
  {
    requester: DIEGO,
    category: "Equipamentos",
    title: "Portão da garagem travando",
    description:
      "O portão automático da garagem trava no meio do curso e precisa ser empurrado manualmente para fechar.",
    priority: "MEDIUM",
    locationText: "Portão principal da garagem",
    openedHoursAgo: 96,
    assignee: CARLA,
    assignedAfterHours: 5,
    comments: [
      {
        author: CARLA,
        afterHours: 6,
        body: "Recebido. Vou verificar o motor do portão amanhã pela manhã.",
      },
      {
        author: DIEGO,
        afterHours: 20,
        body: "Obrigado! Ele trava principalmente no período da noite.",
      },
    ],
  },
  {
    requester: PATRICIA,
    category: "Acessibilidade",
    title: "Rampa de acesso com piso solto",
    description:
      "O piso emborrachado da rampa de acesso da entrada lateral está solto e pode causar quedas de cadeirantes.",
    priority: "HIGH",
    locationText: "Entrada lateral",
    openedHoursAgo: 120,
    assignee: RAFAEL,
    assignedBy: JULIANA,
    assignedAfterHours: 2,
    steps: [
      {
        status: "IN_ANALYSIS",
        afterHours: 8,
        note: "Solicitei ao zelador fotos do trecho afetado.",
      },
    ],
  },
  {
    requester: ANA,
    category: "Segurança",
    title: "Câmera da portaria sem imagem",
    description:
      "As câmeras 2 e 3 do monitor da portaria estão sem imagem desde o fim de semana.",
    priority: "HIGH",
    locationText: "Portaria principal",
    openedHoursAgo: 144,
    assignee: CARLA,
    assignedAfterHours: 1,
    steps: [
      { status: "IN_ANALYSIS", afterHours: 3 },
      {
        status: "IN_PROGRESS",
        afterHours: 30,
        note: "Técnico da empresa de segurança agendado.",
      },
    ],
    priorityChange: { to: "CRITICAL", afterHours: 10 },
    comments: [
      {
        author: CARLA,
        afterHours: 12,
        internal: true,
        body: "O contrato de manutenção cobre a troca do DVR.",
      },
      {
        author: ANA,
        afterHours: 40,
        body: "A portaria continua sem imagem das câmeras 2 e 3.",
      },
    ],
  },
  {
    requester: BRUNO,
    category: "Manutenção",
    title: "Infiltração no teto da sala de reuniões",
    description:
      "Uma mancha de infiltração apareceu no teto da sala de reuniões e está aumentando a cada chuva.",
    priority: "MEDIUM",
    locationText: "Sala de reuniões do térreo",
    openedHoursAgo: 216,
    assignee: JULIANA,
    assignedAfterHours: 4,
    steps: [
      { status: "IN_ANALYSIS", afterHours: 6 },
      {
        status: "IN_PROGRESS",
        afterHours: 48,
        note: "Impermeabilização da laje contratada.",
      },
    ],
    comments: [
      {
        author: BRUNO,
        afterHours: 100,
        body: "A mancha aumentou depois da chuva de ontem.",
      },
      {
        author: JULIANA,
        afterHours: 110,
        body: "A equipe de impermeabilização começa na segunda-feira.",
      },
    ],
  },
  {
    requester: FERNANDA,
    category: "Equipamentos",
    title: "Interfone do apartamento 302 com chiado",
    description:
      "O interfone do apartamento 302 tem um chiado constante que impede entender o que a portaria fala.",
    priority: "LOW",
    locationText: "Bloco A, apartamento 302",
    openedHoursAgo: 288,
    assignee: RAFAEL,
    assignedAfterHours: 24,
    steps: [
      { status: "IN_ANALYSIS", afterHours: 30 },
      { status: "IN_PROGRESS", afterHours: 72 },
    ],
  },
  {
    requester: DIEGO,
    category: "Iluminação",
    title: "Poste apagado na entrada principal",
    description:
      "O poste ao lado da guarita da entrada principal está apagado há três noites.",
    priority: "MEDIUM",
    locationText: "Entrada principal",
    locationReference: "Ao lado da guarita",
    openedHoursAgo: 480,
    assignee: CARLA,
    assignedAfterHours: 2,
    steps: [
      { status: "IN_ANALYSIS", afterHours: 4 },
      { status: "IN_PROGRESS", afterHours: 20 },
      {
        status: "RESOLVED",
        afterHours: 48,
        note: "Reator do poste substituído e iluminação normalizada.",
      },
    ],
    rating: { score: 5, afterHours: 60, comment: "Resolveram rápido, obrigado!" },
  },
  {
    requester: PATRICIA,
    category: "Limpeza",
    title: "Manchas de óleo no estacionamento",
    description:
      "Há manchas grandes de óleo nas vagas de visitantes, deixando o piso escorregadio.",
    priority: "LOW",
    locationText: "Estacionamento de visitantes",
    openedHoursAgo: 432,
    assignee: JULIANA,
    assignedAfterHours: 6,
    steps: [
      { status: "IN_ANALYSIS", afterHours: 10 },
      { status: "IN_PROGRESS", afterHours: 26 },
      {
        status: "RESOLVED",
        afterHours: 72,
        note: "Limpeza com desengraxante realizada em todas as vagas.",
      },
    ],
    rating: {
      score: 4,
      afterHours: 90,
      comment: "Ficou bom, só demorou um pouco para começar.",
    },
  },
  {
    requester: ANA,
    category: "Vazamentos",
    title: "Torneira do jardim vazando",
    description:
      "A torneira próxima ao playground não fecha totalmente e está desperdiçando muita água.",
    priority: "HIGH",
    locationText: "Jardim, perto do playground",
    openedHoursAgo: 600,
    assignee: RAFAEL,
    assignedAfterHours: 30,
    steps: [
      { status: "IN_ANALYSIS", afterHours: 40 },
      { status: "IN_PROGRESS", afterHours: 100 },
      {
        status: "RESOLVED",
        afterHours: 150,
        note: "Registro e torneira substituídos.",
      },
    ],
    comments: [
      {
        author: ANA,
        afterHours: 80,
        body: "Continua vazando e já alagou parte do jardim.",
      },
    ],
    rating: {
      score: 2,
      afterHours: 170,
      comment: "O conserto demorou quase uma semana.",
    },
  },
  {
    requester: BRUNO,
    category: "Equipamentos",
    title: "Elevador social parando entre andares",
    description:
      "O elevador social do bloco A parou duas vezes entre o 5º e o 6º andar nesta semana.",
    priority: "MEDIUM",
    locationText: "Bloco A, elevador social",
    openedHoursAgo: 192,
    assignee: CARLA,
    assignedAfterHours: 1,
    steps: [
      { status: "IN_ANALYSIS", afterHours: 2 },
      { status: "IN_PROGRESS", afterHours: 5 },
      {
        status: "RESOLVED",
        afterHours: 40,
        note: "Sensor de porta ajustado pela assistência técnica.",
      },
    ],
    comments: [
      {
        author: CARLA,
        afterHours: 10,
        internal: true,
        body: "Chamado aberto na fabricante, protocolo 48213.",
      },
    ],
  },
  {
    requester: FERNANDA,
    category: "Acessibilidade",
    title: "Elevador de acessibilidade fora de operação",
    description:
      "A plataforma elevatória de acesso ao salão de festas não liga, impedindo o acesso de cadeirantes.",
    priority: "CRITICAL",
    locationText: "Salão de festas",
    openedHoursAgo: 720,
    assignee: JULIANA,
    assignedAfterHours: 1,
    steps: [
      { status: "IN_ANALYSIS", afterHours: 2 },
      { status: "IN_PROGRESS", afterHours: 4 },
      {
        status: "RESOLVED",
        afterHours: 30,
        note: "Placa de comando substituída; plataforma liberada e testada.",
      },
    ],
    rating: {
      score: 5,
      afterHours: 40,
      comment: "Atendimento excelente e muito ágil.",
    },
  },
  {
    requester: DIEGO,
    category: "Outros",
    title: "Barulho na área de lazer",
    description:
      "Barulho alto vindo da área de lazer depois das 23h durante a semana.",
    priority: "LOW",
    locationText: "Área de lazer",
    openedHoursAgo: 240,
    steps: [
      {
        status: "CANCELLED",
        afterHours: 20,
        byRequester: true,
        note: "O barulho era de uma festa pontual e já foi resolvido com os vizinhos.",
      },
    ],
  },
  {
    requester: PATRICIA,
    category: "Manutenção",
    title: "Pintura descascando na fachada",
    description:
      "A pintura da fachada do bloco C está descascando em vários pontos próximos às janelas.",
    priority: "MEDIUM",
    locationText: "Fachada do bloco C",
    openedHoursAgo: 360,
    assignee: RAFAEL,
    assignedAfterHours: 10,
    steps: [
      { status: "IN_ANALYSIS", afterHours: 20 },
      {
        status: "CANCELLED",
        afterHours: 50,
        note: "A pintura da fachada já está prevista na reforma geral aprovada em assembleia.",
      },
    ],
  },
  {
    requester: ANA,
    category: "Segurança",
    title: "Cerca elétrica disparando sem motivo",
    description:
      "A cerca elétrica dispara o alarme várias vezes durante a madrugada sem nenhuma invasão.",
    priority: "MEDIUM",
    locationText: "Muro dos fundos",
    openedHoursAgo: 960,
    assignee: RAFAEL,
    assignedAfterHours: 12,
    steps: [
      { status: "IN_ANALYSIS", afterHours: 20 },
      { status: "IN_PROGRESS", afterHours: 48 },
      {
        status: "RESOLVED",
        afterHours: 120,
        note: "Sensor da cerca recalibrado e fiação revisada.",
      },
    ],
    priorityChange: { to: "HIGH", afterHours: 22 },
    rating: {
      score: 3,
      afterHours: 140,
      comment: "Resolveu, mas precisei cobrar duas vezes.",
    },
  },
];

function buildOccurrence(scenario, ids, now) {
  const openedAt = new Date(now.getTime() - scenario.openedHoursAgo * HOUR_MS);
  const latestAllowed = now.getTime() - 60 * 1000;
  const stamp = (hours) =>
    new Date(Math.min(openedAt.getTime() + hours * HOUR_MS, latestAllowed));

  const requesterId = ids.user(scenario.requester);
  const assigneeId = scenario.assignee ? ids.user(scenario.assignee) : null;

  const events = [
    {
      type: "CREATED",
      actorId: requesterId,
      previousValue: null,
      newValue: "OPEN",
      note: null,
      createdAt: stamp(0),
    },
  ];

  if (assigneeId) {
    events.push({
      type: "ASSIGNEE_CHANGED",
      actorId: ids.user(scenario.assignedBy ?? scenario.assignee),
      previousValue: null,
      newValue: String(assigneeId),
      note: null,
      createdAt: stamp(scenario.assignedAfterHours),
    });
  }

  let priority = scenario.priority;
  if (scenario.priorityChange) {
    events.push({
      type: "PRIORITY_CHANGED",
      actorId: assigneeId,
      previousValue: scenario.priority,
      newValue: scenario.priorityChange.to,
      note: null,
      createdAt: stamp(scenario.priorityChange.afterHours),
    });
    priority = scenario.priorityChange.to;
  }

  let status = "OPEN";
  let resolution = null;
  let resolvedAt = null;
  let cancellationReason = null;

  for (const step of scenario.steps ?? []) {
    events.push({
      type: "STATUS_CHANGED",
      actorId: step.byRequester ? requesterId : assigneeId,
      previousValue: status,
      newValue: step.status,
      note: step.note ?? null,
      createdAt: stamp(step.afterHours),
    });
    if (step.status === "RESOLVED") {
      resolution = step.note;
      resolvedAt = stamp(step.afterHours);
    }
    if (step.status === "CANCELLED") {
      cancellationReason = step.note;
    }
    status = step.status;
  }

  const comments = (scenario.comments ?? []).map((comment) => ({
    authorId: ids.user(comment.author),
    body: comment.body,
    isInternal: Boolean(comment.internal),
    createdAt: stamp(comment.afterHours),
  }));

  const rating = scenario.rating
    ? {
        authorId: requesterId,
        score: scenario.rating.score,
        comment: scenario.rating.comment ?? null,
        createdAt: stamp(scenario.rating.afterHours),
      }
    : null;

  const timestamps = [
    ...events.map((event) => event.createdAt),
    ...comments.map((comment) => comment.createdAt),
  ];
  const updatedAt = new Date(
    Math.max(...timestamps.map((date) => date.getTime()))
  );

  return {
    row: {
      requesterId,
      assigneeId,
      categoryId: ids.category(scenario.category),
      title: scenario.title,
      description: scenario.description,
      status,
      priority,
      locationText: scenario.locationText ?? null,
      locationReference: scenario.locationReference ?? null,
      latitude: null,
      longitude: null,
      resolution,
      cancellationReason,
      resolvedAt,
      createdAt: openedAt,
      updatedAt,
    },
    events: events.sort((a, b) => a.createdAt - b.createdAt),
    comments,
    rating,
  };
}

async function loadIds(queryInterface, Sequelize, transaction) {
  const users = await queryInterface.sequelize.query(
    "SELECT id, email FROM users WHERE email IN (:emails)",
    {
      replacements: { emails: SEED_EMAILS },
      type: Sequelize.QueryTypes.SELECT,
      transaction,
    }
  );
  const categoryNames = [...new Set(scenarios.map((s) => s.category))];
  const categories = await queryInterface.sequelize.query(
    "SELECT id, name FROM categories WHERE name IN (:names)",
    {
      replacements: { names: categoryNames },
      type: Sequelize.QueryTypes.SELECT,
      transaction,
    }
  );

  const userIdByEmail = new Map(users.map((user) => [user.email, user.id]));
  const categoryIdByName = new Map(
    categories.map((category) => [category.name, category.id])
  );

  const missingUsers = SEED_EMAILS.filter((email) => !userIdByEmail.has(email));
  if (missingUsers.length > 0) {
    throw new Error(
      `Usuários de teste ausentes (${missingUsers.join(", ")}). Rode o seeder 20260913120000-test-users antes.`
    );
  }
  const missingCategories = categoryNames.filter(
    (name) => !categoryIdByName.has(name)
  );
  if (missingCategories.length > 0) {
    throw new Error(
      `Categorias ausentes (${missingCategories.join(", ")}). Rode o seeder 20260909120000-base-categories antes.`
    );
  }

  return {
    user: (email) => userIdByEmail.get(email),
    category: (name) => categoryIdByName.get(name),
    requesterIds: [...new Set(scenarios.map((s) => userIdByEmail.get(s.requester)))],
  };
}

export async function up(queryInterface, Sequelize) {
  await queryInterface.sequelize.transaction(async (transaction) => {
    const ids = await loadIds(queryInterface, Sequelize, transaction);

    const [{ total }] = await queryInterface.sequelize.query(
      'SELECT COUNT(*)::int AS total FROM occurrences WHERE "requesterId" IN (:ids)',
      {
        replacements: { ids: ids.requesterIds },
        type: Sequelize.QueryTypes.SELECT,
        transaction,
      }
    );
    if (total > 0) return;

    const now = new Date();

    for (const scenario of scenarios) {
      const { row, events, comments, rating } = buildOccurrence(
        scenario,
        ids,
        now
      );

      const [created] = await queryInterface.bulkInsert("occurrences", [row], {
        returning: ["id"],
        transaction,
      });
      const occurrenceId = created.id;

      await queryInterface.bulkInsert(
        "occurrence_events",
        events.map((event) => ({
          ...event,
          occurrenceId,
          updatedAt: event.createdAt,
        })),
        { transaction }
      );

      if (comments.length > 0) {
        await queryInterface.bulkInsert(
          "comments",
          comments.map((comment) => ({
            ...comment,
            occurrenceId,
            updatedAt: comment.createdAt,
          })),
          { transaction }
        );
      }

      if (rating) {
        await queryInterface.bulkInsert(
          "ratings",
          [{ ...rating, occurrenceId, updatedAt: rating.createdAt }],
          { transaction }
        );
      }
    }
  });
}

export async function down(queryInterface, Sequelize) {
  const requesters = await queryInterface.sequelize.query(
    "SELECT id FROM users WHERE email IN (:emails)",
    {
      replacements: { emails: SEED_EMAILS },
      type: Sequelize.QueryTypes.SELECT,
    }
  );
  if (requesters.length === 0) return;

  await queryInterface.bulkDelete("occurrences", {
    requesterId: requesters.map((user) => user.id),
  });
}
