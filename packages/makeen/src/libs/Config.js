import _ from 'lodash';

let isFrozen = false;
const protect = () => {
  if (isFrozen) {
    throw new Error('Cannot change config object!');
  }
};

const store = {};
const get = (key, defaultValue) => {
  if (!key) {
    return store;
  }
  return _.get(store, key, defaultValue);
};
const set = (key, value) => {
  protect();
  _.set(store, key, value);
  return this;
};
const merge = data => {
  protect();
  _.merge(store, data);
  return this;
};
const has = key => _.has(store, key);
const freeze = () => {
  isFrozen = true;
  return this;
};

export default {
  get,
  set,
  has,
  freeze,
  merge,
};
