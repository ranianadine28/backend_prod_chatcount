// fecRoute.js

import express from "express";
import {
  getFec,
  replaceFile,
  uploadFec,
} from "../Controllers/fec_controller.js";
import upload from "../middlewares/multer-fec.js";
import { recupFecName } from "../Controllers/conversation_controller.js";

const router = express.Router();

router.post("/uploadCsv", upload, uploadFec);
router.get("/getCsv", getFec);
router.put("/fec/replace/:existingFecId", replaceFile);
router.get("/getFecName/:conversationId",recupFecName);
export default router;
