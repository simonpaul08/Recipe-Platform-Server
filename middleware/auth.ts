
import type { NextFunction, Request, Response } from "express";
import { verifyJwt } from "../utils/jwt.js";

export interface AuthRequest extends Request {
  user?: { id: number };
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ error: "Missing Authorization header" });

  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Invalid Authorization header" });

  const payload = verifyJwt(token);
  if (!payload) return res.status(401).json({ error: "Invalid or expired token" });

  req.user = { id: payload.userId };
  next();
}
