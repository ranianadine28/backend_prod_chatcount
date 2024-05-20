import express from "express";
import { body } from "express-validator";
import { login, signUp, updateAvatar, updateUser } from "../Controllers/auth_controller.js";
import multerConfig from "../middlewares/multer-config.js";

const router = express.Router();

router.route("/signup").post(multerConfig, signUp);
router.route("/login").post(login);
router.route("/updateprofil/:userId").post(multerConfig, updateUser);
router.route("/updateavatar/:userId").post(multerConfig, updateAvatar);
export default router;
