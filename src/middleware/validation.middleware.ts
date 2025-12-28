import { Request, Response, NextFunction } from 'express';
import Joi, { Schema, ValidationError as JoiValidationError } from 'joi';
import { sendValidationError } from '../helpers/response.helper';

/**
 * Validation source - where to look for data to validate
 */
export type ValidationSource = 'body' | 'query' | 'params' | 'headers';

/**
 * Validation schema configuration
 */
export interface ValidationConfig {
  body?: Schema;
  query?: Schema;
  params?: Schema;
  headers?: Schema;
}

/**
 * Generic validation middleware factory
 * Use this to validate any incoming request data
 * 
 * @example
 * // In routes:
 * router.post('/users', validateRequest({
 *   body: Joi.object({
 *     email: Joi.string().email().required(),
 *     password: Joi.string().min(6).required(),
 *   })
 * }), userController.create);
 */
export const validateRequest = (config: ValidationConfig) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors: Array<{ field: string; message: string; source: string }> = [];

    // Validate each source if schema provided
    const sources: ValidationSource[] = ['body', 'query', 'params', 'headers'];

    for (const source of sources) {
      const schema = config[source];
      if (schema) {
        const { error, value } = schema.validate(req[source], {
          abortEarly: false,
          stripUnknown: source === 'body', // Only strip unknown from body
          allowUnknown: source === 'headers', // Allow unknown headers
        });

        if (error) {
          error.details.forEach((detail) => {
            errors.push({
              field: detail.path.join('.'),
              message: detail.message.replace(/['"]/g, ''),
              source,
            });
          });
        } else {
          // Replace with validated and sanitized value
          if (source === 'body') req.body = value;
          else if (source === 'query') req.query = value;
          else if (source === 'params') req.params = value;
        }
      }
    }

    if (errors.length > 0) {
      sendValidationError(res, errors);
      return;
    }

    next();
  };
};

/**
 * Common Joi schemas for reuse
 */
export const schemas = {
  // ID validation
  id: Joi.string().uuid().required().messages({
    'string.guid': 'Invalid ID format',
    'any.required': 'ID is required',
  }),

  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  }),

  // Email
  email: Joi.string().email().lowercase().trim().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),

  // Password
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
  }),

  // Strong password
  strongPassword: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base':
        'Password must contain uppercase, lowercase, number, and special character',
      'any.required': 'Password is required',
    }),

  // Name
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters',
    'string.max': 'Name cannot exceed 100 characters',
    'any.required': 'Name is required',
  }),

  // Phone
  phone: Joi.string()
    .pattern(/^[+]?[\d\s-]+$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number',
    }),

  // Boolean
  boolean: Joi.boolean(),

  // Date
  date: Joi.date().iso().messages({
    'date.format': 'Invalid date format. Use ISO 8601 format',
  }),

  // Array of strings
  stringArray: Joi.array().items(Joi.string()),

  // URL
  url: Joi.string().uri().messages({
    'string.uri': 'Please provide a valid URL',
  }),
};

/**
 * Pre-built validation schemas for common operations
 */
export const validationSchemas = {
  // User registration
  userRegister: {
    body: Joi.object({
      email: schemas.email,
      password: schemas.password,
      name: schemas.name,
      phone: schemas.phone,
    }),
  },

  // User login
  userLogin: {
    body: Joi.object({
      email: schemas.email,
      password: Joi.string().required().messages({
        'any.required': 'Password is required',
      }),
    }),
  },

  // Update profile
  updateProfile: {
    body: Joi.object({
      name: schemas.name.optional(),
      phone: schemas.phone,
      avatar: schemas.url.optional(),
    }),
  },

  // ID param
  idParam: {
    params: Joi.object({
      id: schemas.id,
    }),
  },

  // Pagination query
  paginationQuery: {
    query: schemas.pagination,
  },
};

// Re-export Joi for custom schemas
export { Joi };
