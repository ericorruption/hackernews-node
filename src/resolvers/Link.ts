import { LinkResolvers } from "../generated/graphql";

export const linkResolvers: LinkResolvers = {
  postedBy: async (parent, _, context) => {
    const user = await context.prisma.link
      .findUnique({ where: { id: parseInt(parent.id, 10) } })
      .postedBy();

    return user ? { ...user, id: user.id.toString(), links: [] } : null;
  },
};
