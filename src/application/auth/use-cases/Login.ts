import { UserRole } from "../../../domain/entities/User.ts";
import { InvalidCredentialsError } from "../../../domain/errors/InvalidCredentialsError.ts";
import { UserNotFoundError } from "../../../domain/errors/UserNotFoundError.ts";
import { UserRepository } from "../../../domain/repositories/UserRepository.ts";
import { AuthService } from "../../../domain/services/AuthService.ts";
import { LoginDTO } from "../dtos/LoginDTO.ts";

type LoginResponse = {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
};

export class Login {
  constructor(
    private userRepository: UserRepository,
    private authService: AuthService,
  ) {}

  async execute(input: LoginDTO): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new UserNotFoundError(input.email);
    }

    const isValid = await this.authService.comparePasswords(
      input.password,
      user.password,
    );

    if (!isValid) {
      throw new InvalidCredentialsError();
    }

    const token = this.authService.generateToken(user);

    return {
      token,
      user: {
        id: user.id as number,
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
      },
    };
  }
}
