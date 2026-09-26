import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const uploadDir = path.resolve('uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type: ${file.mimetype}. Only PDF, JPEG, PNG, and WebP are allowed.`), false);
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB limit
  fileFilter,
});

/**
 * Middleware that computes SHA-256 for all uploaded files
 * Enables non-repudiation and cryptographic file fingerprinting
 */
export const computeFileHashes = (req, res, next) => {
  const files = req.files || (req.file ? [req.file] : []);

  if (!files || files.length === 0) {
    return next();
  }

  try {
    const fileList = Array.isArray(files) ? files : Object.values(files).flat();
    for (const file of fileList) {
      const fileBuffer = fs.readFileSync(file.path);
      const hash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
      file.sha256Hash = hash;
    }
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: 'Failed to compute SHA-256 fingerprint: ' + err.message,
    });
  }
};

export default { upload, computeFileHashes };
