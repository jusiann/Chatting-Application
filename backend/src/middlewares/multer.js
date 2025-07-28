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

// Basit storage konfigürasyonu
const upload = multer({
    dest: tempDir,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        console.log('Gelen dosya:', file);
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, JPG and PNG files are allowed.'));
        }
    }
});

export const handleCloudinaryUpload = async (req, res, next) => {
    try {
        if (!req.file) {
            console.log('Dosya yok');
            return next();
        }
        
        console.log('Yüklenen dosya:', req.file);
        const result = await uploadToCloudinaryService(req.file);
    
        fs.unlink(req.file.path, (err) => {
            if (err) console.error('Error deleting temp file:', err);
        });

        req.cloudinary = result;
        next();
    } catch (error) {
        console.error('Cloudinary yükleme hatası:', error);
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
    console.log('Upload hatası:', err);
    if (err instanceof multer.MulterError) {
        console.log('Multer hatası:', err.code);
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size cannot exceed 5MB'
            });
        }
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }

    if (err) {
        console.log('Genel hata:', err.message);
        return res.status(400).json({
            success: false,
            message: err.message
        });
    }
    next();
}; 