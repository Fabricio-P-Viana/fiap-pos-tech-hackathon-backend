import { User, UserData, UserRole } from "../entities/User.ts";

export interface UserRepository {
  create(_userData: UserData): Promise<User>;

  findAll(): Promise<User[]>;

  findById(_id: number): Promise<User | null>;

  findByEmail(_email: string): Promise<User | null>;

  findByRole(_role: UserRole): Promise<User[]>;

  update(_id: number, _userData: Partial<UserData>): Promise<User | null>;

  delete(_id: number): Promise<boolean>;
}
