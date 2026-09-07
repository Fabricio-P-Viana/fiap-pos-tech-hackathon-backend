import { Request, Response, NextFunction } from "express";
import { UserRole } from "../../domain/entities/User.ts";

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: "Forbidden: insufficient privileges",
      });
    }

    next();
  };
};
