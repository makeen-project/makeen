import { Module } from 'makeen';

class Admin extends Module {
  hooks = {
    'permissions:define': ({ permissionsManager }) => {
      permissionsManager
        .define('p21')
        .define('admin', {
          check: user => user.email === 'zamfir.victor@gmail.com',
          dependencies: ['p21'],
        })
        .define('p1');
    },
  };

  async setup() {
    await this.dependency('security');
  }
}

export default Admin;
