export default services => (req, res, next) => {
  if (!req.services) {
    req.services = {};
  }

  Object.keys(services).forEach(key => {
    if (req.services[key]) {
      throw new Error(
        `Conflict detected for "${key}" key when injecting services!`,
      );
    }

    req.services[key] = req.app.modules.get(services[key]);
  });

  next();
};
