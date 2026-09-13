import swaggerJsdoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Blog API - FIAP Pos Tech",
    version: "1.0.0",
    description: "API REST para gerenciamento de posts de um blog",
  },
  tags: [
    { name: "User", description: "Operações relacionadas a usuários" },
    { name: "Auth", description: "Autenticação e login" },
    { name: "Category", description: "Gerenciamento de categorias" },
    { name: "Occurrence", description: "Gerenciamento de ocorrências" },
    { name: "Comment", description: "Comentários das ocorrências" },
    { name: "Attachment", description: "Anexos das ocorrências" },
    { name: "Rating", description: "Avaliações das ocorrências" },
  ],
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor do frontend",
    },
    {
      url: "http://localhost:3001",
      description: "Servidor do backend",
    },
    {
      url: "https://hackathon-backend-latest.onrender.com/",
      description: "Servidor de produção",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Fulano" },
          email: { type: "string", example: "fulano@mail.com" },
          role: { type: "string", example: "REQUESTER" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      UserInput: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", example: "Fulano" },
          email: { type: "string", example: "fulano@mail.com" },
          password: { type: "string", example: "senha123" },
        },
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "fulano@mail.com" },
          password: { type: "string", example: "senha123" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          token: { type: "string", example: "eyJhbGciOiJI..." },
        },
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          name: { type: "string", example: "Manutenção" },
          description: {
            type: "string",
            nullable: true,
            example: "Problemas prediais",
          },
          active: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CategoryInput: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "Manutenção" },
          description: { type: "string", example: "Problemas prediais" },
        },
      },
      CategoryUpdateInput: {
        type: "object",
        properties: {
          name: { type: "string", example: "Manutenção predial" },
          description: { type: "string" },
          active: { type: "boolean" },
        },
      },
      Occurrence: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          requesterId: { type: "integer", example: 2 },
          requesterName: { type: "string", nullable: true, example: "Ana Lima" },
          assigneeId: { type: "integer", nullable: true, example: 3 },
          assigneeName: {
            type: "string",
            nullable: true,
            example: "Carlos Souza",
          },
          categoryId: { type: "integer", example: 1 },
          categoryName: { type: "string", nullable: true, example: "Elétrica" },
          title: { type: "string", example: "Lâmpada queimada" },
          description: {
            type: "string",
            example: "Lâmpada do corredor apagada",
          },
          status: {
            type: "string",
            enum: [
              "OPEN",
              "IN_ANALYSIS",
              "IN_PROGRESS",
              "RESOLVED",
              "CANCELLED",
            ],
          },
          priority: {
            type: "string",
            enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
          },
          locationText: { type: "string", nullable: true },
          locationReference: { type: "string", nullable: true },
          latitude: { type: "number", nullable: true },
          longitude: { type: "number", nullable: true },
          resolution: { type: "string", nullable: true },
          cancellationReason: { type: "string", nullable: true },
          resolvedAt: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      OccurrenceInput: {
        type: "object",
        required: ["categoryId", "title", "description", "priority"],
        properties: {
          categoryId: { type: "integer", example: 1 },
          title: { type: "string", example: "Lâmpada queimada" },
          description: {
            type: "string",
            example: "Lâmpada do corredor apagada",
          },
          priority: {
            type: "string",
            enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
          },
          locationText: { type: "string" },
          locationReference: { type: "string" },
          latitude: { type: "number", minimum: -90, maximum: 90 },
          longitude: { type: "number", minimum: -180, maximum: 180 },
        },
      },
      OccurrenceUpdateInput: {
        allOf: [{ $ref: "#/components/schemas/OccurrenceInput" }],
      },
      OccurrenceStatusInput: {
        type: "object",
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: [
              "OPEN",
              "IN_ANALYSIS",
              "IN_PROGRESS",
              "RESOLVED",
              "CANCELLED",
            ],
          },
          note: { type: "string" },
        },
      },
      OccurrenceEvent: {
        type: "object",
        properties: {
          id: { type: "integer" },
          occurrenceId: { type: "integer" },
          type: {
            type: "string",
            enum: [
              "CREATED",
              "STATUS_CHANGED",
              "PRIORITY_CHANGED",
              "ASSIGNEE_CHANGED",
            ],
          },
          occurrenceTitle: { type: "string", nullable: true },
          previousValue: { type: "string", nullable: true },
          newValue: { type: "string", nullable: true },
          previousLabel: {
            type: "string",
            nullable: true,
            description:
              "previousValue legível (ids de usuário resolvidos em nome)",
          },
          newLabel: {
            type: "string",
            nullable: true,
            description: "newValue legível (ids de usuário resolvidos em nome)",
          },
          note: { type: "string", nullable: true },
          actorId: { type: "integer" },
          actorName: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Comment: {
        type: "object",
        properties: {
          id: { type: "integer" },
          occurrenceId: { type: "integer" },
          authorId: { type: "integer" },
          authorName: { type: "string", nullable: true },
          body: { type: "string" },
          isInternal: { type: "boolean" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CommentInput: {
        type: "object",
        required: ["occurrenceId", "body"],
        properties: {
          occurrenceId: { type: "integer" },
          body: { type: "string" },
          isInternal: { type: "boolean" },
        },
      },
      Attachment: {
        type: "object",
        properties: {
          id: { type: "integer" },
          occurrenceId: { type: "integer" },
          filePath: { type: "string" },
          mimeType: { type: "string" },
          sizeBytes: { type: "integer" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      AttachmentInput: {
        type: "object",
        required: ["occurrenceId", "filePath", "mimeType", "sizeBytes"],
        properties: {
          occurrenceId: { type: "integer" },
          filePath: { type: "string" },
          mimeType: { type: "string" },
          sizeBytes: { type: "integer", minimum: 1 },
        },
      },
      Rating: {
        type: "object",
        properties: {
          id: { type: "integer" },
          occurrenceId: { type: "integer" },
          authorId: { type: "integer" },
          score: { type: "integer", minimum: 1, maximum: 5 },
          comment: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      RatingInput: {
        type: "object",
        required: ["occurrenceId", "score"],
        properties: {
          occurrenceId: { type: "integer" },
          score: { type: "integer", minimum: 1, maximum: 5 },
          comment: { type: "string" },
        },
      },
    },
  },
};

const options: swaggerJsdoc.Options = {
  swaggerDefinition,
  apis: ["./src/interface-adapters/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
