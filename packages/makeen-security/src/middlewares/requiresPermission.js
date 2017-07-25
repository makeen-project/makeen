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

  try {
    const isAllowed = await req.app.modules
      .get('security')
      .Security.can({ subject, permission, object });

    if (!isAllowed) {
      throw Boom.unauthorized(`Missing "${permission}" permission!`);
    }

    next();
  } catch (err) {
    next(err);
  }
};
