import express from "express";
import mongoose from "mongoose";
import { notFoundError, errorHandler } from "./middlewares/error-handler.js";
import morgan from "morgan";
import cors from "cors";
import { Server } from "socket.io";
import user from "./Models/user.js";
import { MONGODB_URL } from "./default.js";

import path from "path";
import http from "http";
import bodyParser from "body-parser";
import ConversationModel from "./Models/conversation.js";
import { spawn } from "child_process";

import userRoute from "./Routes/auth_route.js";
import fecRoute from "./Routes/fec_route.js";
import conversationRoute from "./Routes/conversation_route.js";
import conversation from "./Models/conversation.js";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://www.chatcount.fr",
    methods: ["GET", "POST", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// Port d'écoute du serveur
const port = process.env.PORT || 7001;

// Connexion à MongoDB
mongoose.connect(MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  family: 4,
})
.then(() => {
  console.log("Database connected!");
})
.catch((err) => console.error("Database connection error:", err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://www.chatcount.fr",
  methods: ["GET", "POST", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Origin", "X-Requested-With", "Accept"],
  credentials: true,
}));
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use("/avatars", express.static("public/images"));

// Routes
app.use("/user", userRoute);
app.use("/fec", fecRoute);
app.use("/conversation", conversationRoute);
app.use("/", (req, res) => {
  res.send("helloo");
});

// Initialisation du processus Python une seule fois
const pythonProcess = spawn("python", ["./script.py"]);

// Gestion des connexions socket
io.on("connection", (socket) => {
  console.log("Un utilisateur s'est connecté");

  // Gestion des messages
  socket.on("message", async (message) => {
    console.log("Message reçu :", message);

    const { conversationId, text } = message;

    // Envoi du message de l'utilisateur au script Python pour traitement
    pythonProcess.stdin.write(text + "\n");

    // Gestion de la sortie du script Python
    pythonProcess.stdout.once("data", async (data) => {
      const output = data.toString().trim();
      console.log("Sortie brute du script Python :", output);

      // Traitement de la réponse du script Python
      const response = output; // Ajoutez votre logique de traitement ici

      console.log("Réponse du bot extraite :", response);
      const botMessage = {
        sender: "bot",
        text: response,
      };
      socket.emit("message", botMessage); // Envoi de la réponse au client
      console.log("Réponse du bot envoyée :", response);

      // Enregistrement du message de l'utilisateur et de la réponse du bot dans la base de données
      await saveMessageToDatabase("user", text, conversationId);
      await saveMessageToDatabase("bot", response, conversationId);
      console.log("Messages enregistrés dans la base de données");
    });
  });

  // Gestion de la déconnexion
  socket.on("disconnect", () => {
    console.log("Un utilisateur s'est déconnecté");
  });

  // Gestion du lancement réussi de la conversation
  socket.on("launch_success", (data) => {
    socket.emit("conversation_launched", {
      message: "Conversation lancée avec succès",
    });
  });
});

// Fonction pour enregistrer un message dans la base de données
async function saveMessageToDatabase(sender, text, conversationId) {
  try {
    let conversation = await ConversationModel.findById(conversationId);

    if (!conversation) {
      conversation = new ConversationModel({
        _id: conversationId,
        messages: [],
      });
    }

    conversation.messages.push({ sender, text });
    await conversation.save();
  } catch (error) {
    console.error("Error saving message:", error);
  }
}

// Lancement du serveur sur le port spécifié
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
