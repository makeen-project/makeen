/* eslint-disable no-underscore-dangle */
import { CRUDServiceContainer } from 'octobus-crud';
import { Store, decorators } from 'octobus-mongodb-store';

const MongoDbStore = decorators.withTimestamps(Store);

class Repository extends CRUDServiceContainer {
  constructor(schema, collectionName) {
    super(schema);
    this.collectionName =
      collectionName ||
      this.constructor.name.substr(
        0,
        this.constructor.name.indexOf('Repository'),
      );
  }

  get store() {
    const { db, refManager } = Repository;
    const { collectionName } = this;

    if (!this._store) {
      if (!db || !refManager) {
        throw new Error(
          'Repository store cannot be created (missing db and refManager)!',
        );
      }

      this._store = new MongoDbStore({
        db,
        refManager,
        collectionName,
      });
    }

    return this._store;
  }

  set store(store) {
    this._store = store;
  }
}

export default Repository;
