import get from 'lodash/get';
import { Module } from 'makeen';
import PermissionsManager from './libs/PermissionsManager';
import * as schemas from './schemas';
import SecurityServiceContainer from './services/Security';

class Security extends Module {
  static configSchema = {};

  initialize() {
    this.permissions = new PermissionsManager({
      extractor: user =>
        this.services.Security.getUserPermissions({
          userId: user._id,
        }),
    });
  }

  async setup() {
    const { permissions } = this;

    const [
      { createRepository },
      { registerServices },
    ] = await this.dependencies(['storage', 'octobus']);

    await this.manager.run(
      'permissions:define',
      module => {
        const modulePermissions = get(module, 'security.permissions');
        if (modulePermissions) {
          Object.keys(modulePermissions).forEach(permission => {
            permissions.define(permission, modulePermissions[permission]);
          });
        }
      },
      {
        permissions,
      },
    );

    this.services = registerServices(this, {
      GroupRepository: createRepository('SecurityGroup', schemas.group),
      UserRepository: createRepository('SecurityUser', schemas.user),
      Security: new SecurityServiceContainer(),
    });

    this.export({
      ...this.services,
      permissions,
    });
  }
}

export default Security;
