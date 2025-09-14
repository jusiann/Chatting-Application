import multer from 'multer';
import multerStorageCloudinary, { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.js';

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'profile_images',
        allowed_formats: ['jpg', 'png'],
        transformation: [{ width: 300, height: 300, crop: 'fill' }],
    },
});

const upload = multer({ storage: storage });

export default upload;