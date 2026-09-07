import type { Request, Response, NextFunction } from "express";

export default function RequestLoggerMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
}
