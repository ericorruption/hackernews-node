require("dotenv").config();

import fs from "fs";
import path from "path";
import { ApolloServer } from "apollo-server";

import type { Resolvers } from "./generated/graphql";
import { context } from "./context";
import { queryResolvers } from "./resolvers/Query";
import { mutationResolvers } from "./resolvers/Mutation";
import { linkResolvers } from "./resolvers/Link";
import { userResolvers } from "./resolvers/User";
import { subscriptionResolvers } from "./resolvers/Subscription";
import { voteResolvers } from "./resolvers/Vote";

const resolvers: Resolvers = {
  Query: queryResolvers,
  Mutation: mutationResolvers,
  Subscription: subscriptionResolvers,
  Link: linkResolvers,
  User: userResolvers,
  Vote: voteResolvers,
};

const server = new ApolloServer({
  typeDefs: fs.readFileSync(path.join(__dirname, "schema.graphql"), "utf-8"),
  resolvers,
  context,
});

server.listen().then(({ url }) => console.log(`Server is running on ${url}`));
