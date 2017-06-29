import { MongoClient } from 'mongodb';
import { RefManager } from 'mongo-dnorm';
import { Store, decorators } from 'octobus-mongodb-store';
import { Module } from 'makeen';
import Repository from './libs/Repository';
import * as helpers from './libs/helpers';

class Storage extends Module {
  static connect({ host, port, db }) {
    return MongoClient.connect(`mongodb://${host}:${port}/${db}`);
  }

  hooks = {
    'graphql:buildContext': ({ context }) => {
      const { fromMongo, toMongo } = helpers;

      Object.assign(context, {
        fromMongo,
        toMongo,
      });
    },
  };

  constructor(...args) {
    super(...args);

    this.createStore = this.createStore.bind(this);
    this.createRepository = this.createRepository.bind(this);
  }

  createStore(options) {
    const { db, refManager, MongoDbStore } = this;
    return new MongoDbStore({
      db,
      refManager,
      ...options,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  createRepository(name, schema, methods = {}) {
    const repository = new Repository(schema, name);
    Object.keys(methods).forEach(methodName => {
      repository[methodName] = methods[methodName].bind(repository);
    });
    return repository;
  }

  async setup() {
    this.db = await Storage.connect(this.getConfig('connection'));
    this.refManager = new RefManager(this.db);
    this.MongoDbStore = decorators.withTimestamps(Store);

    Object.assign(Repository, {
      db: this.db,
      refManager: this.refManager,
    });

    this.export({
      db: this.db,
      refManager: this.refManager,
      createStore: this.createStore,
      createRepository: this.createRepository.bind(this),
    });
  }
}

export { Storage as default, Repository, helpers };
