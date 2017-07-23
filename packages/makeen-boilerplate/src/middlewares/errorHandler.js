import errorHandlerFactory from 'errorhandler';

const errorHandler = errorHandlerFactory();

export default {
  id: 'errorHandler',
  factory: ({ isDev }) => (err, req, res, next) => {
    if (err.isJoi) {
      return res.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: err.message,
        details: err.details,
      });
    }

    if (err.isBoom && (err.output.statusCode < 500 || isDev)) {
      return res.status(err.output.statusCode).json(err.output.payload);
    }

    if (isDev) {
      return errorHandler(err, req, res, next);
    }

    req.app.modules.get('logger.log').error(err);

    res.status(500);
    return res.json({
      message: 'Internal server error!',
    });
  },
};
