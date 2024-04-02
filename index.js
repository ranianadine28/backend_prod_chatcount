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
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://www.chatcount.ai",
    methods: ["GET", "POST", "DELETE", "PUT", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});
io.engine.on("connection_error", (err) => {
  console.log(err.req);
  console.log(err.code); // the error code, for example 1
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
    origin: "https://www.chatcount.ai",
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

  // Récupérer le nom FEC une seule fois lors de la connexion
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
        const output = data.toString().trim();
  
        const response = output;
  
        const botMessage = {
          sender: "bot",
          text: response,
        };
        socket.emit("message", botMessage.text);
        await saveMessageToDatabase("bot", response, conversationId);
        console.log("Message enregistré :", { sender: "bot", text: response });
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

      // Vous pouvez maintenant utiliser fecName et pythonProcess ici pour chaque message
      if (!fecName || !pythonProcess) {
        console.error("Le nom FEC ou le processus Python n'est pas encore initialisé.");
        return;
      }
  
      pythonProcess.stdin.write(text + "\n");
      // Sauvegarder le message de l'utilisateur dans la base de données
      await saveMessageToDatabase("user", text, conversationId);
    } catch (error) {
      console.error("Erreur lors du traitement du message:", error);
    }
  });
  
  socket.on("disconnect", () => {
    console.log("Un utilisateur s'est déconnecté");
  });
});

server.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${port}/`);
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
