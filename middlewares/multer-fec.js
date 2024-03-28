import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, '/uploads'); 
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4());
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100000000 },
  fileFilter: (req, file, cb) => {
    // Filtrer les fichiers par extension
    if (!file.originalname.match(/\.(csv)$/)) {
      return cb(new Error("Le fichier doit être au format CSV"));
    }
    cb(null, true);
  },
}).single('csvFile');

export default upload;
