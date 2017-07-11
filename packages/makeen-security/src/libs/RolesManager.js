import uniq from 'lodash/uniq';

class RolesManager {
  static ALL = '__ALL__';

  constructor() {
    this.roles = {};
  }

  isRoleValid(roleName) {
    if (!Object.keys(this.roles).includes(roleName)) {
      throw new Error(`Unknown role name: "${roleName}"!`);
    }
  }

  isRole(check, roleName) {
    this.isRoleValid(roleName);

    return (
      check === RolesManager.ALL ||
      check === roleName ||
      this.roles[roleName].includes(check)
    );
  }

  add(roleName, parents = []) {
    parents.forEach(_roleName => this.isRoleValid(_roleName));

    if (parents === '*') {
      this.roles[roleName] = RolesManager.ALL;
    } else {
      this.roles[roleName] = uniq(this.walk(parents));
    }

    return this;
  }

  getAll() {
    return Object.keys(this.roles);
  }

  walk(roles = []) {
    if (!roles.length) {
      return roles;
    }

    return roles.reduce(
      (acc, role) => acc.concat([role, ...this.walk(this.roles[role])]),
      [],
    );
  }
}

export default RolesManager;
