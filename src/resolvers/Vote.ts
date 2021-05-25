import { Link, VoteResolvers } from "../generated/graphql";

export const voteResolvers: VoteResolvers = {
  link: async (parent, _, context) => {
    const link = await context.prisma.vote
      .findUnique({
        where: {
          id: parseInt(parent.id, 10),
        },
      })
      .link();

    if (!link) {
      throw new Error("Link for vote not found");
    }

    // @ts-ignore
    const result: Link = { ...link };

    return result;
  },
  // @ts-ignore
  user: (parent, _, context) =>
    context.prisma.vote
      .findUnique({
        where: {
          id: parseInt(parent.id, 10),
        },
      })
      .user(),
};
