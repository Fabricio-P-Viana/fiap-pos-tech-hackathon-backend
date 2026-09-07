import { User, UserRole } from "../../../domain/entities/User.ts";
import type { UserRepository } from "../../../domain/repositories/UserRepository.ts";

export class FindUsersByRoleUseCase {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(role: UserRole): Promise<User[]> {
    //console.log(`Executing FindUsersByRoleUseCase with role: ${role}`);
    return this.userRepository.findByRole(role);
  }
}
