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

export const validateCreateCategory = validateBody(
  Joi.object({
    name: Joi.string().min(2).max(120).required(),
  }),
);

export const validateUpdateCategory = validateBody(
  Joi.object({
    name: Joi.string().min(2).max(120).required(),
  }),
);
