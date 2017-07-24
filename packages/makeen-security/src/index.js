import get from 'lodash/get';
import { Module } from 'makeen';
import AbilityManager from './libs/AbilityManager';

class Security extends Module {
  static configSchema = {};

  initialize() {
    this.abilities = new AbilityManager({
      extractor: user => [
        ...(user.abilities || []),
        ...user.roles.reduce(
          (acc, role) => [...acc, ...(role.abilities || [])],
          [],
        ),
      ],
    });
  }

  async setup() {
    const { abilities } = this;

    await this.manager.run(
      'abilities:define',
      module => {
        const moduleAbilities = get(module, 'security.abilities');
        if (moduleAbilities) {
          Object.keys(moduleAbilities).forEach(ability => {
            abilities.define(ability, moduleAbilities[ability]);
          });
        }
      },
      {
        abilities,
      },
    );

    this.export({
      abilities,
    });
  }
}

export default Security;
