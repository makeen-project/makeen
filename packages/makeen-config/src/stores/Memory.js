import _ from 'lodash';

class MemoryStore {
  constructor(backend = {}) {
    this.backend = backend;
  }

  has(key) {
    return _.has(this.backend, key);
  }

  get(key, nextStore) {
    if (!this.has(key)) {
      return nextStore.get(key);
    }

    return _.get(this.backend, key);
  }

  set(key, value) {
    _.set(this.backend, key, value);
    return this;
  }

  merge(data) {
    _.merge(this.backend, data);
    return this;
  }

  unset(key) {
    _.unset(this.backend, key);
    return this;
  }
}

export default MemoryStore;
