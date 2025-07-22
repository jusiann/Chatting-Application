import {v2 as cloudinary} from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadToCloudinary = async (file) => {
    try {
        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'profile-pictures',
            use_filename: true,
            unique_filename: true,
            overwrite: true,
            resource_type: 'auto'
        });

        return {
            url: result.secure_url
        };
    } catch (error) {
        throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
    }
};

export const deleteFromCloudinary = async (public_id) => {
    try {
        await cloudinary.uploader.destroy(public_id);
    } catch (error) {
        throw new Error(`Failed to delete from Cloudinary: ${error.message}`);
    }
}; 