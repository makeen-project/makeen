/* eslint-disable no-console */
import { Application } from 'makeen';
import expressReactViews from 'express-react-views';
import notifier from 'node-notifier';
import chalk from 'chalk';
import './env';
import Config from './config';
import modules from './modules';
import middlewares from './config/middlewares';

const startTime = Date.now();
const app = new Application();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'js');
app.engine('jsx', expressReactViews.createEngine());
app.middlewares.push(...middlewares);
app.modules.add(modules);

app
  .listen(Config.get('port'))
  .then(() => {
    const message = `Server started on port ${Config.get(
      'port',
    )} in ${Date.now() - startTime}ms!`;

    if (app.isDev) {
      notifier.notify({
        title: 'Makeen App',
        message,
        sound: true,
      });
    }

    console.log(chalk.bgBlue.white(message));
  })
  .catch(console.log.bind(console));
