const express = require("express");
const mongoose = require("mongoose");
const { notFoundError, errorHandler } = require("./middlewares/error-handler.js");
const morgan = require("morgan");
const cors = require("cors");
const { Server } = require("socket.io");
const user = require("./Models/user.js");
const { MONGODB_URL } = require("./default.js");

const path = require("path");
const http = require("http");
const bodyParser = require("body-parser");
const ConversationModel = require("./Models/conversation.js");
const { spawn } = require("child_process");

const userRoute = require("./Routes/auth_route.js");
const fecRoute = require("./Routes/fec_route.js");
const conversationRoute = require("./Routes/conversation_route.js");
const conversation = require("./Models/conversation.js");

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
        socket.emit("message", botMessage.text); // Envoyer seulement le texte du message au front-end
        console.log("Réponse du bot envoyée :", cachedResponse);
        await saveMessageToDatabase("user", text, conversationId); // Enregistrer le message de l'utilisateur dans la base de données
        await saveMessageToDatabase("bot", cachedResponse, conversationId); // Enregistrer la réponse du bot dans la base de données
        console.log("Message enregistré :", { sender: "bot", text: cachedResponse });
      } else {
        // Envoi du message au script Python si non présent dans le cache
        pythonProcess.stdin.write(text + "\n");
        pythonProcess.stdin.end();
        pythonProcess.stdout.on("data", async (data) => {
          const output = data.toString().trim();
          console.log("Sortie brute du script Python :", output);

          // Traitement de la réponse du
        });

        pythonProcess.stderr.on("data", (data) => {
          console.error(`Erreur de script Python : ${data}`);
        });

        pythonProcess.on("close", (code) => {
          console.log(`Processus Python terminé avec le code de sortie ${code}`);
        });
      }
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
