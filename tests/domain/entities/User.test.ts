import { User, UserRole } from "../../../src/domain/entities/User";

describe("User entity", () => {
  describe("isTeacher", () => {
    it("deve retornar true quando role for TEACHER", () => {
      const user = new User({
        name: "João",
        email: "j@email.com",
        password: "x",
        role: UserRole.MANAGER,
      });
      expect(user.isTeacher()).toBe(true);
    });

    it("deve retornar false quando role for STUDENT", () => {
      const user = new User({
        name: "Maria",
        email: "m@email.com",
        password: "x",
        role: UserRole.REQUESTER,
      });
      expect(user.isTeacher()).toBe(false);
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
    it("deve retornar true quando TEACHER tentar modificar outro usuário", () => {
      const teacher = new User({
        id: 1,
        name: "Prof",
        email: "p@email.com",
        password: "x",
        role: UserRole.MANAGER,
      });
      expect(teacher.canModifyUser(2)).toBe(true);
    });

    it("deve retornar true quando TEACHER tentar modificar a si mesmo", () => {
      const teacher = new User({
        id: 1,
        name: "Prof",
        email: "p@email.com",
        password: "x",
        role: UserRole.MANAGER,
      });
      expect(teacher.canModifyUser(1)).toBe(true);
    });

    it("deve retornar true quando STUDENT tentar modificar a si mesmo", () => {
      const student = new User({
        id: 2,
        name: "Maria",
        email: "m@email.com",
        password: "x",
        role: UserRole.REQUESTER,
      });
      expect(student.canModifyUser(2)).toBe(true);
    });

    it("deve retornar false quando STUDENT tentar modificar outro usuário", () => {
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

  describe("canModifyPost", () => {
    it("deve retornar true quando TEACHER for o autor do post", () => {
      const teacher = new User({
        id: 1,
        name: "Prof",
        email: "p@email.com",
        password: "x",
        role: UserRole.MANAGER,
      });
      expect(teacher.canModifyPost(1)).toBe(true);
    });

    it("deve retornar false quando TEACHER não for o autor do post", () => {
      const teacher = new User({
        id: 1,
        name: "Prof",
        email: "p@email.com",
        password: "x",
        role: UserRole.MANAGER,
      });
      expect(teacher.canModifyPost(2)).toBe(false);
    });

    it("deve retornar false quando STUDENT tentar modificar post", () => {
      const student = new User({
        id: 2,
        name: "Maria",
        email: "m@email.com",
        password: "x",
        role: UserRole.REQUESTER,
      });
      expect(student.canModifyPost(2)).toBe(false);
    });
  });
});
