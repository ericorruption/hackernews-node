import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { MutationResolvers, User, Vote } from "../generated/graphql";
import { newLinkTrigger, newVoteTrigger } from "./Subscription";

const APP_SECRET = process.env.APP_SECRET;

if (!APP_SECRET) {
  throw new Error("Environment not set up");
}

// TODO replace prisma ID with String  @id @default(cuid())
const createLink: MutationResolvers["createLink"] = async (
  _,
  args,
  context
) => {
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

  return { ...newLink, id: newLink.id.toString(), votes: [] };
};

const updateLink: MutationResolvers["updateLink"] = async (
  _,
  args,
  context
) => {
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

    return { ...updatedLink, id: updatedLink.id.toString(), votes: [] };
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

const deleteLink: MutationResolvers["deleteLink"] = async (
  _,
  args,
  context
) => {
  try {
    const target = await context.prisma.link.delete({
      where: {
        id: parseInt(args.id, 10),
      },
    });

    return { ...target, id: target.id.toString(), votes: [] };
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

const signup: MutationResolvers["signup"] = async (_, args, context) => {
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

const login: MutationResolvers["login"] = async (_, args, context) => {
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

const vote: MutationResolvers["vote"] = async (_, args, context) => {
  if (!context.userId) {
    throw new Error("Unauthorized");
  }

  const userId = parseInt(context.userId, 10);

  const existingVote = await context.prisma.vote.findUnique({
    where: {
      linkId_userId: {
        linkId: parseInt(args.linkId, 10),
        userId,
      },
    },
  });

  if (existingVote) {
    throw new Error(`Already voted for link: ${args.linkId}`);
  }

  const newVote = await context.prisma.vote.create({
    data: {
      user: {
        connect: { id: userId },
      },
      link: {
        connect: { id: parseInt(args.linkId, 10) },
      },
    },
  });

  context.pubSub.publish(newVoteTrigger, newVote);

  // @ts-ignore
  const vote: Vote = { ...newVote };

  return vote;
};

export const mutationResolvers: MutationResolvers = {
  createLink,
  updateLink,
  deleteLink,
  signup,
  login,
  vote,
};

const prismaRecordToUpdateNotFound = "Record to update not found.";
const prismaRecordToDeleteNotFound = "Record to delete does not exist.";
