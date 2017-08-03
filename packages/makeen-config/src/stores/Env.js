/* eslint-disable class-methods-use-this */
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

  get(key) {
    return this.has(key)
      ? JSON.parse(super.get(EnvStore.makeKey(this.prefix, key)))
      : undefined;
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

  toJSON() {
    return this.backend;
  }
}

export default EnvStore;
