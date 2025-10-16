import Joi from 'joi';

export const validateRegister = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    phone: Joi.string().required(),
    role: Joi.string().valid('DONOR', 'CAREHOME').required(),
      registrationNo: Joi.when('role', {
      is: 'CAREHOME',
      then: Joi.string().pattern(/^RD/).required().messages({
        'string.pattern.base': 'Registration number must start with "RD"',
        'any.required': 'Registration number is required for care homes'
      }),
      otherwise: Joi.string().optional()
    }),
    category: Joi.when('role', {
      is: 'CAREHOME',
      then: Joi.string().valid('CHILDREN', 'ADULTS', 'SENIORS', 'DISABLED', 'GENERAL').required(),
      otherwise: Joi.string().optional()
    }),
    address: Joi.string().optional()
  });

  return schema.validate(data);
};

export const validateLogin = (data: any) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });

  return schema.validate(data);
};

export const validateEmail = (data: any) => {
  const schema = Joi.object({
    email: Joi.string().email().required()
  });

  return schema.validate(data);
};

export const validateResetPassword = (data: any) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    token: Joi.string().required(),
    newPassword: Joi.string().min(8).required()
  });

  return schema.validate(data);
};