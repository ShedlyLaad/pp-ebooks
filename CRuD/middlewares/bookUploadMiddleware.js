import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../uploads/books'));
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload only images.'), false);
    }
};

export const uploadBookImage = multer({
    storage: storage,
    limits: {
        fileSize: 5000000 // 5MB
    },
    fileFilter: fileFilter
}).single('poster');

export const handleBookUpload = (req, res, next) => {
    uploadBookImage(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message: "File upload error",
                error: err.message
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: "Invalid file type. Please upload only images.",
                error: err.message
            });
        }
        next();
    });
};
