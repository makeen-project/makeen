import { helpers } from 'makeen';

const { fromMongo } = helpers;

export default {
  Query: {
    users: (_, args, { app }) =>
      app.modules
        .get('user')
        .UserRepository.findMany()
        .then(c => c.map(fromMongo).toArray()),
  },
  Mutation: {
    login: async (_, { username, password }, { app, req }) => {
      const result = await app.modules
        .get('user')
        .User.login({ username, password });
      const user = await app.modules.get('user').User.dump(result);

      await app.modules.get('user').UserLoginRepository.createOne({
        userId: user._id,
        ip: req.ip,
        browser: req.useragent.browser,
        os: req.useragent.os,
        platform: req.useragent.platform,
      });

      return fromMongo(user);
    },
  },
};
