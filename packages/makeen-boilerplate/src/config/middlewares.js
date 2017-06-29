// import session from 'express-session';
// import connectMongo from 'connect-mongo';
import Config from './index';
import * as middlewares from '../middlewares';

// const MongoStore = connectMongo(session);

export default [
  {
    ...middlewares.sentryRequestHandler,
    params: Config.get('sentry.dsn'),
    enabled: !Config.get('isDev'),
  },
  middlewares.useragent,
  middlewares.cors,
  middlewares.helmet,
  {
    ...middlewares.morgan,
    params: Config.get('morgan.format'),
    enabled: Config.get('isDev'),
  },
  {
    ...middlewares.compression,
    enabled: !Config.get('isDev'),
  },
  {
    ...middlewares.bodyParserJSON,
    params: { limit: Config.get('maxUploadSize') },
  },
  middlewares.bodyParserURLEncoded,
  {
    ...middlewares.cookieParser,
    params: {
      secret: Config.get('session.secret'),
    },
  },
  // {
  //   ...middlewares.session,
  //   params: {
  //     ...Config.get('session'),
  //     store: new MongoStore({
  //       url: `mongodb://${Config.get('modules.storage.connection.host')}:${Config.get(
  //         'modules.storage.connection.port',
  //       )}/${Config.get('modules.storage.connection.db')}`,
  //     }),
  //   },
  // },
  {
    ...middlewares.statusMonitor,
    enabled: true,
  },
  middlewares.isMethod,
  middlewares.celebrateErrors,
  {
    ...middlewares.sentryErrorHandler,
    enabled: !Config.get('isDev'),
  },
  {
    ...middlewares.errorHandler,
    params: {
      isDev: Config.get('isDev'),
    },
  },
];
