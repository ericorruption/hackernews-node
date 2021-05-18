import fs from "fs";
import path from "path";
import { ApolloServer } from "apollo-server";
import { Link, Resolvers } from "./generated/graphql";

const links: Link[] = [
  {
    id: "link-0",
    url: "www.howtographql.com",
    description: "Fullstack tutorial for GraphQL",
  },
];

let idCount = links.length;

const resolvers: Resolvers = {
  Query: {
    info: () => "TODO",
    feed: () => links,
  },
  Mutation: {
    post: (_, args) => {
      const newLink: Link = {
        id: `link-${idCount++}`,
        description: args.description,
        url: args.url,
      };
      links.push(newLink);
      return newLink;
    },
  },
};

const server = new ApolloServer({
  typeDefs: fs.readFileSync(path.join(__dirname, "schema.graphql"), "utf-8"),
  resolvers,
});

server.listen().then(({ url }) => console.log(`Server is running on ${url}`));
