import user from "../Models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRATION } from "../default.js";
export async function signUp(req, res) {
  const { name, nickName, email, password, phone, role, speciality, address } = req.body;

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

  res.status(201).send({
    token: token,
    statusCode: res.statusCode,
    message: "Logged in with success!",
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
      error: "Invalid incredentials",
    });

  const payload = {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    address: user.address,
  };

  res.status(200).json({
    // @ts-ignore
    token: jwt.sign({ payload }, JWT_SECRET, {
      expiresIn: JWT_EXPIRATION,
    }),
    userInfo,
  });
}
