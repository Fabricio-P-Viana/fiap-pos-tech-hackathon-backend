import { User } from "../../domain/entities/User.ts";

export default class UserView {
  static render<T extends User>(user: T): T {
    return user;
  }

  static renderMany<T extends User>(users: T[]): T[] {
    return users.map(this.render);
  }
}
