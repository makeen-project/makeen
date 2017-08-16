import set from 'lodash/set';

class Alias {
  constructor(backend, aliases = {}) {
    this.backend = backend;
    this.aliases = aliases;
  }

  add(from, to) {
    if (typeof from === 'string') {
      this.aliases[from] = to;
    } else {
      this.aliases = {
        ...this.aliases,
        ...from,
      };
    }

    return this;
  }

  hasAlias(key) {
    return Object.keys(this.aliases).includes(key);
  }

  embedsAlias(key) {
    const regex = new RegExp(`^${key}\\.`);
    return Object.keys(this.aliases).find(alias => regex.test(alias));
  }

  getNestedKeys(key) {
    const regex = new RegExp(`^${key}\\.`);
    return Object.keys(this.aliases).filter(alias => regex.test(alias));
  }

  has(key) {
    return this.hasAlias(key) || this.embedsAlias(key);
  }

  async get(key) {
    if (this.hasAlias(key)) {
      return this.backend.get(this.aliases[key]);
    }

    const value = await this.backend.get(key, undefined, {
      ignoreStores: [this],
    });

    const nestedKeys = this.getNestedKeys(key);

    if (nestedKeys.length) {
      await Promise.all(
        nestedKeys.map(async nestedKey => {
          const val = await this.backend.get(nestedKey);
          set(value, nestedKey.substr(key.length + 1), val);
        }),
      );
    }

    return value;
  }
}

export default Alias;
