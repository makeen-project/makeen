import Boom from 'boom';

export default (
  abilityName,
  options = {
    getSubject: req => req.user,
    getObject: () => {},
  },
) => async (req, res, next) => {
  const subject = options.getSubject(req);
  const object = options.getObject(req);

  try {
    const isAllowed = await req.app.modules
      .get('security')
      .abilities.can(subject, abilityName, object);

    if (!isAllowed) {
      throw Boom.unauthorized(`Missing "${abilityName}" ability!`);
    }

    next();
  } catch (err) {
    next(err);
  }
};
