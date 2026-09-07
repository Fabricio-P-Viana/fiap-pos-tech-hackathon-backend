import { User } from "../../../domain/entities/User.ts";
import type { UserRepository } from "../../../domain/repositories/UserRepository.ts";

export class FindAllUserUseCase {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
