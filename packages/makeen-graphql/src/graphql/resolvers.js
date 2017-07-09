import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import GraphQLJSON from 'graphql-type-json';

export default {
  Mutation: {},
  Query: {
    hello: () => 'Makeen it!',
    modules: (_, { name }, { app }) => {
      const { dependencyGraph } = app.modules;
      if (name) {
        return [{ name }];
      }

      return Object.keys(dependencyGraph).map(module => ({ name: module }));
    },
  },
  Module: {
    dependencies: ({ name }, args, { app }) =>
      app.modules.dependencyGraph[name].map(module => ({ name: module })),
  },
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue: value => new Date(value),
    serialize: value => value.getTime(),
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10);
      }

      return null;
    },
  }),
  JSON: GraphQLJSON,
};
