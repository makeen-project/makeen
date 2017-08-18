import Boom from 'boom';

export default (
  permission,
  options = {
    getSubject: req => req.user || {},
    getObject: () => {},
  },
) => async (req, res, next) => {
  const subject = options.getSubject(req);
  const object = options.getObject(req);
  const { Security } = req.app.modules.get('makeen.security');

  try {
    const isAllowed = await Security.can({ subject, permission, object });

    if (!isAllowed) {
      throw Boom.unauthorized(`Missing "${permission}" permission!`);
    }

    next();
  } catch (err) {
    next(err);
  }
};
