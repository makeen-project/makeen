// import session from 'express-session';
// import connectMongo from 'connect-mongo';
import * as middlewares from '../middlewares';

// const MongoStore = connectMongo(session);

export default async config => [
  {
    ...middlewares.sentryRequestHandler,
    params: await config.get('sentry.dsn'),
    enabled: !await config.get('isDev'),
  },
  middlewares.useragent,
  middlewares.cors,
  middlewares.helmet,
  {
    ...middlewares.morgan,
    params: await config.get('morgan.format'),
    enabled: await config.get('isDev'),
  },
  {
    ...middlewares.compression,
    enabled: !await config.get('isDev'),
  },
  {
    ...middlewares.bodyParserJSON,
    params: { limit: await config.get('maxUploadSize') },
  },
  middlewares.bodyParserURLEncoded,
  {
    ...middlewares.cookieParser,
    params: {
      secret: await config.get('session.secret'),
    },
  },
  // {
  //   ...middlewares.session,
  //   params: {
  //     ...await config.get('session'),
  //     store: new MongoStore({
  //       url: `mongodb://${await config.get('modules.storage.connection.host')}:${await config.get(
  //         'modules.storage.connection.port',
  //       )}/${await config.get('modules.storage.connection.db')}`,
  //     }),
  //   },
  // },
  {
    ...middlewares.statusMonitor,
    enabled: true,
  },
  middlewares.isMethod,
  {
    ...middlewares.sentryErrorHandler,
    enabled: !await config.get('isDev'),
  },
  middlewares.joiErrorHandler,
  {
    ...middlewares.boomErrorHandler,
    params: {
      ...middlewares.boomErrorHandler.params,
      isDev: await config.get('isDev'),
    },
  },
  {
    ...middlewares.errorHandler,
    params: {
      ...middlewares.errorHandler.params,
      isDev: await config.get('isDev'),
    },
  },
];
