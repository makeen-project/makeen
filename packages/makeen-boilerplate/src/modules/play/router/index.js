/* eslint-disable class-methods-use-this */
import { Router } from 'makeen-router';

const { route } = Router;

export default ({ jwtMiddleware }) => {
  class PlayRouter extends Router {
    constructor(...args) {
      super(...args);
      this.addRouter(
        '/meh',
        new class extends Router {
          @route.get()
          woo() {
            return { yes: true };
          }
        }(),
      );
    }

    @route.get({
      path: '/',
    })
    index(req, res) {
      res.render('index.jsx');
    }

    @route.get({
      middlewares: [jwtMiddleware],
    })
    testvic2(req) {
      return req.user;
    }

    @route.get()
    testvictor(req, res) {
      res.json(req.cookies);
    }
  }

  const router = new PlayRouter();
  return router.toExpress();
};
