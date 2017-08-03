import { Router } from 'express';
import requiresPermission from 'makeen-security/build/middlewares/requiresPermission';

const router = Router();

router.get(
  '/admin',
  requiresPermission('admin'),
  requiresPermission('p21'),
  (req, res) => res.send('admin area'),
);

export default router;
