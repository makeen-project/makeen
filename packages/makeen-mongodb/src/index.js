import Joi from 'joi';
import { MongoClient } from 'mongodb';
import { RefManager } from 'mongo-dnorm';
import { Store as MongoStore, decorators } from 'octobus-mongodb-store';
import { Module } from 'makeen';
import Repository from './libs/Repository';
import * as helpers from './libs/helpers';

class MongoDB extends Module {
  static connect({ host, port, db }) {
    return MongoClient.connect(`mongodb://${host}:${port}/${db}`);
  }

  static configSchema = {
    connections: Joi.array().items(
      Joi.object().keys({
        name: Joi.string().required(),
        config: Joi.alternatives().try(
          Joi.string().required(),
          Joi.object().keys({
            host: Joi.string().required(),
            port: Joi.number().required(),
            db: Joi.string().required(),
          }),
        ),
        Store: Joi.object().default(
          () => decorators.withTimestamps(MongoStore),
          'Mongo store',
        ),
      }),
    ),
    defaultConnection: Joi.string(),
  };

  name = 'makeen.mongoDb';

  hooks = {
    'makeen.graphQL.buildContext': ({ context }) => {
      const { fromMongo, toMongo } = helpers;

      Object.assign(context, {
        fromMongo,
        toMongo,
      });
    },
  };

  constructor(...args) {
    super(...args);

    this.connections = {};

    this.createStore = this.createStore.bind(this);
    this.createRepository = this.createRepository.bind(this);
    this.createConnection = this.createConnection.bind(this);
    this.getConnection = this.getConnection.bind(this);
    this.bindRepository = this.bindRepository.bind(this);
  }

  createStore(options, connectionName) {
    const { refManager, db, Store } = this.getConnection(
      connectionName || this.defaultConnectionName,
    );
    return new Store({
      db,
      refManager,
      ...options,
    });
  }

  createRepository({ name, schema, methods = {}, connectionName, store }) {
    const repository = new Repository(schema, name);
    Object.keys(methods).forEach(methodName => {
      repository[methodName] = methods[methodName].bind(repository);
    });

    if (store) {
      repository.setStore(store);
    } else {
      this.bindRepository(
        repository,
        connectionName || this.defaultConnectionName,
      );
    }

    return repository;
  }

  bindRepository(repository, connectionName) {
    const store = this.createStore(
      {
        collectionName: repository.collectionName,
      },
      connectionName || this.defaultConnectionName,
    );

    repository.setStore(store);

    return repository;
  }

  async createConnection(options) {
    const { name, Store, config } = options;
    const db = await MongoDB.connect(config);
    const refManager = new RefManager(db);

    const connection = {
      db,
      refManager,
      Store,
    };

    this.connections[name] = connection;

    return connection;
  }

  getConnection(name) {
    if (!this.connections[name]) {
      throw new Error(`Unknown connection name - "${name}"!`);
    }

    return this.connections[name];
  }

  initialize({ connections, defaultConnection }) {
    this.defaultConnectionName = defaultConnection;

    if (!this.defaultConnectionName && connections.length === 1) {
      this.defaultConnectionName = connections[0].name;
    }

    const names = connections.map(({ name }) => name);

    if (!names.includes(this.defaultConnectionName)) {
      throw new Error(
        `Default connection name (${this
          .defaultConnectionName}) can't be found through the list of available connections (${names})`,
      );
    }
  }

  async setup({ connections }) {
    const {
      createConnection,
      getConnection,
      createStore,
      createRepository,
      bindRepository,
    } = this;

    await Promise.all(connections.map(createConnection));

    this.export({
      createStore,
      createRepository,
      createConnection,
      getConnection,
      bindRepository,
    });
  }
}

export { MongoDB as default, Repository, helpers };
