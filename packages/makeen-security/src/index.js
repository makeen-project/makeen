import Joi from 'joi';
import get from 'lodash/get';
import { Module } from 'makeen';
import PermissionsManager from './libs/PermissionsManager';
import * as schemas from './schemas';
import SecurityServiceContainer from './services/Security';

class Security extends Module {
  static configSchema = {
    extractUserPermissions: Joi.func(),
  };

  initialize({ extractUserPermissions }) {
    const extractor = user =>
      this.services.Security.getUserPermissions({
        userId: user._id,
      });

    this.permissionsManager = new PermissionsManager({
      extractor: extractUserPermissions || extractor,
    });
  }

  async setup() {
    const { permissionsManager } = this;

    const [
      { createRepository },
      { registerServices },
    ] = await this.dependencies(['mongoDb', 'octobus']);

    await this.manager.run(
      'permissions:define',
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

    this.services = registerServices(this, {
      GroupRepository: createRepository({
        name: 'SecurityGroup',
        schema: schemas.group,
      }),
      UserRepository: createRepository({
        name: 'SecurityUser',
        schema: schemas.user,
      }),
      Security: new SecurityServiceContainer(this.permissionsManager),
    });

    this.export({
      ...this.services,
      permissionsManager,
    });
  }
}

export default Security;
