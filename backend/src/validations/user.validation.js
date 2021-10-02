const Joi = require("joi");
const { roles } = require("../config/constants");

module.exports = {
  createUser: {
    body: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).max(128).required(),
      name: Joi.string().max(128),
      role: Joi.string().valid(...roles),
    }).options({ allowUnknown: true }),
  },

  updateUser: {
    body: Joi.object({
      email: Joi.string().email(),
      password: Joi.string(),
      name: Joi.string().max(128),
      role: Joi.string().valid(...roles),
    }).options({ allowUnknown: true }),
  },
};
