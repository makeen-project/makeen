export default {
  id: 'permissions',
  factory: () => (req, res, next) => {
    if (req.user) {
      const { permissions } = req.app.modules.get('security');
      req.user.can = (...args) => permissions.check(...args);
    }

    return next();
  },
};
