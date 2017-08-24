import Joi from 'joi';
import get from 'lodash/get';
import flatten from 'lodash/flatten';
import { Module } from 'makeen';
import PermissionsManager from './libs/PermissionsManager';
import * as schemas from './schemas';
import SecurityServiceContainer from './services/Security';

class Security extends Module {
  static configSchema = {
    extractUserPermissions: Joi.func(),
  };

  name = 'makeen.security';
  hooks = {
    'makeen.security.permissionsExtractor': ({ security }) => user =>
      security.getUserPermissions({
        userId: user._id,
      }),
  };

  // eslint-disable-next-line class-methods-use-this
  buildExtractor(extractors) {
    return async user => {
      const permissionsLists = await Promise.all(
        extractors.map(extractor => extractor(user)),
      );
      return flatten(permissionsLists);
    };
  }

  async setup() {
    const [
      { createRepository },
      { registerServices },
    ] = await this.dependencies(['makeen.mongoDb', 'makeen.octobus']);

    const services = registerServices(this, {
      GroupRepository: createRepository({
        name: 'SecurityGroup',
        schema: schemas.group,
      }),
      UserRepository: createRepository({
        name: 'SecurityUser',
        schema: schemas.user,
      }),
      Security: new SecurityServiceContainer(),
    });

    const extractors = await this.createHook('permissionsExtractor', () => {}, {
      security: services.Security,
    });

    const permissionsManager = new PermissionsManager({
      extractor: this.buildExtractor(extractors),
    });

    await this.createHook(
      'definePermissions',
      module => {
        const modulePermissions = get(module, 'security.permissions');
        if (modulePermissions) {
          Object.keys(modulePermissions).forEach(permission => {
            permissionsManager.define(
              permission,
              modulePermissions[permission],
            );
          });
        }
      },
      {
        permissionsManager,
      },
    );

    this.export({
      ...services,
      permissionsManager,
    });
  }
}

export default Security;
