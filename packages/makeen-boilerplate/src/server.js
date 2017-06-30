import { Application, Cache } from 'makeen';
import expressReactViews from 'express-react-views';
import Config from './config';
import modules from './modules';
import middlewares from './config/middlewares';

class Server extends Application {
  constructor(...args) {
    super(...args);

    this.set('views', `${__dirname}/views`);
    this.set('view engine', 'js');
    this.engine('jsx', expressReactViews.createEngine());
    this.config = Config;
    this.cache = new Cache();
    this.middlewares.push(...middlewares);
    this.modules.add(modules);
  }
}

export default Server;
