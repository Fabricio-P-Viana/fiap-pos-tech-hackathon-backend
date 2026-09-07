import { TokenPayload } from "../../domain/services/AuthService.ts";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
