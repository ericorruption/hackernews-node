import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { Context } from "../context";
import { MutationResolvers, User } from "../generated/graphql";
import { newLinkTrigger } from "./Subscription";

type Resolvers = MutationResolvers<Context>;

const APP_SECRET = process.env.APP_SECRET;

if (!APP_SECRET) {
  throw new Error("Environment not set up");
}

// TODO replace prisma ID with String  @id @default(cuid())
const createLink: Resolvers["createLink"] = async (_, args, context) => {
  if (!context.userId) {
    throw new Error("Unauthorized");
  }

  const newLink = await context.prisma.link.create({
    data: {
      url: args.url,
      description: args.description,
      postedBy: {
        connect: { id: parseInt(context.userId, 10) },
      },
    },
  });

  context.pubSub.publish(newLinkTrigger, newLink);

  return { ...newLink, id: newLink.id.toString() };
};

const updateLink: Resolvers["updateLink"] = async (_, args, context) => {
  try {
    const updatedLink = await context.prisma.link.update({
      data: {
        description: args.description ?? undefined,
        url: args.url ?? undefined,
      },
      where: {
        id: parseInt(args.id, 10),
      },
    });

    return { ...updatedLink, id: updatedLink.id.toString() };
  } catch (e) {
    if (
      e instanceof Error &&
      e.message.includes(prismaRecordToUpdateNotFound)
    ) {
      return null;
    } else {
      throw e;
    }
  }
};

const deleteLink: Resolvers["deleteLink"] = async (_, args, context) => {
  try {
    const target = await context.prisma.link.delete({
      where: {
        id: parseInt(args.id, 10),
      },
    });

    return { ...target, id: target.id.toString() };
  } catch (e) {
    if (
      e instanceof Error &&
      e.message.includes(prismaRecordToDeleteNotFound)
    ) {
      return null;
    } else {
      throw e;
    }
  }
};

const signup: Resolvers["signup"] = async (_, args, context) => {
  const password = await bcrypt.hash(args.password, 10);
  const dbUser = await context.prisma.user.create({
    data: {
      ...args,
      password,
    },
  });

  const user: User = { ...dbUser, id: dbUser.id.toString(), links: [] };

  const token = jwt.sign({ userId: dbUser.id }, APP_SECRET);

  return {
    token,
    user,
  };
};

const login: Resolvers["login"] = async (_, args, context) => {
  const dbUser = await context.prisma.user.findUnique({
    where: { email: args.email },
  });

  if (!dbUser) {
    throw new Error("User not found");
  }

  const isValid = await bcrypt.compare(args.password, dbUser.password);

  if (!isValid) {
    throw new Error("Invalid password");
  }

  const user: User = { ...dbUser, id: dbUser.id.toString(), links: [] };

  const token = jwt.sign({ userId: user.id }, APP_SECRET);

  return {
    token,
    user,
  };
};

export const mutationResolvers: Resolvers = {
  createLink,
  updateLink,
  deleteLink,
  signup,
  login,
};

const prismaRecordToUpdateNotFound = "Record to update not found.";
const prismaRecordToDeleteNotFound = "Record to delete does not exist.";
