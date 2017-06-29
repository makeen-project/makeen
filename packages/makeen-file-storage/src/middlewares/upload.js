import multer from 'multer';
import { helpers } from 'makeen';

const { createMiddleware } = helpers;

export default createMiddleware({
  id: 'upload',
  factory: multer,
});
