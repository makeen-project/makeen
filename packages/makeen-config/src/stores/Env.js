import _ from 'lodash';
import MemoryStore from './Memory';

class EnvStore extends MemoryStore {
  static makeKey = (prefix, key) => {
    const path = _.toPath(key);
    const finalPath = path.map(item => _.toUpper(_.snakeCase(item))).join('_');
    return prefix ? `${prefix}_${finalPath}` : finalPath;
  };

  constructor(prefix) {
    super();
    this.prefix = prefix;
    this.backend = process.env;
  }

  has(key) {
    return super.has(EnvStore.makeKey(this.prefix, key));
  }

  async get(key, nextStore) {
    if (!this.has(key)) {
      return nextStore.get(key);
    }

    const value = this.backend[EnvStore.makeKey(this.prefix, key)];

    try {
      return JSON.parse(value);
    } catch (err) {
      return value;
    }
  }

  set(key, value) {
    return super.set(EnvStore.makeKey(this.prefix, key), value);
  }

  merge(data) {
    Object.keys(data).forEach(key => {
      this.set(key, data[key]);
    });

    return this;
  }

  unset(key) {
    return super.unset(EnvStore.makeKey(this.prefix, key));
  }
}

export default EnvStore;
