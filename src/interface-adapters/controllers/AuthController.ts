import type { ReqResNextFunction } from "../types/index.ts";
import type { Login as LoginUseCase } from "../../application/auth/use-cases/index.ts";
import { LoginDTO } from "../../application/auth/dtos/LoginDTO.ts";

export default class AuthController {
  private loginUseCase: LoginUseCase;

  constructor(loginUseCase: LoginUseCase) {
    this.loginUseCase = loginUseCase;
  }

  async login({ req, res, next }: ReqResNextFunction): Promise<void> {
    try {
      const dto = LoginDTO.create(req.body);
      const result = await this.loginUseCase.execute(dto);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}
