import Joi from 'joi';

export default {
  _id: Joi.object(),
  userId: Joi.object().required(),
  groupIds: Joi.array().items(Joi.object()).default([]),
  permissions: Joi.array().items(Joi.string().required()).default([]),
  createdAt: Joi.date(),
  updatedAt: Joi.date(),
};
