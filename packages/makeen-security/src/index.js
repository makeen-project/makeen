import get from 'lodash/get';
import { Module } from 'makeen';
import PermissionsManager from './libs/PermissionsManager';

class Security extends Module {
  static configSchema = {};

  initialize() {
    this.permissions = new PermissionsManager({
      extractor: user => [
        ...(user.permissions || []),
        ...user.roles.reduce(
          (acc, role) => [...acc, ...(role.permissions || [])],
          [],
        ),
      ],
    });
  }

  async setup() {
    const { permissions } = this;

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
      permissions,
    });
  }
}

export default Security;
