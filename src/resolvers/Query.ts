import { QueryResolvers } from "../generated/graphql";

// TODO abstract id to string logic
export const queryResolvers: QueryResolvers = {
  links: async (_, __, context) => {
    const links = await context.prisma.link.findMany();
    return links.map((link) => ({
      ...link,
      id: link.id.toString(),
      votes: [],
    }));
  },
  link: async (_, args, context) => {
    const link = await context.prisma.link.findUnique({
      where: {
        id: parseInt(args.id, 10),
      },
    });

    return link ? { ...link, id: link.id.toString(), votes: [] } : null;
  },
};
