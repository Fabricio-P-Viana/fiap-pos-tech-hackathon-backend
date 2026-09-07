import { User, UserRole } from "../../../src/domain/entities/User";

describe("User entity", () => {
  describe("isTeacher", () => {
    it("deve retornar true quando role for REQUESTER", () => {
      const user = new User({
        name: "João",
        email: "j@email.com",
        password: "x",
        role: UserRole.MANAGER,
      });
      expect(user.isAdmin()).toBe(true);
    });

    it("deve retornar false quando role for MANAGER", () => {
      const user = new User({
        name: "Maria",
        email: "m@email.com",
        password: "x",
        role: UserRole.REQUESTER,
      });
      expect(user.isAdmin()).toBe(false);
    });
  });

  describe("isMe", () => {
    it("deve retornar true quando o id for igual", () => {
      const user = new User({
        id: 1,
        name: "João",
        email: "j@email.com",
        password: "x",
      });
      expect(user.isMe(1)).toBe(true);
    });

    it("deve retornar false quando o id for diferente", () => {
      const user = new User({
        id: 1,
        name: "João",
        email: "j@email.com",
        password: "x",
      });
      expect(user.isMe(2)).toBe(false);
    });
  });

  describe("canModifyUser", () => {
    it("deve retornar true quando REQUESTER tentar modificar outro usuário", () => {
      const teacher = new User({
        id: 1,
        name: "Prof",
        email: "p@email.com",
        password: "x",
        role: UserRole.MANAGER,
      });
      expect(teacher.canModifyUser(2)).toBe(true);
    });

    it("deve retornar true quando REQUESTER tentar modificar a si mesmo", () => {
      const teacher = new User({
        id: 1,
        name: "Prof",
        email: "p@email.com",
        password: "x",
        role: UserRole.MANAGER,
      });
      expect(teacher.canModifyUser(1)).toBe(true);
    });

    it("deve retornar true quando MANAGER tentar modificar a si mesmo", () => {
      const student = new User({
        id: 2,
        name: "Maria",
        email: "m@email.com",
        password: "x",
        role: UserRole.REQUESTER,
      });
      expect(student.canModifyUser(2)).toBe(true);
    });

    it("deve retornar false quando MANAGER tentar modificar outro usuário", () => {
      const student = new User({
        id: 2,
        name: "Maria",
        email: "m@email.com",
        password: "x",
        role: UserRole.REQUESTER,
      });
      expect(student.canModifyUser(3)).toBe(false);
    });
  });
});
