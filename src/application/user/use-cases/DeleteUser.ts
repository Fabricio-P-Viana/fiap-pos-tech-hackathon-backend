import type { UserRepository } from "../../../domain/repositories/UserRepository.ts";
import { UserNotFoundError } from "../../../domain/errors/UserNotFoundError.ts";
import { UnauthorizedError } from "../../../domain/errors/UnauthorizedError.ts";

export class DeleteUserUseCase {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId: number, currentUserId: number): Promise<void> {
    const currentUser = await this.userRepository.findById(currentUserId);
    if (!currentUser || !currentUser.canModifyUser(userId)) {
      throw new UnauthorizedError(userId);
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError(userId);
    }

    const deleted = await this.userRepository.delete(userId);
    if (!deleted) {
      throw new UserNotFoundError(userId);
    }
  }
}
