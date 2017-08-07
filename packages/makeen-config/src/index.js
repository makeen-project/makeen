/* eslint-disable class-methods-use-this */
import invariant from 'invariant';
import Cache from './cache/Memory';

class Config {
  constructor(cache = new Cache()) {
    this.stores = [];
    this.cache = cache;
  }

  addStore(store) {
    this.stores.unshift(store);
  }

  async get(key, defaultValue, ttl) {
    invariant(key, 'Key is required!');

    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const store = await this.stores.reduce(
      (acc, currentStore) =>
        acc.then(async foundStore => {
          if (foundStore) {
            return foundStore;
          }

          return (await currentStore.has(key)) ? currentStore : false;
        }),
      Promise.resolve(false),
    );

    if (store) {
      const value = await store.get(key);
      this.cache.set(key, value, ttl);
      return value;
    }

    return defaultValue;
  }

  clearCache(key) {
    if (key) {
      this.cache.remove(key);
    } else {
      this.cache.clear();
    }
  }
}

export { Config as default };
