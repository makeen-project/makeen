import Joi from 'joi';

export default {
  _id: Joi.object(),
  name: Joi.string().required(),
  createdAt: Joi.date(),
  updatedAt: Joi.date(),
};
