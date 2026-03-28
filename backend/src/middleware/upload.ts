import multer from 'multer';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';

dotenv.config();

const uploadDir = process.env.UPLOAD_DIR || './uploads';
const workOrdersDir = join(uploadDir, 'work-orders');

// Create upload directories if they don't exist
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}
if (!existsSync(workOrdersDir)) {
  mkdirSync(workOrdersDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, workOrdersDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow images and common document types
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and PDF files are allowed.'));
  }
};

const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760'); // 10MB default

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxSize,
  },
});
