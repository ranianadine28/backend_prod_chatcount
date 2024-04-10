import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import http from "http";
import bodyParser from "body-parser";
import { spawn } from "child_process";
import { Server } from "socket.io";
import { MONGODB_URL } from "./default.js";
import ConversationModel from "./Models/conversation.js";
import userRoute from "./Routes/auth_route.js";
import fecRoute from "./Routes/fec_route.js";
import conversationRoute from "./Routes/conversation_route.js";
import FECModel from "./Models/fec.js";
import conversation from "./Models/conversation.js";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:4200",
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});
io.engine.on("connection_error", (err) => {
  console.log(err.req);
  console.log(err.code);
  console.log(err.message); // the error message, for example "Session ID unknown"
  console.log(err.context); // some additional error context
});

const port = process.env.PORT || 7001;

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://ranianadine:kUp44PvOVpUzcyhK@chatcountdb.lrppzqm.mongodb.net/?retryWrites=true&w=majority&appName=chatcountdb",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      family: 4,
    }
  )
  .then(() => {
    console.log("Database connected!");
  })
  .catch((err) => console.error("Database connection error:", err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: " http://localhost:4200",
    methods: ["GET", "POST", "DELETE", "PATCH", "PUT", "OPTIONS"],
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
app.use("/", (req, res) => {
  res.send("helloo");
});
let fecName;
let pythonProcess;

io.on("connection", (socket) => {
  console.log("Un utilisateur s'est connecté");
  socket.on("fetchUserConversation", async (userId) => {
    try {
      // Rechercher la conversation associée à l'utilisateur
      const userConversation = await conversation.findOne({ userId });

      if (!userConversation) {
        console.log("Aucune conversation trouvée pour cet utilisateur.");
        return;
      }

      // Récupérer les détails de la conversation
      const {
        _id: conversationId,
        fecId /* autres champs de la conversation */,
      } = userConversation;

      // Récupérer le nom FEC à partir de l'ID FEC
      const fec = await FECModel.findById(fecId);
      const fecName = fec ? fec.name : "Nom du FEC introuvable";

      // Ici, vous devrez probablement vérifier l'état du processus Python associé à cette conversation
      const isPythonProcessRunning = false; // À remplacer par votre logique pour vérifier l'état du processus Python

      socket.emit("userConversationDetails", {
        conversationId,
        fecName,
        isPythonProcessRunning,
      });
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de la conversation de l'utilisateur:",
        error
      );
    }
  });

  socket.on("fetchFecName", async (conversationId) => {
    try {
      const conversation = await ConversationModel.findById(conversationId);

      if (!conversation) {
        console.error("Conversation non trouvée.");
        return;
      }

      const fecId = conversation.fecId;

      if (!fecId) {
        console.error("Identifiant FEC non trouvé dans la conversation.");
        return;
      }

      const fec = await FECModel.findById(fecId);

      if (!fec) {
        console.error("FEC non trouvé.");
        return;
      }

      fecName = fec.name;
      console.log("fecname", fecName);

      pythonProcess = spawn("python", ["./script.py", fecName]);

      pythonProcess.stdout.on("data", async (data) => {
        try {
          const output = data.toString().trim();
          const response = output;

          // Enregistrement du message dans la base de données
          await saveMessageToDatabase(
            "bot",
            response,
            conversationId,
            0,
            0,
            ""
          ); // Vous pouvez définir comment ici comme une chaîne vide car il n'y a pas de commentaire initial

          const botMessage = {
            sender: "bot",
            text: response,
            likes: 0,
            dislikes: 0,
            comment: "",
          };

          socket.emit("message", botMessage);

          socket.on("updateLikesDislikes", async (data) => {
            const { conversationId, message, likes, dislikes, comment } = data;
            console.log(
              `Reçu une demande de mise à jour des likes/dislikes pour la conversation ${conversationId} - Likes: ${likes}, Dislikes: ${dislikes}`
            );

            try {
              await ConversationModel.updateOne(
                { _id: conversationId, "messages._id": message._id },
                {
                  $set: {
                    "messages.$.likes": likes,
                    "messages.$.dislikes": dislikes,
                    "messages.$.comment": comment,
                  },
                }
              );
              console.log(
                "Likes et Dislikes mis à jour avec succès dans la base de données."
              );

              await saveMessageToDatabase(
                "bot",
                response,
                conversationId,
                likes,
                dislikes,
                comment
              );
              io.to(conversationId).emit("updateLikesDislikes", {
                likes,
                dislikes,
                comment,
              });
              console.log(
                "Broadcast de la mise à jour des likes/dislikes terminé."
              );
            } catch (error) {
              console.error(
                "Erreur lors de la mise à jour des likes et dislikes:",
                error
              );
            }
          });

          console.log("Message enregistré :", {
            sender: "bot",
            text: response,
          });
        } catch (error) {
          console.error(
            "Erreur lors de la manipulation des données de sortie du processus Python:",
            error
          );
        }
      });

      pythonProcess.stderr.on("data", (data) => {
        console.error(`Erreur de script Python : ${data}`);
      });

      pythonProcess.on("close", (code) => {
        console.log(`Processus Python terminé avec le code de sortie ${code}`);
      });
    } catch (error) {
      console.error("Erreur lors de la récupération du FEC:", error);
    }
  });

  socket.on("message", async (data) => {
    try {
      const { conversationId, text } = data;

      if (!fecName || !pythonProcess) {
        console.error(
          "Le nom FEC ou le processus Python n'est pas encore initialisé."
        );
        return;
      }

      pythonProcess.stdin.write(text + "\n");
      await saveMessageToDatabase("user", text, conversationId, 0, 0);
    } catch (error) {
      console.error("Erreur lors du traitement du message:", error);
    }
  });

  socket.on("disconnect", () => {
    if (socket.room) {
      socket.leave(socket.room);
      console.log(`Utilisateur déconnecté de la salle ${socket.room}`);
    }

    conversation.findOneAndUpdate(
      { userId: socket.userId },
      {
        conversationId: socket.conversationId,
        fecName: fecName,
        isPythonProcessRunning: !!pythonProcess, // Convertir en booléen pour stocker
      },
      { upsert: true } // Créer un nouveau document si nécessaire
    );
  });
});

server.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${port}/`);
});
async function saveMessageToDatabase(
  sender,
  text,
  conversationId,
  likes,
  dislikes,
  comment
) {
  try {
    let conversation = await ConversationModel.findById(conversationId);

    if (!conversation) {
      conversation = new ConversationModel({
        _id: conversationId,
        messages: [],
      });
    }

    const lastMessageIndex = conversation.messages.length - 1;

    console.log("Last Message Index:", lastMessageIndex);
    console.log("Last Message:", conversation.messages[lastMessageIndex]);

    if (
      lastMessageIndex >= 0 &&
      conversation.messages[lastMessageIndex].sender === "bot" &&
      conversation.messages[lastMessageIndex].text === text
    ) {
      console.log("Updating Last Bot Message:", text);
      conversation.messages[lastMessageIndex].likes = likes;
      conversation.messages[lastMessageIndex].dislikes = dislikes;
      conversation.messages[lastMessageIndex].comment = comment;
    } else {
      console.log("Adding New Message:", text);
      conversation.messages.push({
        sender,
        text,
        likes,
        dislikes,
        comment,
      });
    }

    await conversation.save();
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du message:", error);
  }
}
