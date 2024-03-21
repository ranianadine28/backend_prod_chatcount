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
    origin: "https://chatcount-a866d1ccb2e5.herokuapp.com",
    methods: ["GET", "POST", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

const port = process.env.PORT || 7001;

// Connect to MongoDB
mongoose
  .connect("mongodb+srv://ranianadine:kUp44PvOVpUzcyhK@chatcountdb.lrppzqm.mongodb.net/?retryWrites=true&w=majority&appName=chatcountdb", {
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
    origin: "https://chatcount-a866d1ccb2e5.herokuapp.com",
    methods: ["GET", "POST", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Origin",
      "X-Requested-With",
      "Accept",
    ],
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
app.use("/",(req,res)=> {res.send("helloo")});
io.on("connection", (socket) => {
  console.log("Un utilisateur s'est connecté");
  socket.on("message", async (message) => {
    console.log("Message reçu :", message);

    const { conversationId, text } = message;

    try {
      const pythonProcess = spawn("python", ["./script.py"]);

      // Envoie le message de l'utilisateur au script Python
      pythonProcess.stdin.write(text + "\n");
      pythonProcess.stdin.end();
      pythonProcess.stdout.on("data", async (data) => {
        const output = data.toString().trim();
        console.log("Sortie brute du script Python :", output);

        // Traitez la réponse du script Python ici
        const response = output; // Ajoutez votre logique pour traiter la réponse du script Python

        console.log("Réponse du bot extraite :", response);
        const botMessage = {
          sender: "bot",
          text: response,
        };
        socket.emit("message", botMessage.text); // Envoyer seulement le texte du message au front-end
        console.log("Réponse du bot envoyée :", response);
        await saveMessageToDatabase("user", text, conversationId); // Enregistrer le message de l'utilisateur dans la base de données
        await saveMessageToDatabase("bot", response, conversationId); // Enregistrer la réponse du bot dans la base de données
        console.log("Message enregistré :", { sender: "bot", text: response });
      });

      pythonProcess.stderr.on("data", (data) => {
        console.error(`Erreur de script Python : ${data}`);
      });

      pythonProcess.on("close", (code) => {
        console.log(`Processus Python terminé avec le code de sortie ${code}`);
      });
    } catch (error) {
      console.error("Error handling message:", error);
    }
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
  socket.on("disconnect", () => {
    console.log("Un utilisateur s'est déconnecté");
  });

  socket.on("launch_success", (data) => {
    socket.emit("conversation_launched", {
      message: "Conversation lancée avec succès",
    });
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
