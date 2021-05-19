import { PrismaClient } from "@prisma/client";
import type { ExpressContext } from "apollo-server-express";
import { getUserId, UserId } from "./auth";
export interface Context {
  prisma: PrismaClient;
  userId: UserId | null;
}

// TODO forward req?
export const context = ({ req }: ExpressContext): Context => ({
  prisma: new PrismaClient(),
  userId: req && req.headers.authorization ? getUserId(req) : null,
});
