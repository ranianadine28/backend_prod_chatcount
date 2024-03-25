// multerConfig.js

import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, __dirname);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100000000 }, 
  fileFilter: (req, file, cb) => {
    if (!file.originalname.match(/\.(csv)$/)) {
      return cb(new Error("Le fichier doit être au format CSV"));
    }
    cb(null, true);
  },
}).single("csvFile");
