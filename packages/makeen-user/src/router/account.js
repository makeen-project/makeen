import Joi from 'joi';
import { Router } from 'express';
import celebrate from 'celebrate';
import { ObjectID as objectId } from 'mongodb';
import { helpers } from 'makeen-router';

const { wrapHandler, idValidator } = helpers;
const router = Router();

router.get(
  '/:id/confirm',
  celebrate({
    params: {
      id: idValidator,
    },
  }),
  wrapHandler(async req => {
    const { Account } = req.app.modules.get('user');
    return Account.confirm(objectId(req.params.id));
  }),
);

router.post(
  '/resend-activation-email',
  celebrate({
    body: {
      email: Joi.string().required().email(),
    },
  }),
  wrapHandler(async req => {
    const { Account } = req.app.modules.get('user');
    const { email } = req.body;

    await Account.resendActivationEmail({ email });

    return { ok: true };
  }),
);

export default router;
