import Joi from 'joi';
import { Module } from 'makeen';
import UserService from './services/User';
import UserRepositoryService from './services/UserRepository';
import AccountService from './services/Account';
import accountSchema from './schemas/account';
import userLoginSchema from './schemas/userLogin';
import router from './router';
import * as gqlMiddlewares from './graphql/middlewares';
import jwtMiddleware from './middlewares/jwt';
import passportInitialize from './middlewares/passportInitialize';
import passportSession from './middlewares/passportSession';
import passportFactory from './libs/passport';
import mockUser from './middlewares/mockUser';

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
  };

  initialize({ jwtSecret }) {
    this.jwtMiddleware = jwtMiddleware({
      secret: jwtSecret,
    });

    this.router = router({
      jwtMiddleware,
    });
  }

  async setup({
    jwtSecret,
    jwtConfig,
    passportConfig,
    passportMiddlewarePivot,
    mockUserMiddlewarePivot,
    mockUserConfig,
  }) {
    const exportMap = {};
    const { createRepository } = await this.dependency('storage');
    this.createServiceBus([{ matcher: /^mailer/ }]);

    Object.assign(exportMap, {
      ...this.registerServices({
        User: new UserService({
          jwtConfig: {
            key: jwtSecret,
            options: jwtConfig,
          },
        }),
        UserRepository: new UserRepositoryService(),
        Account: new AccountService(),
        AccountRepository: createRepository('Account', accountSchema),
        UserLoginRepository: createRepository('UserLogin', userLoginSchema),
      }),
      gqlMiddlewares,
      jwtMiddleware: this.jwtMiddleware,
    });

    if (passportConfig.enabled) {
      const passport = passportFactory({ jwtSecret });
      this.app.middlewares.insert(
        passportMiddlewarePivot,
        passportInitialize,
        passportSession,
      );
      Object.assign(exportMap, {
        passport,
      });
    }

    if (mockUserConfig.enabled) {
      this.app.middlewares.insert(mockUserMiddlewarePivot, {
        ...mockUser,
        ...mockUserConfig,
      });
    }

    this.export(exportMap);
  }
}

export default User;
