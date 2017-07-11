import path from 'path';
import { Config, helpers } from 'makeen';
import randomstring from 'randomstring';

const rootDir = path.resolve(__dirname, '../../');
const jwtSecret = randomstring.generate();

Config.merge({
  rootDir,
  isDev: true,
  port: 3000,
  sentry: {
    dsn: '',
  },
  secrets: {
    jwt: jwtSecret,
  },
  paths: {
    web: path.resolve(rootDir, './web'),
  },
  session: {
    secret: '',
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
      jwtSecret,
      jwtConfig: {
        expiresIn: '1d',
      },
      mockUserMiddlewarePivot: {
        before: 'isMethod',
      },
      passportMiddlewarePivot: 'cookieParser',
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
      emailsDir: path.resolve(rootDir, './emails'),
      templatesDir: path.resolve(rootDir, './build/modules/mailer/templates'),
      middlewarePivot: {
        before: 'isMethod',
      },
    },
    fileStorage: {
      uploadDir: path.resolve(rootDir, './uploads'),
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
      logsDir: path.resolve(rootDir, './logs'),
    },
  },
});

Config.merge(helpers.loadFromENV('MAKEEN_CONFIG', Config.get()));

export default Config;
