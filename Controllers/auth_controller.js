import user from "../Models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRATION } from "../default.js";
import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: "chatcountai@gmail.com",
    pass: "Rania*2024",
  },
});

export async function signUp(req, res) {
  const { name, nickName, email, password, phone, role, speciality, address } =
    req.body;

  // const verifUser = await user.findOne({ email: req.body.email });
  // if (verifUser) {
  //   console.log("user already exists");
  //   res.status(403).send({ message: "User already exists !" });
  //   return;
  // }

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
    id: userInfo._id,
    name: userInfo.name,
    email: userInfo.email,
    phone: userInfo.phone,
    role: userInfo.role,
    address: userInfo.address,
  };

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });
  console.log(token);
  res.status(200).json({
    token: token,
    userInfo,
  });
}
export async function updateUser(req, res) {
  const userId = req.params.userId;

  try {
    const newuser = await user.findById(userId);

    if (!newuser) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    console.log("Données reçues pour mise à jour:", req.body);

    if (req.body.name) newuser.name = req.body.name;
    if (req.body.nickName) newuser.nickName = req.body.nickName;
    if (req.body.email) newuser.email = req.body.email;
    if (req.body.phone) newuser.phone = req.body.phone;
    if (req.body.role) newuser.role = req.body.role;
    if (req.body.speciality) newuser.speciality = req.body.speciality;
    if (req.body.address) newuser.address = req.body.address;

    console.log("Données avant sauvegarde:", newuser);

    await newuser.save();

    console.log("Données après sauvegarde:", newuser);

    res.status(200).json({
      user: newuser,
      message: "Données utilisateur mises à jour avec succès.",
    });
  } catch (error) {
    console.error(
      "Erreur lors de la mise à jour des données utilisateur :",
      error
    );
    res.status(500).json({
      message:
        "Une erreur s'est produite lors de la mise à jour des données utilisateur.",
    });
  }
}

export async function updateAvatar(req, res) {
  const userId = req.params.userId;

  try {
    const existingUser = await user.findById(userId);

    if (!existingUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier téléchargé." });
    }

    existingUser.avatar = req.file.filename;

    await existingUser.save();

    res.status(200).json({
      user: existingUser,
      message: "Avatar mis à jour avec succès.",
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'avatar :", error);
    res.status(500).json({
      message: "Une erreur s'est produite lors de la mise à jour de l'avatar.",
    });
  }
}
