import type { Request, Response, NextFunction } from "express";
import multer from "multer";
import { ValidationError } from "../../domain/errors/ValidationError.ts";
import { UserNotFoundError } from "../../domain/errors/UserNotFoundError.ts";
import { InvalidCredentialsError } from "../../domain/errors/InvalidCredentialsError.ts";
import { UnauthorizedError } from "../../domain/errors/UnauthorizedError.ts";
import { ResourceNotFoundError } from "../../domain/errors/ResourceNotFoundError.ts";

interface SequelizeLikeError extends Error {
  name: string;
  errors?: Array<{ message: string; path?: string }>;
}

function isSequelizeError(err: Error): err is SequelizeLikeError {
  return (
    err.name === "SequelizeValidationError" ||
    err.name === "SequelizeUniqueConstraintError" ||
    err.name === "SequelizeForeignKeyConstraintError" ||
    err.name === "SequelizeDatabaseError"
  );
}

export default function ErrorHandlerMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: err.message });
    return;
  }

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

  if (err instanceof UserNotFoundError || err instanceof ResourceNotFoundError) {
    res.status(404).json({ error: err.message });
    return;
  }

  if (isSequelizeError(err)) {
    if (err.name === "SequelizeUniqueConstraintError") {
      res.status(409).json({
        error: "Registro já existe e viola uma restrição de unicidade",
        details: err.errors?.map((e) => e.message),
      });
      return;
    }
    if (err.name === "SequelizeForeignKeyConstraintError") {
      res.status(409).json({
        error: "Operação viola uma restrição de chave estrangeira",
      });
      return;
    }
    res.status(400).json({
      error: "Erro de validação no banco de dados",
      details: err.errors?.map((e) => e.message) ?? [err.message],
    });
    return;
  }

  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error" });
}
