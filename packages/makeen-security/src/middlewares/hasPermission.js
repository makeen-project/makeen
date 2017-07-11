import Boom from 'boom';

export default (
  permissionName,
  params,
  options = {
    getPermissions: req => req.app.modules.get('security').permissions,
    getSubject: req => req.user,
  },
) => async (req, res, next) => {
  const permissions = options.getPermissions(req);
  const subject = options.getSubject(req);
  const finalParams = typeof params === 'function' ? params(req) : params;

  try {
    const isAllowed = await permissions.check(
      subject,
      permissionName,
      finalParams,
    );
    if (!isAllowed) {
      throw Boom.unauthorized(`Invalid permission: ${permissionName}!`);
    }

    next();
  } catch (err) {
    next(err);
  }
};
