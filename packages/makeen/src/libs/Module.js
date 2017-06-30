/* eslint-disable no-underscore-dangle */
import Joi from 'joi';
import getPath from 'lodash/get';
import camelCase from 'lodash/camelCase';

class Module {
  constructor(config = {}) {
    if (!this.name) {
      this.name = camelCase(this.constructor.name);
    }

    this.config = this.constructor.configSchema
      ? Joi.attempt(config, this.constructor.configSchema)
      : config;

    this.filePath = new Error().stack
      .toString()
      .split(/\r\n|\n/)[2]
      .match(/\((.*.js)/)[1];
    this.hooks = {};
  }

  initialize(config, manager) {} // eslint-disable-line
  setup(config, manager) {} // eslint-disable-line

  getConfig(key, defaultValue) {
    return key ? getPath(this.config, key, defaultValue) : this.config;
  }

  get manager() {
    if (!this._manager) {
      throw new Error(
        "Can't get access to the manager - you need to connect the module first!",
      );
    }

    return this._manager;
  }

  get app() {
    return this.context.app;
  }

  get context() {
    return this.manager.context;
  }

  export(map) {
    return Object.assign(this.manager.exportMap[this.name], map);
  }

  connect(manager) {
    this._manager = manager;
    this.emit('before:initialize');
    this.initialize(this.config, manager);
    this.emit('after:initialize');
  }

  async load() {
    this.emit('before:setup');
    await this.setup(this.config);
    this.emit('after:setup');
  }

  dependency(dependency) {
    if (typeof dependency !== 'string') {
      throw new Error(`Unexpected dependency name: ${dependency}!`);
    }
    this.manager.addDependency(this.name, dependency);
    return this.manager.loads[dependency];
  }

  dependencies(dependencies) {
    return Promise.all(dependencies.map(this.dependency.bind(this)));
  }

  on(...args) {
    this.manager.on(...args);
  }

  once(...args) {
    this.manager.once(...args);
  }

  emit(event, ...args) {
    return this.manager.emit(
      `module:${this.name}:${event}`,
      ...args.concat([this]),
    );
  }
}

export default Module;
