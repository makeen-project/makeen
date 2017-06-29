import { Module } from 'makeen';
import router from './router';

class Play extends Module {
  hooks = {
    'router:load': ({ addRouter }) => {
      this.addRouter = addRouter;
    },
  };

  async setup() {
    const [{ jwtMiddleware }] = await this.dependencies(['user', 'router']);
    this.addRouter('playRouter', router({ jwtMiddleware }));
  }
}

export default Play;
