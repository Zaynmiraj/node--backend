import { body, param, query } from 'express-validator';

/**
 * Common validation rules
 */
export const validators = {
  // Email validation
  email: () =>
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),

  // Password validation
  password: () =>
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),

  // Strong password validation
  strongPassword: () =>
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),

  // Name validation
  name: () =>
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),

  // Phone validation
  phone: () =>
    body('phone')
      .optional()
      .trim()
      .matches(/^[+]?[\d\s-]+$/)
      .withMessage('Please provide a valid phone number'),

  // UUID param validation
  uuidParam: (paramName: string = 'id') =>
    param(paramName).isUUID().withMessage(`Invalid ${paramName} format`),

  // Pagination query validation
  pagination: () => [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('sortBy')
      .optional()
      .isString()
      .withMessage('SortBy must be a string'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('SortOrder must be either asc or desc'),
  ],
};

export default validators;
