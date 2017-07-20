export default {
  id: 'joiErrorHandler',
  factory: () => (err, req, res, next) => {
    if (!err.isJoi) {
      return next(err);
    }

    const error = {
      statusCode: 400,
      error: 'Bad Request',
      details: err.details,
      validation: {
        keys: [],
      },
    };

    return res.status(400).send(error);
  },
};
