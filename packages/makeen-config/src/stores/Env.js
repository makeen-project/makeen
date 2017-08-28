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
    this.keys = Object.keys(this.backend);
  }

  has(key) {
    return this.keys.includes(EnvStore.makeKey(this.prefix, key));
  }

  getValue(key) {
    const value = this.backend[EnvStore.makeKey(this.prefix, key)];

    try {
      return JSON.parse(value);
    } catch (err) {
      return value;
    }
  }

  async get(key, nextStore) {
    const hasValue = this.has(key);
    const ownValue = hasValue ? this.getValue(key) : undefined;

    if (ownValue !== undefined && !_.isPlainObject(ownValue)) {
      return ownValue;
    }

    const nextValue = await nextStore.get(key);

    if (!hasValue) {
      return _.merge({}, nextValue, this.getDeep(key, nextValue));
    }

    if (!_.isPlainObject(nextValue)) {
      return ownValue;
    }

    return _.merge(
      {},
      nextValue,
      hasValue ? ownValue : this.getDeep(key, nextValue),
    );
  }

  getDeep(prefix, value) {
    return Object.keys(value).reduce((acc, key) => {
      const fullKey = `${prefix}.${key}`;

      if (this.has(fullKey)) {
        return {
          ...acc,
          [key]: this.getValue(fullKey),
        };
      }

      if (_.isPlainObject(value[key])) {
        return {
          ...acc,
          [key]: this.getDeep(fullKey, value[key]),
        };
      }

      return acc;
    }, {});
  }
}

export default EnvStore;
