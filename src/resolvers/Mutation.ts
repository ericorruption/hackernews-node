import { Context } from "../context";
import { MutationResolvers } from "../generated/graphql";

// TODO abstract id to string logic
export const mutationResolvers: MutationResolvers<Context> = {
  createLink: async (_, args, context) => {
    const newLink = await context.prisma.link.create({
      data: args,
    });

    return { ...newLink, id: newLink.id.toString() };
  },
  updateLink: async (_, args, context) => {
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
  },
  deleteLink: async (_, args, context) => {
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
  },
};

const prismaRecordToUpdateNotFound = "Record to update not found.";
const prismaRecordToDeleteNotFound = "Record to delete does not exist.";
