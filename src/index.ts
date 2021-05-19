import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { ApolloServer } from "apollo-server";

import { Resolvers } from "./generated/graphql";

interface Context {
  prisma: PrismaClient;
}

const context: Context = {
  prisma: new PrismaClient(),
};

// TODO abstract id to string logic
const resolvers: Resolvers<Context> = {
  Query: {
    links: async (_, __, context) => {
      const links = await context.prisma.link.findMany();
      return links.map((link) => ({ ...link, id: link.id.toString() }));
    },
    link: async (_, args, context) => {
      const link = await context.prisma.link.findUnique({
        where: {
          id: parseInt(args.id, 10),
        },
      });

      return link ? { ...link, id: link.id.toString() } : null;
    },
  },
  Mutation: {
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
  },
};

const server = new ApolloServer({
  typeDefs: fs.readFileSync(path.join(__dirname, "schema.graphql"), "utf-8"),
  resolvers,
  context,
});

server.listen().then(({ url }) => console.log(`Server is running on ${url}`));

const prismaRecordToUpdateNotFound = "Record to update not found.";
const prismaRecordToDeleteNotFound = "Record to delete does not exist.";
