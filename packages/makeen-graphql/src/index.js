/* eslint-disable no-empty */
import path from 'path';
import fse from 'fs-extra';
import Joi from 'joi';
import get from 'lodash/get';
import set from 'lodash/set';
import has from 'lodash/has';
import identity from 'lodash/identity';
import { Module } from 'makeen';
import { graphqlExpress, graphiqlExpress } from 'graphql-server-express';
import merge from 'lodash/merge';
import { makeExecutableSchema } from 'graphql-tools';
import mainResolvers from './graphql/resolvers';

class Gql extends Module {
  static configSchema = {
    schemaOptions: Joi.object().keys({
      typeDefs: Joi.array().default([]),
      resolvers: Joi.array().default([]),
    }),
    graphiql: Joi.object().keys({
      enabled: Joi.boolean().default(true),
    }),
    middlewarePivot: Joi.string().default('isMethod'),
    configureSchema: Joi.func().default(identity),
  };
  typeDefs = [];
  resolvers = mainResolvers;
  middlewares = {};

  constructor(...args) {
    super(...args);
    this.collectFromModule = this.collectFromModule.bind(this);
    this.addTypeDefs = this.addTypeDefs.bind(this);
    this.addTypeDefsByPath = this.addTypeDefsByPath.bind(this);
    this.addResolvers = this.addResolvers.bind(this);
    this.addMiddleware = this.addMiddleware.bind(this);
  }

  addTypeDefs(typeDefs) {
    this.typeDefs.push(typeDefs);
  }

  addResolvers(resolvers) {
    merge(this.resolvers, resolvers);
  }

  addMiddleware(branch, middleware) {
    if (!this.middlewares[branch]) {
      this.middlewares[branch] = [];
    }

    this.middlewares[branch].push(middleware);
  }

  async addTypeDefsByPath(filePath) {
    this.addTypeDefs(await fse.readFile(filePath, 'utf8'));
  }

  async loadFromDir(dirPath) {
    try {
      const stat = await fse.stat(dirPath);
      const isDirectory = stat && stat.isDirectory();
      if (!isDirectory) {
        return;
      }
    } catch (err) {
      return;
    }

    try {
      await this.addTypeDefsByPath(path.join(dirPath, 'typeDefs.graphql'));
    } catch (err) {}

    try {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      const resolvers = require(`${dirPath}/resolvers.js`);
      if (resolvers.default) {
        Object.assign(resolvers, resolvers.default);
        delete resolvers.default;
      }
      this.addResolvers(resolvers);
    } catch (err) {}
  }

  async collectFromModule(module) {
    try {
      if (has(module, 'graphql')) {
        this.addTypeDefs(get(module, 'graphql.typeDefs', ''));
        this.addResolvers(get(module, 'graphql.resolvers', {}));
        if (has(module, 'graphql.typeDefsPath')) {
          await this.addTypeDefsByPath(get(module, 'graphql.typeDefsPath'));
        }
      } else {
        await this.loadFromDir(
          path.resolve(path.dirname(module.filePath), 'graphql'),
        );
      }
    } catch (err) {}
  }

  buildSchema() {
    const resolvers = this.resolvers;

    Object.keys(this.middlewares).forEach(branch => {
      const middlewares = this.middlewares[branch];
      if (!middlewares.length) {
        return;
      }

      if (!has(resolvers, branch)) {
        throw new Error(`Couldn't find a resolver for "${branch}" branch!`);
      }

      const resolver = [...middlewares]
        .reverse()
        .reduce(
          (acc, middleware) => (...args) => middleware(...args, acc),
          get(resolvers, branch),
        );

      set(resolvers, branch, resolver);
    });

    return makeExecutableSchema(
      this.getConfig('configureSchema')({
        typeDefs: this.typeDefs,
        resolvers,
        logger: {
          log: err => this.app.logger.error(err),
        },
        allowUndefinedInResolve: false,
      }),
    );
  }

  async setup() {
    const {
      collectFromModule,
      addTypeDefs,
      addTypeDefsByPath,
      addResolvers,
      addMiddleware,
    } = this;

    await this.manager.run('graphQL:load', collectFromModule, {
      addTypeDefs,
      addTypeDefsByPath,
      addResolvers,
      addMiddleware,
    });

    const context = {};

    await this.manager.run('graphql:buildContext', () => {}, {
      context,
    });

    const schema = this.buildSchema();

    this.app.middlewares.insertBefore(
      this.getConfig('middlewarePivot'),
      {
        id: 'graphql',
        path: '/graphql',
        factory: graphqlExpress,
        params: req => ({
          schema,
          context: {
            ...context,
            req,
            app: req.app,
            user: req.user,
          },
        }),
      },
      {
        id: 'graphiql',
        path: '/graphiql',
        factory: graphiqlExpress,
        params: {
          endpointURL: '/graphql',
        },
        enabled: this.getConfig('graphiql.enabled', false),
      },
    );

    this.export({
      schema,
    });
  }
}

export default Gql;
