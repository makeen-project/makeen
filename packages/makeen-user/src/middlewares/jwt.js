import Boom from 'boom';
import jwt from 'express-jwt';
import { ObjectID as objectId } from 'mongodb';
import { helpers } from 'makeen';

const { createMiddleware } = helpers;

export default createMiddleware({
  id: 'jwt',
  factory: params => [
    jwt(params),
    async (req, res, next) => {
      try {
        const { id } = req.jwtPayload;
        const user = await req.app.modules
          .get('user')
          .UserRepository.findById(objectId(id));
        const account = await req.app.modules
          .get('user')
          .AccountRepository.findById(user.accountId);

        const canLogin = await req.app.modules.get('user').User.canLogin({
          user,
          account,
        });

        if (!canLogin) {
          throw Boom.unauthorized('Unable to find user!');
        }

        req.user = user;
      } catch (error) {
        return next(error);
      }

      return next();
    },
  ],
  params: {
    requestProperty: 'jwtPayload',
    getToken: req => req.headers.authorization || req.cookies.authToken,
  },
});
