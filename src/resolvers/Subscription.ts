import { Link, Vote, SubscriptionResolvers } from "../generated/graphql";

export const newLinkTrigger = "NEW_LINK";
export const newVoteTrigger = "NEW_VOTE";

export const subscriptionResolvers: SubscriptionResolvers = {
  newLink: {
    subscribe: (_, __, context) => context.pubSub.asyncIterator(newLinkTrigger),
    resolve: (payload: Link) => payload,
  },
  newVote: {
    subscribe: (_, __, context) => context.pubSub.asyncIterator(newVoteTrigger),
    resolve: (payload: Vote) => payload,
  },
};
