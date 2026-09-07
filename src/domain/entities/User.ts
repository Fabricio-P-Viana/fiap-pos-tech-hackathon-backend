export enum UserRole {
  REQUESTER = "REQUESTER",
  MANAGER = "MANAGER",
}

export interface UserData {
  id?: number;
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

export class User {
  id?: number;
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  createdAt?: Date;
  updatedAt?: Date;

  constructor({
    id,
    createdAt,
    name,
    email,
    password,
    role,
    updatedAt,
  }: UserData) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.role = role;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  canModifyUser(targetUserId: number): boolean {
    return this.isAdmin() || this.isMe(targetUserId);
  }

  isMe(userId: number): boolean {
    return this.id === userId;
  }

  isAdmin(): boolean {
    return this.role === UserRole.MANAGER;
  }
}
