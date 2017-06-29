/* eslint-disable no-console */
import path from 'path';
import Table from 'cli-table';
import { inspect } from 'util';
import { Logger, transports as loggerTransports } from 'winston';
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
    this.logger = new Logger({
      transports: [
        new loggerTransports.Console({
          colorize: true,
        }),
        new loggerTransports.File({
          filename: path.join(Config.get('logsDir'), 'logs.log'),
          level: 'error',
          handleExceptions: true,
          humanReadableUnhandledException: true,
        }),
      ],
    });

    if (this.isDev) {
      const modulesTable = new Table({
        head: ['Modules'],
      });

      this.modules.on('module:loaded', module => {
        modulesTable.push([module.name]);
      });

      this.on('after:boot', () => {
        console.log(modulesTable.toString());

        console.log(this.modules.expandedDependencyGraph);

        const table = new Table({
          head: ['Id', 'Path', 'Params'],
        });

        this.middlewares
          .reject({ enabled: false })
          .forEach(({ path: mPath, id, params }) => {
            table.push([
              id,
              mPath || '/',
              typeof params !== 'undefined' ? inspect(params) : 'N/A',
            ]);
          });

        console.log(table.toString());
      });
    }

    this.middlewares.push(...middlewares);

    this.modules.add(modules);
  }
}

export default Server;
