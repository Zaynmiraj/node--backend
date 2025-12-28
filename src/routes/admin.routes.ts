import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate, authorizeType, authorizeRole } from '../middleware/auth.middleware';
import { validateRequest, validationSchemas, Joi, schemas } from '../middleware/validation.middleware';
import { cacheMiddleware } from '../middleware/cache.middleware';

const router = Router();

// Custom admin validation schemas
const adminSchemas = {
  createAdmin: {
    body: Joi.object({
      email: schemas.email,
      password: schemas.strongPassword,
      name: schemas.name,
      phone: schemas.phone,
      role: Joi.string().valid('ADMIN', 'SUPER_ADMIN', 'MODERATOR').default('ADMIN'),
      permissions: Joi.array().items(Joi.string()).optional(),
    }),
  },
};

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Login admin
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/login',
  validateRequest(validationSchemas.userLogin),
  adminController.login
);

/**
 * @swagger
 * /api/admin/create:
 *   post:
 *     summary: Create a new admin (super admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, name]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 8
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, SUPER_ADMIN, MODERATOR]
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Admin created successfully
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.post(
  '/create',
  authenticate,
  authorizeType('admin'),
  authorizeRole('SUPER_ADMIN'),
  validateRequest(adminSchemas.createAdmin),
  adminController.createAdmin
);

/**
 * @swagger
 * /api/admin/profile:
 *   get:
 *     summary: Get current admin profile
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get(
  '/profile',
  authenticate,
  authorizeType('admin'),
  cacheMiddleware(60),
  adminController.getProfile
);

/**
 * @swagger
 * /api/admin/profile:
 *   put:
 *     summary: Update current admin profile
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfile'
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put(
  '/profile',
  authenticate,
  authorizeType('admin'),
  validateRequest(validationSchemas.updateProfile),
  adminController.updateProfile
);

/**
 * @swagger
 * /api/admin:
 *   get:
 *     summary: Get all admins (super admin only)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Admins retrieved successfully
 */
router.get(
  '/',
  authenticate,
  authorizeType('admin'),
  authorizeRole('SUPER_ADMIN'),
  validateRequest(validationSchemas.paginationQuery),
  cacheMiddleware(120),
  adminController.getAllAdmins
);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (for admin management)
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get(
  '/users',
  authenticate,
  authorizeType('admin'),
  validateRequest(validationSchemas.paginationQuery),
  cacheMiddleware(120),
  adminController.getAllUsers
);

/**
 * @swagger
 * /api/admin/users/{id}/toggle-status:
 *   patch:
 *     summary: Toggle user active status
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: User status updated
 */
router.patch(
  '/users/:id/toggle-status',
  authenticate,
  authorizeType('admin'),
  validateRequest(validationSchemas.idParam),
  adminController.toggleUserStatus
);

/**
 * @swagger
 * /api/admin/{id}:
 *   get:
 *     summary: Get admin by ID
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Admin retrieved successfully
 */
router.get(
  '/:id',
  authenticate,
  authorizeType('admin'),
  authorizeRole('SUPER_ADMIN'),
  validateRequest(validationSchemas.idParam),
  cacheMiddleware(60),
  adminController.getAdminById
);

/**
 * @swagger
 * /api/admin/{id}:
 *   delete:
 *     summary: Delete admin
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         description: Admin deleted successfully
 */
router.delete(
  '/:id',
  authenticate,
  authorizeType('admin'),
  authorizeRole('SUPER_ADMIN'),
  validateRequest(validationSchemas.idParam),
  adminController.deleteAdmin
);

export default router;
