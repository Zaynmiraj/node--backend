import { Router } from 'express';
import * as roleController from '../controllers/role.controller';
import { authenticate, authorizeType, authorizeRole } from '../middleware/auth.middleware';
import { validateRequest, Joi, schemas } from '../middleware/validation.middleware';
import { cacheMiddleware } from '../middleware/cache.middleware';

const router = Router();

// Role validation schemas
const roleSchemas = {
  createRole: {
    body: Joi.object({
      name: Joi.string().min(2).max(50).required().messages({
        'string.min': 'Role name must be at least 2 characters',
        'any.required': 'Role name is required',
      }),
      slug: Joi.string()
        .min(2)
        .max(50)
        .lowercase()
        .pattern(/^[a-z0-9_-]+$/)
        .required()
        .messages({
          'string.pattern.base': 'Slug can only contain lowercase letters, numbers, hyphens, and underscores',
          'any.required': 'Slug is required',
        }),
      description: Joi.string().max(255).optional(),
      permissions: Joi.array().items(Joi.string()).optional(),
      isDefault: Joi.boolean().optional(),
    }),
  },
  updateRole: {
    body: Joi.object({
      name: Joi.string().min(2).max(50).optional(),
      description: Joi.string().max(255).optional(),
      permissions: Joi.array().items(Joi.string()).optional(),
      isActive: Joi.boolean().optional(),
    }),
  },
  idParam: {
    params: Joi.object({
      id: schemas.id,
    }),
  },
};

// All role routes require admin authentication
router.use(authenticate, authorizeType('admin'));

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Roles retrieved successfully
 */
router.get('/', cacheMiddleware(300), roleController.getAllRoles);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, slug]
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               description:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Role created successfully
 */
router.post(
  '/',
  authorizeRole('SUPER_ADMIN'),
  validateRequest(roleSchemas.createRole),
  roleController.createRole
);

/**
 * @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: Get role by ID
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Role retrieved successfully
 */
router.get(
  '/:id',
  validateRequest(roleSchemas.idParam),
  cacheMiddleware(300),
  roleController.getRoleById
);

/**
 * @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: Update role
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Role updated successfully
 */
router.put(
  '/:id',
  authorizeRole('SUPER_ADMIN'),
  validateRequest(roleSchemas.idParam),
  validateRequest(roleSchemas.updateRole),
  roleController.updateRole
);

/**
 * @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: Delete role
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Role deleted successfully
 */
router.delete(
  '/:id',
  authorizeRole('SUPER_ADMIN'),
  validateRequest(roleSchemas.idParam),
  roleController.deleteRole
);

/**
 * @swagger
 * /api/roles/{id}/set-default:
 *   patch:
 *     summary: Set role as default
 *     tags: [Roles]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Default role updated
 */
router.patch(
  '/:id/set-default',
  authorizeRole('SUPER_ADMIN'),
  validateRequest(roleSchemas.idParam),
  roleController.setDefaultRole
);

export default router;
