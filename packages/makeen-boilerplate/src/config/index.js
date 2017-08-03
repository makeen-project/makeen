import path from 'path';
import Config from 'makeen-config';
import MemoryStore from 'makeen-config/build/stores/Memory';
import ENVStore from 'makeen-config/build/stores/Env';
import randomstring from 'randomstring';

const config = new Config();
const memoryStore = new MemoryStore();
const envStore = new ENVStore('MAKEEN_CONFIG');
config.addStore(memoryStore);
config.addStore(envStore);
const rootDir = path.resolve(__dirname, '../../');

memoryStore.merge({
  rootDir,
  rootURL: 'http://localhost:3000',
  isDev: process.env.NODE_ENV === 'development',
  port: 3000,
  sentry: {
    dsn: '',
  },
  secrets: {
    jwt: randomstring.generate(),
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
      jwtConfig: {
        expiresIn: '1d',
      },
      mockUserMiddlewarePivot: {
        before: 'isMethod',
      },
      passportMiddlewarePivot: 'cookieParser',
      mockUserConfig: {
        enabled: true,
        path: '/graphiql',
        params: {
          email: '',
        },
      },
      passportConfig: {
        enabled: false,
      },
      rootURL: 'http://localhost:3000',
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

memoryStore.set('modules.user.jwtSecret', memoryStore.get('secrets.jwt'));

export default config;
