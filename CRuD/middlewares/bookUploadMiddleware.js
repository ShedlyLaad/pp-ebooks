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
                message: "Erreur de téléchargement du fichier",
                error: err.message
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: "Type de fichier invalide. Veuillez télécharger uniquement des images.",
                error: err.message
            });
        }

        // If no file was uploaded, that's okay - continue
        if (!req.file) {
            console.log("No file uploaded, continuing...");
        }

        // Ensure req.body is populated even if no file is uploaded
        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "Données du formulaire manquantes"
            });
        }

        next();
    });
};
