/* eslint-disable class-methods-use-this */
import invariant from 'invariant';
import MemoryCache from './cache/Memory';
import * as stores from './stores';
import * as caches from './cache';

class Config {
  constructor(cache = new MemoryCache()) {
    this.stores = [];
    this.cache = cache;
  }

  addStore(store) {
    this.stores.unshift(store);
  }

  async multiGet(keys, ttl) {
    invariant(
      Array.isArray(keys),
      'Config.multiGet requires an array of keys!',
    );
    return Promise.all(keys.map(key => this.get(key, undefined, ttl)));
  }

  async get(key, defaultValue, options = {}) {
    const { ttl, ignoreStores } = {
      ignoreStores: [],
      ...options,
    };

    invariant(key, 'Key is required!');

    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const filteredStores = this.stores.filter(s => !ignoreStores.includes(s));
    const store = await filteredStores.reduce(
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

export { Config as default, stores, caches };
