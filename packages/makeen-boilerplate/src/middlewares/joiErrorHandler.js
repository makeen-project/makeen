export default {
  id: 'joiErrorHandler',
  factory: () => (err, req, res, next) => {
    if (!err.isJoi) {
      return next(err);
    }

    return res.status(400).send({
      statusCode: 400,
      error: 'Bad Request',
      message: err.message,
      details: err.details,
    });
  },
};
