import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

// Obtenez le chemin du répertoire du fichier JavaScript principal
const __dirname = dirname(fileURLToPath(import.meta.url));

// Définissez la configuration de stockage Multer
const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    // Utilisez le même répertoire que celui où se trouve le fichier JavaScript principal
    callback(null, "/uploads");
  },
  filename: function (req, file, cb) {
    // Utilisez le nom d'origine du fichier
    cb(null, file.originalname);
  },
});

// Configurez Multer avec les paramètres de stockage
const upload = multer({
  storage: storage,
  limits: { fileSize: 100000000 }, // Limite la taille du fichier à 100 MB
  fileFilter: (req, file, cb) => {
    // Filtrer les fichiers par extension
    if (!file.originalname.match(/\.(csv)$/)) {
      return cb(new Error("Le fichier doit être au format CSV"));
    }
    cb(null, true);
  },
}).single("csvFile");

export default upload;
