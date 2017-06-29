import Boom from 'boom';
import Joi from 'joi';
import { ObjectID as objectId } from 'mongodb';
import { Router } from 'express';
import { helpers } from 'makeen-router';

const { wrapHandler, idValidator } = helpers;

export default ({ uploadMiddleware }) => {
  const router = Router();

  router.param('id', async (req, res, next, rawId) => {
    const { error, value } = Joi.validate(rawId, idValidator);

    if (error) {
      return next(error);
    }

    const id = objectId(value);

    try {
      const file = await req.app.modules
        .get('fileStorage')
        .FileRepository.findById(id);

      if (!file) {
        return next(Boom.notFound(`Unable to find entity with id ${rawId}`));
      }

      req.fileEntity = file;
    } catch (err) {
      return next(err);
    }

    return next();
  });

  router.post(
    '/files/upload',
    uploadMiddleware.single('file'),
    wrapHandler(req =>
      req.app.modules.get('fileStorage').File.createFromUpload({
        filename: req.file.originalname,
        path: req.file.path,
        size: req.file.size,
        mimeType: req.file.mimetype,
        uploadDir: req.file.destination,
      }),
    ),
  );

  router.get('/files/:id/download', async (req, res, next) => {
    try {
      const filePath = await req.app.modules.get('fileStorage').File.getPath({
        file: req.fileEntity,
      });
      res.sendFile(filePath);
    } catch (err) {
      next(err);
    }
  });

  return router;
};
