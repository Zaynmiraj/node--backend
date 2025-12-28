import multer, { FileFilterCallback, StorageEngine } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { ApiError } from './error.middleware';

// Upload directory
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Allowed MIME types by category
 */
export const ALLOWED_MIME_TYPES = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv',
  ],
  videos: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'],
  all: [] as string[], // Will be populated below
};

// Populate 'all' with all allowed types
ALLOWED_MIME_TYPES.all = [
  ...ALLOWED_MIME_TYPES.images,
  ...ALLOWED_MIME_TYPES.documents,
  ...ALLOWED_MIME_TYPES.videos,
  ...ALLOWED_MIME_TYPES.audio,
];

/**
 * Upload configuration options
 */
export interface UploadOptions {
  destination?: string;
  allowedTypes?: string[];
  maxFileSize?: number; // in bytes
  maxFiles?: number;
  fileNamePrefix?: string;
}

/**
 * Generate unique filename
 */
const generateFileName = (originalName: string, prefix?: string): string => {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const prefixStr = prefix ? `${prefix}_` : '';
  return `${prefixStr}${timestamp}_${random}${ext}`;
};

/**
 * Create multer storage configuration
 */
const createStorage = (options: UploadOptions): StorageEngine => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dest = options.destination
        ? path.join(UPLOAD_DIR, options.destination)
        : UPLOAD_DIR;

      // Create subdirectory if doesn't exist
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }

      cb(null, dest);
    },
    filename: (req, file, cb) => {
      cb(null, generateFileName(file.originalname, options.fileNamePrefix));
    },
  });
};

/**
 * Create file filter based on allowed types
 */
const createFileFilter = (allowedTypes: string[]) => {
  return (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (allowedTypes.length === 0 || allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ApiError(`File type ${file.mimetype} is not allowed`, 400));
    }
  };
};

/**
 * Create upload middleware with custom options
 * 
 * @example
 * // Single file upload
 * router.post('/avatar', createUpload({ 
 *   destination: 'avatars',
 *   allowedTypes: ALLOWED_MIME_TYPES.images,
 *   maxFileSize: 5 * 1024 * 1024 // 5MB
 * }).single('avatar'), controller.uploadAvatar);
 * 
 * // Multiple files upload
 * router.post('/documents', createUpload({
 *   destination: 'documents',
 *   allowedTypes: ALLOWED_MIME_TYPES.documents,
 *   maxFiles: 10
 * }).array('files', 10), controller.uploadDocuments);
 */
export const createUpload = (options: UploadOptions = {}) => {
  const {
    destination = '',
    allowedTypes = ALLOWED_MIME_TYPES.all,
    maxFileSize = 10 * 1024 * 1024, // 10MB default
    maxFiles = 5,
  } = options;

  return multer({
    storage: createStorage({ ...options, destination }),
    fileFilter: createFileFilter(allowedTypes) as any,
    limits: {
      fileSize: maxFileSize,
      files: maxFiles,
    },
  });
};

/**
 * Pre-configured upload middleware for common use cases
 */
export const upload = {
  // Avatar upload (single image, max 5MB)
  avatar: createUpload({
    destination: 'avatars',
    allowedTypes: ALLOWED_MIME_TYPES.images,
    maxFileSize: 5 * 1024 * 1024,
    fileNamePrefix: 'avatar',
  }),

  // Document upload (multiple, max 10MB each)
  documents: createUpload({
    destination: 'documents',
    allowedTypes: ALLOWED_MIME_TYPES.documents,
    maxFileSize: 10 * 1024 * 1024,
    maxFiles: 10,
    fileNamePrefix: 'doc',
  }),

  // Image upload (multiple, max 5MB each)
  images: createUpload({
    destination: 'images',
    allowedTypes: ALLOWED_MIME_TYPES.images,
    maxFileSize: 5 * 1024 * 1024,
    maxFiles: 10,
    fileNamePrefix: 'img',
  }),

  // Any file upload
  any: createUpload({
    destination: 'files',
    allowedTypes: ALLOWED_MIME_TYPES.all,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxFiles: 5,
  }),
};

/**
 * Get file URL from uploaded file
 */
export const getFileUrl = (file: Express.Multer.File, baseUrl: string = ''): string => {
  const relativePath = file.path.replace(UPLOAD_DIR, '').replace(/\\/g, '/');
  return `${baseUrl}/uploads${relativePath}`;
};

/**
 * Delete uploaded file
 */
export const deleteFile = async (filePath: string): Promise<void> => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

export default upload;
