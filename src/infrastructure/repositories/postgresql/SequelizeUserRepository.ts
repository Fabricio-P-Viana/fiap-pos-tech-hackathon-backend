import { UserRepository } from "../../../domain/repositories/UserRepository.ts";
import type { UserData } from "../../../domain/entities/User.ts";
import { User, UserRole } from "../../../domain/entities/User.ts";
import type { UserModel } from "../../database/models/UserModel.ts";
import type { ModelStatic } from "sequelize";

export default class SequelizeUserRepository implements UserRepository {
  private userModel: ModelStatic<UserModel>;

  constructor(userModel: ModelStatic<UserModel>) {
    this.userModel = userModel;
  }
  private mapToDomain(userModel: UserModel): User {
    const data = userModel.get({ plain: true });
    return new User(data);
  }

  async create(userData: UserData): Promise<User> {
    const created = await this.userModel.create(userData);
    return this.mapToDomain(created);
  }

  async findAll(): Promise<User[]> {
    const users = await this.userModel.findAll();
    return users.map((u) => this.mapToDomain(u));
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.userModel.findByPk(id);
    if (!user) return null;
    return this.mapToDomain(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({
      where: { email },
    });

    if (!user) return null;

    return this.mapToDomain(user);
  }

  async findByRole(role: UserRole): Promise<User[]> {
    const users = await this.userModel.findAll({
      where: { role },
    });
    return users.map((u) => this.mapToDomain(u));
  }

  async update(id: number, userData: Partial<UserData>): Promise<User | null> {
    const user = await this.userModel.findByPk(id);
    if (user) {
      await user.update(userData);
      return this.mapToDomain(user);
    }
    return null;
  }

  async delete(id: number): Promise<boolean> {
    const user = await this.userModel.findByPk(id);
    if (user) {
      await user.destroy();
      return true;
    }
    return false;
  }
}
