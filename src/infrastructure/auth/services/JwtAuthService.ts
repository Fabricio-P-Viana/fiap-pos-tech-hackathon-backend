import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  AuthService,
  TokenPayload,
} from "../../../domain/services/AuthService.ts";
import { User, UserRole } from "../../../domain/entities/User.ts";

export class JwtAuthService implements AuthService {
  private readonly jwtSecret: string;
  private readonly saltRounds: number;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || "default_secret";
    this.saltRounds = 10;
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateToken(user: User): string {
    const payload: TokenPayload = {
      userId: user.id as number,
      email: user.email,
      role: user.role as UserRole,
    };

    return jwt.sign(payload, this.jwtSecret, { expiresIn: "1d" });
  }

  verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, this.jwtSecret) as TokenPayload;
    } catch {
      return null;
    }
  }
}
