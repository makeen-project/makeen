export default moduleName => serviceMap => (req, res, next) => {
  if (!req.services) {
    req.services = {};
  }

  const services = serviceMap || req.app.modules.get(moduleName);

  if (Array.isArray(services)) {
    services.forEach(key => {
      req.services[key] = req.app.modules.get(moduleName, key);
    });
  } else {
    Object.keys(services).forEach(key => {
      if (req.services[key]) {
        throw new Error(
          `Conflict detected for "${key}" key when injecting services!`,
        );
      }

      req.services[key] = req.app.modules.get(moduleName, services[key]);
    });
  }

  next();
};
