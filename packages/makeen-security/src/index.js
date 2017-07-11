import get from 'lodash/get';
import { Module } from 'makeen';
import RolesManager from './libs/RolesManager';
import PermissionsTree from './libs/PermissionsTree';

class Security extends Module {
  static configSchema = {};

  async setup() {
    const roles = new RolesManager();
    const permissions = new PermissionsTree();

    await this.manager.run(
      'roles:configure',
      module => {
        const moduleRoles = get(module, 'security.roles');
        if (moduleRoles) {
          Object.keys(moduleRoles).forEach(role => {
            roles.add(role, moduleRoles[role]);
          });
        }
      },
      {
        roles,
      },
    );

    await this.manager.run(
      'permissions:configure',
      module => {
        const modulePermissions = get(module, 'security.permissions');
        if (modulePermissions) {
          permissions.add(modulePermissions);
        }
      },
      {
        permissions,
      },
    );

    this.export({
      roles,
      permissions,
    });
  }
}

export default Security;
