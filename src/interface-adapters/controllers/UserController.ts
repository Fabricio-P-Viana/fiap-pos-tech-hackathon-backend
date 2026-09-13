import type {
  CreateUserUseCase,
  FindAllUserUseCase,
  UpdateUserUseCase,
  DeleteUserUseCase,
  FindOneByIdUserUseCase,
  FindUsersByRoleUseCase,
  CreateManagerUseCase,
} from "../../application/user/use-cases/index.ts";
import {
  CreateUserDTO,
  UpdateUserDTO,
} from "../../application/user/dtos/index.ts";
import { ValidationError } from "../../domain/errors/ValidationError.ts";
import { UserRole } from "../../domain/entities/User.ts";
import { ReqResNextFunction } from "../types/index.ts";
import UserView from "../presenters/UserView.ts";

export default class UserController {
  private createUserUseCase: CreateUserUseCase;
  private findAllUserUseCase: FindAllUserUseCase;
  private updateUserUseCase: UpdateUserUseCase;
  private deleteUserUseCase: DeleteUserUseCase;
  private findOneByIdUserUseCase: FindOneByIdUserUseCase;
  private findUsersByRoleUseCase: FindUsersByRoleUseCase;
  private createManagerUseCase: CreateManagerUseCase;

  constructor(
    createUserUseCase: CreateUserUseCase,
    findAllUserUseCase: FindAllUserUseCase,
    updateUserUseCase: UpdateUserUseCase,
    deleteUserUseCase: DeleteUserUseCase,
    findOneByIdUserUseCase: FindOneByIdUserUseCase,
    findUsersByRoleUseCase: FindUsersByRoleUseCase,
    createManagerUseCase: CreateManagerUseCase
  ) {
    this.createUserUseCase = createUserUseCase;
    this.findAllUserUseCase = findAllUserUseCase;
    this.updateUserUseCase = updateUserUseCase;
    this.deleteUserUseCase = deleteUserUseCase;
    this.findOneByIdUserUseCase = findOneByIdUserUseCase;
    this.findUsersByRoleUseCase = findUsersByRoleUseCase;
    this.createManagerUseCase = createManagerUseCase;
  }

  private parseId(id: string | string[]): number {
    const idString = Array.isArray(id) ? id[0] : id;
    const userId = parseInt(idString, 10);

    if (isNaN(userId)) {
      throw new ValidationError("User ID must be a valid number");
    }

    return userId;
  }

  async createUser({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      const dto = CreateUserDTO.create(req.body);
      const user = await this.createUserUseCase.execute(dto);

      res.status(201).json(UserView.render(user));
    } catch (error) {
      next(error);
    }
  }

  async createManager({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      const dto = CreateUserDTO.create(req.body);
      const manager = await this.createManagerUseCase.execute(dto);

      res.status(201).json(UserView.render(manager));
    } catch (error) {
      next(error);
    }
  }

  async findUsersByRole({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      const { role } = req.query;

      if (!role || typeof role !== "string") {
        throw new ValidationError("Role is required");
      }

      if (!Object.values(UserRole).includes(role as UserRole)) {
        throw new ValidationError(
          `Role must be one of: ${Object.values(UserRole).join(", ")}`
        );
      }

      const users = await this.findUsersByRoleUseCase.execute(role as UserRole);
      res.status(200).json(UserView.renderMany(users));
    } catch (error) {
      next(error);
    }
  }

  async findAllUsers({ res, next }: ReqResNextFunction): Promise<void> {
    try {
      const users = await this.findAllUserUseCase.execute();
      res.status(200).json(UserView.renderMany(users));
    } catch (error) {
      next(error);
    }
  }

  async findUserById({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      const userId = this.parseId(req.params.id);
      const user = await this.findOneByIdUserUseCase.execute(userId);
      res.status(200).json(UserView.render(user));
    } catch (error) {
      next(error);
    }
  }

  async updateUser({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      const userId = this.parseId(req.params.id);
      const currentUserId = req.user?.userId;

      const dto = UpdateUserDTO.create(req.body);
      const updatedUser = await this.updateUserUseCase.execute(
        userId,
        dto,
        currentUserId
      );
      res.status(200).json(UserView.render(updatedUser));
    } catch (error) {
      next(error);
    }
  }

  async deleteUser({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      const userId = this.parseId(req.params.id);
      await this.deleteUserUseCase.execute(userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
