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

io.on("connection", (socket) => {
  let fecName; // Déclarer fecName à un niveau supérieur pour qu'il soit accessible dans tout le scope

  socket.on("launch_success", (data) => {
    // Extraire le nom du FEC de l'objet data
    const fecName = data.fecName;

    console.log("Nom du FEC lancé :", fecName);

    const pythonProcess = spawn("python", ["./script.py", fecName]);

    try {
      pythonProcess.stdin.end();
    } catch (error) {
      console.error(
        "Erreur lors de l'envoi du nom du FEC au script Python:",
        error
      );
    }
  });

  console.log("Un utilisateur s'est connecté");

  socket.on("message", async (message) => {
    console.log("Message reçu :", message);

    const { conversationId, text } = message;
    const pythonProcess = spawn("python", ["./script.py", fecName]); // Utiliser fecName ici

    try {
      pythonProcess.stdin.write(text + "\n");
      pythonProcess.stdin.end();

      pythonProcess.stdout.on("data", async (data) => {
        const output = data.toString().trim();
        console.log("Sortie brute du script Python :", output);

        const response = output;

        console.log("Réponse du bot extraite :", response);
        const botMessage = {
          sender: "bot",
          text: response,
        };
        socket.emit("message", botMessage.text);
        console.log("Réponse du bot envoyée :", response);
        await saveMessageToDatabase("user", text, conversationId);
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
      console.error("Error handling message:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Un utilisateur s'est déconnecté");
  });
});

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
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
