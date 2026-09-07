import { CreateUserDTO } from "../../../../src/application/user/dtos/CreateUserDTO";
import { ValidationError } from "../../../../src/domain/errors/ValidationError";

describe("CreateUserDTO", () => {
  describe("create", () => {
    it("deve criar DTO quando dados válidos forem informados", () => {
      // Arrange
      const data = {
        name: " João Silva ",
        email: " joao@email.com ",
        password: "senha123",
      };

      // Act
      const dto = CreateUserDTO.create(data);

      // Assert
      expect(dto.name).toBe("João Silva");
      expect(dto.email).toBe("joao@email.com");
      expect(dto.password).toBe("senha123");
    });

    it("deve lançar erro quando name estiver ausente", () => {
      // Arrange
      const data = {
        email: "joao@email.com",
        password: "senha123",
      };

      // Act + Assert
      expect(() => CreateUserDTO.create(data)).toThrow(ValidationError);
    });

    it("deve lançar erro quando email estiver ausente", () => {
      // Arrange
      const data = {
        name: "João Silva",
        password: "senha123",
      };

      // Act + Assert
      expect(() => CreateUserDTO.create(data)).toThrow(ValidationError);
    });

    it("deve lançar erro quando password estiver ausente", () => {
      // Arrange
      const data = {
        name: "João Silva",
        email: "joao@email.com",
      };

      // Act + Assert
      expect(() => CreateUserDTO.create(data)).toThrow(ValidationError);
    });

    it("deve lançar erro quando name for string vazia", () => {
      // Arrange
      const data = {
        name: "   ",
        email: "joao@email.com",
        password: "senha123",
      };

      // Act + Assert
      expect(() => CreateUserDTO.create(data)).toThrow(
        "Name is required and must be a non-empty string",
      );
    });

    it("deve lançar erro quando email for string vazia", () => {
      // Arrange
      const data = {
        name: "João Silva",
        email: "   ",
        password: "senha123",
      };

      // Act + Assert
      expect(() => CreateUserDTO.create(data)).toThrow(
        "Email is required and must be a non-empty string",
      );
    });

    it("deve lançar erro quando password tiver menos de 6 caracteres", () => {
      // Arrange
      const data = {
        name: "João Silva",
        email: "joao@email.com",
        password: "123",
      };

      // Act + Assert
      expect(() => CreateUserDTO.create(data)).toThrow(
        "Password is required and must be at least 6 characters",
      );
    });

    it("deve lançar erro quando tipos forem inválidos", () => {
      // Arrange
      const data = {
        name: 123,
        email: true,
        password: "senha123",
      };

      // Act + Assert
      expect(() => CreateUserDTO.create(data)).toThrow(ValidationError);
    });
  });
});
