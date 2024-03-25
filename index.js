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

const port = process.env.PORT || 7001;

// Préchargement du script Python
const pythonProcess = spawn("python", ["./script.py"]);
let responseCache = {}; // Stockage des réponses du script Python pour une utilisation ultérieure

// Connexion à MongoDB
mongoose
  .connect(MONGODB_URL, {
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
app.use(
  cors({
    origin: "http://www.chatcount.fr",
    methods: ["GET", "POST", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Origin", "X-Requested-With", "Accept"],
    credentials: true,
  })
);
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

io.on("connection", (socket) => {
  console.log("Un utilisateur s'est connecté");
  socket.on("message", async (message) => {
    console.log("Message reçu :", message);

    const { conversationId, text } = message;

    try {
      // Vérification du cache
      if (responseCache.hasOwnProperty(text)) {
        const cachedResponse = responseCache[text];
        console.log("Réponse trouvée dans le cache :", cachedResponse);
        const botMessage = {
          sender: "bot",
          text: cachedResponse,
        };
        socket.emit("message", botMessage); // Envoyer seulement le texte du message au front-end
        console.log("Réponse du bot envoyée :", cachedResponse);
        await saveMessageToDatabase("user", text, conversationId); // Enregistrer le message de l'utilisateur dans la base de données
        await saveMessageToDatabase("bot", cachedResponse, conversationId); // Enregistrer la réponse du bot dans la base de données
        console.log("Message enregistré :", { sender: "bot", text: cachedResponse });
      } else {
        // Envoi du message au script Python si non présent dans le cache
        pythonProcess.stdin.write(text + "\n");
        pythonProcess.stdin.end();
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  });

  pythonProcess.stdout.on("data", async (data) => {
    const output = data.toString().trim();
    console.log("Sortie brute du script Python :", output);

    // Envoyer la réponse du bot au client via les sockets
    const botMessage = {
      sender: "bot",
      text: output,
    };
    socket.emit("message", botMessage); // Envoyer l'objet message complet au front-end
    console.log("Réponse du bot envoyée :", output);

    // Enregistrer le message de bot dans la base de données
    await saveMessageToDatabase("bot", output, conversationId);
  });

  pythonProcess.stderr.on("data", (data) => {
    const errorOutput = data.toString().trim();
    console.error(`Erreur de script Python : ${errorOutput}`);

    // Envoyer l'erreur au client via les sockets
    const errorMessage = {
      sender: "bot",
      text: `Erreur de script Python : ${errorOutput}`,
    };
    socket.emit("message", errorMessage); // Envoyer l'objet message complet au front-end

    // Vous pouvez également enregistrer l'erreur dans la base de données si nécessaire
  });

  pythonProcess.on("close", (code) => {
    console.log(`Processus Python terminé avec le code de sortie ${code}`);
  });

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
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
