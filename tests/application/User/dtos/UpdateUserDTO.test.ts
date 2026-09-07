import { UpdateUserDTO } from "../../../../src/application/user/dtos/UpdateUserDTO";
import { ValidationError } from "../../../../src/domain/errors/ValidationError";

describe("UpdateUserDTO", () => {
  describe("create", () => {
    it("deve criar DTO somente com name", () => {
      // Arrange
      const data = { name: " Novo Nome " };

      // Act
      const dto = UpdateUserDTO.create(data);

      // Assert
      expect(dto.name).toBe("Novo Nome");
      expect(dto.email).toBeUndefined();
      expect(dto.password).toBeUndefined();
    });

    it("deve criar DTO somente com email", () => {
      // Arrange
      const data = { email: " novo@email.com " };

      // Act
      const dto = UpdateUserDTO.create(data);

      // Assert
      expect(dto.email).toBe("novo@email.com");
      expect(dto.name).toBeUndefined();
      expect(dto.password).toBeUndefined();
    });

    it("deve criar DTO somente com password", () => {
      // Arrange
      const data = { password: "novaSenha123" };

      // Act
      const dto = UpdateUserDTO.create(data);

      // Assert
      expect(dto.password).toBe("novaSenha123");
      expect(dto.name).toBeUndefined();
      expect(dto.email).toBeUndefined();
    });

    it("deve criar DTO com todos os campos", () => {
      // Arrange
      const data = {
        name: " João Atualizado ",
        email: " atualizado@email.com ",
        password: "novaSenha123",
      };

      // Act
      const dto = UpdateUserDTO.create(data);

      // Assert
      expect(dto.name).toBe("João Atualizado");
      expect(dto.email).toBe("atualizado@email.com");
      expect(dto.password).toBe("novaSenha123");
    });

    it("deve lançar erro quando nenhum campo for fornecido", () => {
      // Arrange
      const data = {};

      // Act + Assert
      expect(() => UpdateUserDTO.create(data)).toThrow(
        "At least one field (name, email or password) must be provided",
      );
    });

    it("deve lançar erro quando name for string vazia", () => {
      // Arrange
      const data = { name: "   " };

      // Act + Assert
      expect(() => UpdateUserDTO.create(data)).toThrow(
        "Name must be a non-empty string",
      );
    });

    it("deve lançar erro quando email for string vazia", () => {
      // Arrange
      const data = { email: "   " };

      // Act + Assert
      expect(() => UpdateUserDTO.create(data)).toThrow(
        "Email must be a non-empty string",
      );
    });

    it("deve lançar erro quando password tiver menos de 6 caracteres", () => {
      // Arrange
      const data = { password: "123" };

      // Act + Assert
      expect(() => UpdateUserDTO.create(data)).toThrow(
        "Password must be at least 6 characters",
      );
    });

    it("deve lançar erro quando name for tipo inválido", () => {
      // Arrange
      const data = { name: 42 };

      // Act + Assert
      expect(() => UpdateUserDTO.create(data)).toThrow(ValidationError);
    });
  });
});
