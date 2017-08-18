export default {
  Query: {
    users: (_, args, { app, fromMongo }) =>
      app.modules
        .get('makeen.user')
        .UserRepository.findMany()
        .then(c => c.map(fromMongo).toArray()),
  },
  Mutation: {
    login: async (_, { username, password }, { app, req, fromMongo }) => {
      const { User, UserLoginRepository } = app.modules.get('makeen.user');

      const result = await User.login({ username, password });
      const user = await User.dump(result);

      await UserLoginRepository.createOne({
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
