const Joi = require("joi");

module.exports = {
  createOrder: {
    body: Joi.object({
      meals: Joi.array().items({
        id: Joi.string()
          .regex(/^[a-fA-F0-9]{24}$/)
          .required(),
        count: Joi.number().required(),
      }),
      restaurantId: Joi.string()
        .regex(/^[a-fA-F0-9]{24}$/)
        .required(),
    }).options({ allowUnknown: true }),
  },
};
