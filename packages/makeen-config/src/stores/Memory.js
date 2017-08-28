import _ from 'lodash';

class MemoryStore {
  constructor(backend = {}) {
    this.backend = backend;
  }

  has(key) {
    return _.has(this.backend, key);
  }

  async get(key, nextStore) {
    if (!this.has(key)) {
      return nextStore.get(key);
    }

    const ownValue = _.get(this.backend, key);

    if (!_.isPlainObject(ownValue)) {
      return ownValue;
    }

    const nextValue = await nextStore.get(key);

    if (!_.isPlainObject(nextValue)) {
      return ownValue;
    }

    return _.merge({}, nextValue, ownValue);
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
