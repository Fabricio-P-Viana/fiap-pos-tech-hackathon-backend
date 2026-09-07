import { User, UserRole } from "../entities/User.ts";

export interface AuthService {
  generateToken(user: User): string;

  verifyToken(token: string): TokenPayload | null;

  hashPassword(password: string): Promise<string>;

  comparePasswords(password: string, hash: string): Promise<boolean>;
}

export interface TokenPayload {
  userId: number;
  email: string;
  role: UserRole;
}
