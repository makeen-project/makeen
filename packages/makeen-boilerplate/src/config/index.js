import path from 'path';
import { Config } from 'makeen';

const isDev = process.env.NODE_ENV === 'development';

Config.merge({
  isDev,
  port: process.env.PORT || 3000,
  sentry: {
    dsn: process.env.SENTRY_DSN,
  },
  secrets: {
    jwt: process.env.JWT_SECRET,
  },
  paths: {
    web: path.resolve(__dirname, '../../web'),
  },
  session: {
    secret: process.env.SESSION_SECRET,
    name: 'sessionId',
    resave: false,
    saveUninitialized: false,
  },
  morgan: {
    format: 'dev',
  },
  maxUploadSize: '20mb',
  modules: {
    storage: {
      connection: {
        db: 'makeen-boilerplate',
        host: 'localhost',
        port: 27017,
      },
    },
    user: {
      jwtSecret: process.env.JWT_SECRET,
      jwtConfig: {
        expiresIn: '1d',
      },
      mockUserMiddlewarePivot: {
        before: 'isMethod',
      },
      mockUserConfig: {
        enabled: true,
        path: '/graphql',
        params: {},
      },
      passportConfig: {
        enabled: false,
      },
    },
    mailer: {
      transport: {
        jsonTransport: true,
      },
      saveToDisk: true,
      emailsDir: path.resolve(__dirname, '../../emails'),
      templatesDir: path.resolve(__dirname, '../modules/mailer/templates'),
      middlewarePivot: {
        before: 'isMethod',
      },
    },
    fileStorage: {
      uploadDir: path.resolve(__dirname, '../../uploads'),
    },
    gql: {
      graphiql: {
        enabled: true,
      },
    },
    router: {
      middlewarePivot: {
        after: 'isMethod',
      },
    },
    logger: {
      logsDir: path.resolve(__dirname, '../../logs'),
    },
  },
});

export default Config;
