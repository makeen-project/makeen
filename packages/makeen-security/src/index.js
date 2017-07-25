import get from 'lodash/get';
import { Module } from 'makeen';
import PermissionsManager from './libs/PermissionsManager';
import * as schemas from './schemas';
import SecurityServiceContainer from './services/Security';

class Security extends Module {
  static configSchema = {};

  initialize() {
    this.permissions = new PermissionsManager({
      extractor: user => [
        ...(user.permissions || []),
        ...user.groups.reduce(
          (acc, group) => [...acc, ...(group.permissions || [])],
          [],
        ),
      ],
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

    this.export({
      ...registerServices(this, {
        GroupRepository: createRepository('SecurityGroup', schemas.group),
        UserRepository: createRepository('SecurityUser', schemas.user),
        Security: new SecurityServiceContainer(),
      }),
      permissions,
    });
  }
}

export default Security;
