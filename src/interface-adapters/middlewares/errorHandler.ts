import type { Request, Response, NextFunction } from "express";
import { ValidationError } from "../../domain/errors/ValidationError.ts";
import { UserNotFoundError } from "../../domain/errors/UserNotFoundError.ts";
import { InvalidCredentialsError } from "../../domain/errors/InvalidCredentialsError.ts";
import { UnauthorizedError } from "../../domain/errors/UnauthorizedError.ts";

export default function ErrorHandlerMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err instanceof InvalidCredentialsError) {
    res.status(401).json({ error: err.message });
    return;
  }

  if (err instanceof UnauthorizedError) {
    res.status(403).json({ error: err.message });
    return;
  }

  if (err instanceof UserNotFoundError) {
    res.status(404).json({ error: err.message });
    return;
  }

  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
}
