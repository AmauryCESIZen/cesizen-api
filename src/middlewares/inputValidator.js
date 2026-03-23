import Joi from "joi";

const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: true,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      status: 400,
      message: error.details[0].message,
    });
  }

  req.body = value;
  next();
};

export const validateIdParam = (req, res, next) => {
  const idSchema = Joi.number().integer().positive().required();
  const { error, value } = idSchema.validate(req.params.id);

  if (error) {
    return res.status(400).json({ status: 400, message: "ID invalide." });
  }

  req.params.id = String(value);
  next();
};

export const createUserSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(8).max(72).required(),
});

export const updateUserSchema = Joi.object({
  email: Joi.string().email().max(255),
  password: Joi.string().min(8).max(72),
  role: Joi.string().valid("USER", "ADMIN"),
  statut: Joi.string().valid("ACTIF", "DESACTIVE"),
}).min(1);

export const validateCreateUser = validateBody(createUserSchema);
export const validateUpdateUser = validateBody(updateUserSchema);
