import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Multer configuration to store files with their original extensions
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Destination folder
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Extract the file extension
    const name = path.basename(file.originalname, ext); // Extract the file name without extension
    cb(null, `${name}-${Date.now()}${ext}`); // Save with timestamp to avoid overwriting
  },
});

// File filter to accept only JPEG, PNG, and GIF files
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and GIF formats are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB file size limit
  },
});

export default upload;
