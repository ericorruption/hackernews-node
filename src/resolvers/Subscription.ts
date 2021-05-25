import { Link, SubscriptionResolvers } from "../generated/graphql";

export const newLinkTrigger = "NEW_LINK";

export const subscriptionResolvers: SubscriptionResolvers = {
  newLink: {
    subscribe: (_, __, context) => context.pubSub.asyncIterator(newLinkTrigger),
    resolve: (payload: Link) => payload,
  },
};
