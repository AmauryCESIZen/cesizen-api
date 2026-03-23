import Joi from "joi";

const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: true,
    stripUnknown: true,
  });
  if (error)
    return res
      .status(400)
      .json({ status: 400, message: error.details[0].message });
  req.body = value;
  next();
};

export const validateCreatePreset = validateBody(
  Joi.object({
    code: Joi.string().min(2).max(10).required(), // ex: 748, 55, 46
    inspiration_s: Joi.number().integer().positive().required(),
    apnee_s: Joi.number().integer().min(0).required(),
    expiration_s: Joi.number().integer().positive().required(),
    actif: Joi.boolean().default(true),
  }),
);

export const validateUpdatePreset = validateBody(
  Joi.object({
    code: Joi.string().min(2).max(10),
    inspiration_s: Joi.number().integer().positive(),
    apnee_s: Joi.number().integer().min(0),
    expiration_s: Joi.number().integer().positive(),
    actif: Joi.boolean(),
  }).min(1),
);
