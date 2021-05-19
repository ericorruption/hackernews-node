require("dotenv").config();

import fs from "fs";
import path from "path";
import { ApolloServer } from "apollo-server";

import type { Resolvers } from "./generated/graphql";
import type { Context } from "./context";
import { context } from "./context";
import { queryResolvers } from "./resolvers/Query";
import { mutationResolvers } from "./resolvers/Mutation";
import { linkResolvers } from "./resolvers/Link";
import { userResolvers } from "./resolvers/User";

const resolvers: Resolvers<Context> = {
  Query: queryResolvers,
  Mutation: mutationResolvers,
  Link: linkResolvers,
  User: userResolvers,
};

const server = new ApolloServer({
  typeDefs: fs.readFileSync(path.join(__dirname, "schema.graphql"), "utf-8"),
  resolvers,
  context,
});

server.listen().then(({ url }) => console.log(`Server is running on ${url}`));
