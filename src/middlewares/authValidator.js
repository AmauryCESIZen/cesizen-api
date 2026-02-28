import Joi from "joi";

const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: true,
    stripUnknown: true,
  });

  if (error) {
    return res
      .status(400)
      .json({ status: 400, message: error.details[0].message });
  }

  req.body = value;
  next();
};

const registerSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(8).max(72).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(1).max(72).required(),
});

export const validateRegister = validateBody(registerSchema);
export const validateLogin = validateBody(loginSchema);
