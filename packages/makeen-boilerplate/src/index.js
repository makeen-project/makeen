/* eslint-disable no-console */
import { Application } from 'makeen';
import expressReactViews from 'express-react-views';
import notifier from 'node-notifier';
import chalk from 'chalk';
import './env';
import config from './config';
import loadModules from './modules';
import loadMiddlewares from './config/loadMiddlewares';

const startTime = Date.now();
const app = new Application();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'js');
app.engine('jsx', expressReactViews.createEngine());

Promise.all([loadMiddlewares(config), loadModules(config), config.get('port')])
  .then(async ([middlewares, modules, port]) => {
    app.middlewares.push(...middlewares);
    app.modules.add(modules);
    app.listen(port).then(() => {
      const message = `Server started on port ${port} in ${Date.now() -
        startTime}ms!`;

      if (app.isDev) {
        notifier.notify({
          title: 'Makeen App',
          message,
          sound: true,
        });
      }

      console.log(chalk.bgBlue.white(message));
    });

    console.log(await config.get('port'));
  })
  .catch(console.log.bind(console));
