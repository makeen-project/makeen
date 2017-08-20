import Joi from 'joi';
import { Module } from 'makeen';
import UserService from './services/User';
import UserRepositoryService from './services/UserRepository';
import AccountService from './services/Account';
import router from './router';
import * as gqlMiddlewares from './graphql/middlewares';
import jwtMiddleware from './middlewares/jwt';
import passportInitialize from './middlewares/passportInitialize';
import passportSession from './middlewares/passportSession';
import passportFactory from './libs/passport';
import mockUser from './middlewares/mockUser';
import * as schemas from './schemas';
import ForgotPasswordTemplate from './mailerTemplates/ForgotPassword';
import UserSignupTemplate from './mailerTemplates/UserSignup';

class User extends Module {
  static configSchema = {
    jwtSecret: Joi.string().required(),
    jwtConfig: Joi.object().required(),
    passportMiddlewarePivot: Joi.any(),
    mockUserMiddlewarePivot: Joi.any(),
    mockUserConfig: Joi.object().keys({
      path: Joi.string().default('/'),
      enabled: Joi.boolean().default(false),
      params: Joi.object().default({}),
    }),
    passportConfig: Joi.object()
      .keys({
        enabled: Joi.boolean().default(false),
      })
      .default({
        enabled: false,
      }),
    emailTemplates: Joi.object()
      .keys({
        forgotPassword: Joi.any().required(),
        userSignUp: Joi.any().required(),
      })
      .default({
        forgotPassword: ForgotPasswordTemplate,
        userSignUp: UserSignupTemplate,
      }),
    rootURL: Joi.string().required(),
    storageModule: Joi.string().default('makeen.mongoDb'),
    shemas: Joi.object()
      .keys({
        account: Joi.object().required(),
        user: Joi.object().required(),
        userLogin: Joi.object().required(),
      })
      .default(schemas),
  };

  name = 'makeen.user';

  hooks = {
    'makeen.router.load': () => {},
  };

  initialize({ jwtSecret }) {
    this.jwtMiddleware = jwtMiddleware({
      secret: jwtSecret,
    });
  }

  configurePassport(routerConfig) {
    const {
      passportConfig,
      passportMiddlewarePivot,
      jwtSecret,
    } = this.getConfig();

    if (!passportConfig.enabled) {
      return;
    }

    const passport = passportFactory({ jwtSecret });
    this.app.middlewares.insert(
      passportMiddlewarePivot,
      passportInitialize,
      passportSession,
    );
    this.export({ passport });
    Object.assign(routerConfig, { passport });
  }

  async setup({
    jwtSecret,
    jwtConfig,
    mockUserMiddlewarePivot,
    mockUserConfig,
    emailTemplates,
    rootURL,
    storageModule,
    schemas: {
      user: userSchema,
      account: accountSchema,
      userLogin: userLoginSchema,
    },
  }) {
    const [
      { createRepository, bindRepository },
      { createServiceBus },
      { addRouter },
    ] = await this.dependencies([
      storageModule,
      'makeen.octobus',
      'makeen.router',
    ]);
    const routerConfig = {
      jwtMiddleware: this.jwtMiddleware,
    };

    this.serviceBus = createServiceBus(this.name, [
      { matcher: /^makeen\.mailer/ },
    ]);

    const services = this.serviceBus.registerServices({
      User: new UserService({
        jwtConfig: {
          key: jwtSecret,
          options: jwtConfig,
        },
        emailTemplates,
        rootURL,
      }),
      UserRepository: bindRepository(new UserRepositoryService(userSchema)),
      Account: new AccountService(),
      AccountRepository: createRepository({
        name: 'Account',
        schema: accountSchema,
      }),
      UserLoginRepository: createRepository({
        name: 'UserLogin',
        schema: userLoginSchema,
      }),
    });

    this.export({
      ...services,
      gqlMiddlewares,
      jwtMiddleware: this.jwtMiddleware,
    });

    this.configurePassport(routerConfig);

    if (mockUserConfig.enabled) {
      this.app.middlewares.insert(mockUserMiddlewarePivot, {
        ...mockUser,
        ...mockUserConfig,
      });
    }

    addRouter('userRouter', router(routerConfig));
  }
}

export default User;
