import user from "../Models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRATION } from "../default.js";
import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "ppay81755@gmail.com",
    pass: "iawd rctp qwwi bsot",
  },
});

export async function signUp(req, res) {
  const { name, nickName, email, password, phone, role, speciality, address } =
    req.body;

  const verifUser = await user.findOne({ email: req.body.email });
  if (verifUser) {
    console.log("user already exists");
    res.status(403).send({ message: "User already exists !" });
    return;
  }

  console.log("Success");

  const mdpEncrypted = await bcrypt.hash(req.body.password, 10);
  const newUser = new user();

  newUser.avatar = req.file.filename;

  newUser.name = req.body.name;
  newUser.nickName = req.nickName;
  newUser.email = req.body.email;
  newUser.password = mdpEncrypted;
  newUser.phone = req.body.phone;
  newUser.role = req.body.role;
  newUser.speciality = req.body.speciality;
  newUser.address = req.body.address;

  await newUser.save();
  const mailOptions = {
    from: "ranianadine.benhadjyoussef@esprit.tn",
    to: newUser.email,
    subject: "Inscription réussie",
    html: `<p>Bonjour ${newUser.name},</p>
           <p>Votre compte a été créé avec succès !</p>
           <p>Vous pouvez maintenant vous connecter à l'application ChatCount en utilisant ce lien : <a href="https://www.chatcount.ai/">chatcount</a></p>`,
  };
  const payload = {
    _id: newUser._id,
    name: newUser.name,
    nickName: newUser.nickName,
    email: newUser.email,
    phone: newUser.phone,
    role: newUser.role,
    speciality: newUser.speciality,
    address: newUser.address,
    avatar: newUser.avatar, // Now contains only the filename
  };

  const token = jwt.sign({ payload }, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });

  res.status(300).send({
    token: token,
    statusCode: res.statusCode,
    message: "Logged in with success!",
  });
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });

  console.log(token);
}

export async function login(req, res) {
  console.log("connect");
  const userInfo = await user.findOne({ email: req.body.email });

  if (
    !userInfo ||
    userInfo.status === 0 ||
    !bcrypt.compareSync(req.body.password, userInfo.password)
  )
    return res.status(404).json({
      error: "Invalid credentials",
    });

  const payload = {
    id: userInfo._id, // Utilisez userInfo._id pour obtenir l'ID de l'utilisateur
    name: userInfo.name,
    email: userInfo.email,
    phone: userInfo.phone,
    role: userInfo.role,
    address: userInfo.address,
  };

  // Générez le jeton JWT en utilisant le payload et la clé secrète
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });
  console.log(token);
  res.status(200).json({
    token: token, // Renvoyez le jeton JWT dans la réponse
    userInfo,
  });
}
