const Joi = require("joi");

module.exports = {
  createMeal: {
    body: Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      price: Joi.number().min(0).required(),
    }).options({ allowUnknown: true }),
  },

  updateMeal: {
    body: Joi.object({
      name: Joi.string(),
      description: Joi.string(),
      price: Joi.number().min(0),
    }).options({ allowUnknown: true }),
  },
};
