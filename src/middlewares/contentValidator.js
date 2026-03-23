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

export const validateCreateContent = validateBody(
  Joi.object({
    title: Joi.string().min(3).max(200).required(),
    body: Joi.string().min(10).required(),
    categoryIds: Joi.array()
      .items(Joi.number().integer().positive())
      .default([]),
  }),
);

export const validateUpdateContent = validateBody(
  Joi.object({
    title: Joi.string().min(3).max(200),
    body: Joi.string().min(10),
    status: Joi.string().valid("BROUILLON", "PUBLIE"),
    categoryIds: Joi.array().items(Joi.number().integer().positive()),
  }).min(1),
);
