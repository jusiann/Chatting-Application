import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {fileURLToPath} from 'url';
import {uploadToCloudinary as uploadToCloudinaryService} from './cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tempDir = path.join(__dirname, '../../uploads/temp');
if (!fs.existsSync(tempDir))
    fs.mkdirSync(tempDir, { recursive: true });

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype))
        cb(null, true);
    else 
        cb(new Error('Invalid file type. Only JPEG, JPG and PNG files are allowed.'), false);
    
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024
    }
});

export const handleCloudinaryUpload = async (req, res, next) => {
    try {
        if (!req.file)
            return next();
        
        const result = await uploadToCloudinaryService(req.file);
        fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting temp file:', err);
        });

        req.cloudinary = result;
        next();
    } catch (error) {
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting temp file:', err);
            });
        }
        next(error);
    }
};

export const uploadProfilePicture = upload.single('profile_picture');

export const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE')
            return res.status(400).json({
                success: false,
                message: 'File size cannot exceed 5MB'
            });

        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    if (err)
        return res.status(400).json({
            success: false,
            message: err.message
        });
    next();
}; 