import { QueryResolvers } from "../generated/graphql";

// TODO abstract id to string logic
export const queryResolvers: QueryResolvers = {
  links: async (_, args, context) => {
    const links = await context.prisma.link.findMany({
      where: args.filter
        ? {
            OR: [
              { description: { contains: args.filter } },
              { url: { contains: args.filter } },
            ],
          }
        : {},
      skip: args.skip ?? undefined,
      take: args.take ?? undefined,
      // TODO deal with input with more than one argument
      orderBy: {
        createdAt: args.orderBy?.createdAt ?? undefined,
        description: args.orderBy?.description ?? undefined,
        url: args.orderBy?.url ?? undefined,
      },
    });
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
