import Joi from 'joi';

export default {
  _id: Joi.object(),
  owner: Joi.string().required(),
  resource: Joi.string().required(),
  permissions: Joi.array().items(
    Joi.object().keys({
      name: Joi.string().required(),
      options: Joi.any().default({}),
    }),
  ),
};
