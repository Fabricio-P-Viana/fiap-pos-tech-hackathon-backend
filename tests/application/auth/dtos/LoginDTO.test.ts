import { LoginDTO } from "../../../../src/application/auth/dtos/LoginDTO";
import { ValidationError } from "../../../../src/domain/errors/ValidationError";

describe("LoginDTO", () => {
  describe("create", () => {
    it("deve criar DTO quando dados válidos forem informados", () => {
      // Arrange
      const data = {
        email: " joao@email.com ",
        password: "senha123",
      };

      // Act
      const dto = LoginDTO.create(data);

      // Assert
      expect(dto.email).toBe("joao@email.com");
      expect(dto.password).toBe("senha123");
    });

    it("deve lançar erro quando email estiver ausente", () => {
      // Arrange
      const data = {
        password: "senha123",
      };

      // Act + Assert
      expect(() => LoginDTO.create(data)).toThrow(ValidationError);
    });

    it("deve lançar erro quando password estiver ausente", () => {
      // Arrange
      const data = {
        email: "joao@email.com",
      };

      // Act + Assert
      expect(() => LoginDTO.create(data)).toThrow(ValidationError);
    });

    it("deve lançar erro quando email for string vazia", () => {
      // Arrange
      const data = {
        email: "   ",
        password: "senha123",
      };

      // Act + Assert
      expect(() => LoginDTO.create(data)).toThrow(
        "Email is required and must be a non-empty string",
      );
    });

    it("deve lançar erro quando password tiver menos de 6 caracteres", () => {
      // Arrange
      const data = {
        email: "joao@email.com",
        password: "123",
      };

      // Act + Assert
      expect(() => LoginDTO.create(data)).toThrow(
        "Password is required and must be at least 6 characters",
      );
    });

    it("deve lançar erro quando tipos forem inválidos", () => {
      // Arrange
      const data = {
        email: 123,
        password: true,
      };

      // Act + Assert
      expect(() => LoginDTO.create(data)).toThrow(ValidationError);
    });
  });
});
