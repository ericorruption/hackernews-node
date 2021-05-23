import { PubSub } from "apollo-server";
import { PrismaClient } from "@prisma/client";
import type { ExpressContext } from "apollo-server-express";
import { getUserId, UserId } from "./auth";
export interface Context {
  prisma: PrismaClient;
  userId: UserId | null;
  pubSub: PubSub;
}

const prisma = new PrismaClient();
const pubSub = new PubSub();

// TODO forward req?
export const context = ({ req }: ExpressContext): Context => ({
  prisma,
  userId: req && req.headers.authorization ? getUserId(req) : null,
  pubSub,
});
