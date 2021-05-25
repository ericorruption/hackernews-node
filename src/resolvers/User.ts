import { UserResolvers } from "../generated/graphql";

export const userResolvers: UserResolvers = {
  links: async (parent, _, context) => {
    const links = await context.prisma.user
      .findUnique({ where: { id: parseInt(parent.id, 10) } })
      .links();

    return links.map((link) => ({
      ...link,
      id: link.id.toString(),
      votes: [],
    }));
  },
};
