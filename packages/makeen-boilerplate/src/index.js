/* eslint-disable no-console */
import notifier from 'node-notifier';
import chalk from 'chalk';
import './env';
import Server from './server';

const startTime = Date.now();
const app = new Server();

app
  .listen(app.config.get('port'))
  .then(() => {
    const message = `Server started on port ${app.config.get(
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
