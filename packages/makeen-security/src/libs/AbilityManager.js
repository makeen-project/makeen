import Joi from 'joi';
import flattenDeep from 'lodash/flattenDeep';
import NotAllowed from '../errors/NotAllowed';

class AbilityManager {
  static generateCRUD(resource) {
    return ['create', 'read', 'update', 'delete'].map(action => ({
      ability: `${resource}.${action}`,
      description: `"${action}" action for the "${resource}" resource`,
    }));
  }

  constructor({ extractor = subject => subject.abilities }) {
    this.abilities = {};
    this.aliases = {
      view: 'read',
      access: 'read',
    };
    this.extractor = extractor;
    this.configure();
  }

  // eslint-disable-next-line class-methods-use-this
  configure() {}

  has(name) {
    return Object.keys(this.abilities).includes(name);
  }

  define(ability, rawConfig = {}) {
    if (Array.isArray(ability)) {
      return ability.forEach(({ ability: abilityName, ...itemConfig }) =>
        this.define(abilityName, { ...rawConfig, ...itemConfig }),
      );
    }

    const config = Joi.attempt(rawConfig, {
      description: Joi.string().default(`${ability} ability definition`),
      dependencies: Joi.array().default([]),
      check: Joi.func().default(() => true),
    });

    if (this.has(ability)) {
      throw new Error(
        `Can't add ability with a name of ${ability}. Already exists!`,
      );
    }

    const dependencies = flattenDeep(config.dependencies);

    dependencies.forEach(dependency => {
      if (!this.has(dependency)) {
        throw new Error(
          `Unable to find ability named "${dependency}" required as a dependency of "${ability}".`,
        );
      }
    });

    this.abilities[ability] = config;

    return this;
  }

  async can(subject, abilityName, object) {
    try {
      await this.check(subject, abilityName, object);
    } catch (err) {
      if (err instanceof NotAllowed) {
        return false;
      }

      throw err;
    }

    return true;
  }

  async checkAll(subject, abilities, object, parallel = true) {
    const walkAbilities = abilities.map(item => {
      if (Array.isArray(item)) {
        return () => this.checkAll(subject, item, object, !parallel);
      }
      return () => this.check(subject, item, object);
    });

    return parallel
      ? Promise.all(walkAbilities.map(task => task()))
      : walkAbilities.reduce(
          (promise, task) => promise.then(task),
          Promise.resolve(),
        );
  }

  async check(subject, abilityName, object) {
    const name = Object.keys(this.aliases).includes(abilityName)
      ? this.aliases[abilityName]
      : abilityName;

    if (!this.has(name)) {
      throw new Error(
        `Unable to find ability named "${name}" when checking access.`,
      );
    }

    const ability = this.abilities[name];

    await this.checkAll(subject, ability.dependencies, object);

    const subjectAbilities = await this.extractor(subject);

    if (!subjectAbilities.includes(name)) {
      throw new NotAllowed(`Failed ability check "${name}!"`);
    }

    const isAllowed = await ability.check(subject, object);

    if (!isAllowed) {
      throw new NotAllowed(`Failed ability check "${name}!"`);
    }
  }
}

export default AbilityManager;
