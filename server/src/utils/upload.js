const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
        console.log('File:', file);
        let folder = 'CTU-social/';
        if (file.fieldname === 'images') {
            folder += 'images';
        } else if (file.fieldname === 'files') {
            folder += 'files';
        }
        console.log('File fieldname:', file.fieldname);
        console.log('Upload folder:', folder);
        return {
            folder: folder,
            allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'doc', 'docx', 'xls', 'xlsx'],
        };
    }
});

const upload = multer({ storage: storage });



module.exports = upload;