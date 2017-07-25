import Boom from 'boom';

export default (
  permissionName,
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
      .permissions.can(subject, permissionName, object);

    if (!isAllowed) {
      throw Boom.unauthorized(`Missing "${permissionName}" permission!`);
    }

    next();
  } catch (err) {
    next(err);
  }
};
