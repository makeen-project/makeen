export default {
  id: 'mockUser',
  factory: query => async (req, res, next) => {
    try {
      if (!req.user) {
        req.user = await req.app.messageBus.call(
          'user.UserRepository.findOne',
          {
            query,
          },
        );
      }
    } catch (err) {
      return next(err);
    }

    return next();
  },
  params: {},
};
