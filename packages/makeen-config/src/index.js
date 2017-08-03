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

  async get(key, defaultValue) {
    invariant(key, 'Key is required!');

    if (this.cache.has(key)) {
      return this.cache.get(key);
    }

    const store = await this.stores.find(s => s.has(key));

    if (store) {
      const value = await store.get(key);
      this.cache.set(key, value);
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
