import type { Request, Response, NextFunction } from "express";

export type ReqResNextFunction = {
  req: Request;
  res: Response;
  next: NextFunction;
};
