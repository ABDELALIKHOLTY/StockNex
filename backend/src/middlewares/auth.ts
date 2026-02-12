import { PrismaClient, User } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

// Singleton pattern for PrismaClient
const prismaClientSingleton = () => {
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export interface ExpressRequest extends Request {
  user?: User;
}

export const authenticate = async (
  req: ExpressRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.headers.authorization) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    res.status(401).json({ error: "Token not found" });
    return;
  }

  try {
    const decode = verify(token, process.env.JWT_SECRET || "") as { id: number; email: string };
    const user = await prisma.user.findUnique({
      where: {
        id: decode.id,
      },
    });
    req.user = user ?? undefined;
    next();
  } catch (err) {
    res.status(401).json({ error: "Unauthorized" });
  }
};