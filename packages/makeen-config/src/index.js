/* eslint-disable class-methods-use-this */
import invariant from 'invariant';
import Cache from './cache/Memory';

class Config {
  constructor(cache = new Cache()) {
    this.stores = [];
    this.aliases = {};
    this.cache = cache;
  }

  addStore(store) {
    this.stores.unshift(store);
  }

  alias(from, to) {
    invariant(
      typeof from === 'string',
      `Aliases have to be strings; got ${typeof from} instead!`,
    );
    invariant(
      typeof to === 'string',
      `Aliases references have to be strings; got ${typeof to} instead!`,
    );

    this.aliases[from] = to;

    return this;
  }

  async get(key, defaultValue) {
    invariant(key, 'Key is required!');

    if (this.aliases[key] !== undefined) {
      return this.get(this.aliases[key]);
    }

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
