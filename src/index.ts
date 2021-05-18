import fs from "fs";
import path from "path";
import { ApolloServer } from "apollo-server";
import { Link, Resolvers } from "./generated/graphql";

let links: Link[] = [
  {
    id: "link-0",
    url: "www.howtographql.com",
    description: "Fullstack tutorial for GraphQL",
  },
];

let idCount = links.length;

const resolvers: Resolvers = {
  Query: {
    links: () => links,
    link: (_, args) => {
      return links.find((link) => link.id === args.id) || null;
    },
  },
  Mutation: {
    createLink: (_, args) => {
      const newLink: Link = {
        id: `link-${idCount++}`,
        description: args.description,
        url: args.url,
      };
      links.push(newLink);
      return newLink;
    },
    updateLink: (_, args) => {
      const target = links.find((link) => link.id === args.id);

      if (!target) {
        return null;
      }

      const updatedLink: Link = {
        ...target,
        description: args.description || target.description,
        url: args.url || target.url,
      };

      links = links.map((link) => (link.id === args.id ? updatedLink : link));

      return updatedLink;
    },
    deleteLink: (_, args) => {
      const target = links.find((link) => link.id === args.id);

      if (!target) {
        return null;
      }

      links = links.filter((link) => link.id !== args.id);

      return target;
    },
  },
};

const server = new ApolloServer({
  typeDefs: fs.readFileSync(path.join(__dirname, "schema.graphql"), "utf-8"),
  resolvers,
});

server.listen().then(({ url }) => console.log(`Server is running on ${url}`));
