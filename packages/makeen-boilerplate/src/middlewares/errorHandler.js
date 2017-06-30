import devErrorHandler from 'errorhandler';

const errorHandler = (err, req, res, next) => {
  if (err.isBoom && err.output.statusCode < 500) {
    return res.status(err.output.statusCode).json(err.output.payload);
  }

  req.app.modules.get('logger.log').error(err);

  res.status(500);
  res.json({
    message: 'Internal server error!',
  });

  return next(err);
};

export default {
  id: 'errorHandler',
  factory: ({ isDev }) => (isDev ? devErrorHandler() : errorHandler),
};
