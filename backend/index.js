import express from "express";
import cors from "cors";
import cron from "node-cron";
import compression from "compression";
import dotenv from "dotenv";
import connectDB from "./db/database.js";
import hackathonRoutes from "./routes/hackathon.routes.js";
import userRoutes from "./routes/user.routes.js";
import oauthRoutes from "./routes/googleAuth.routes.js";
import authRoutes from "./routes/auth.route.js";
import devquestRoutes from "./routes/devquest.routes.js";
import githubRoutes from "./routes/githubAuth.routes.js";
import dailyQuizRoutes from "./routes/dailyQuiz.routes.js";
import registrationRoutes from "./routes/registration.routes.js";
import submitRoutes from "./routes/submission.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import teamRoutes from "./routes/team.routes.js";
import { githubDataRoutes } from "./routes/githubData.routes.js";
import voteRoutes from "./routes/vote.routes.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { Message } from "./models/message.model.js";
import chatRoutes from "./routes/chat.routes.js";
import { runDailyQuizAutomation } from "./api/dailyQuizAutomation.js";

const app = express();
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "https://hack-sprint-iitj.vercel.app",
    "https://hacksprint.devluplabs.tech",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
      "https://hack-sprint-iitj.vercel.app",
      "https://hacksprint.devluplabs.tech",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join a chat room
  socket.on("join_room", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined room ${chatId}`);
  });

  // Leave a chat room
  socket.on("leave_room", (chatId) => {
    socket.leave(chatId);
    console.log(`User ${socket.id} left room ${chatId}`);
  });

  // Send a message
  socket.on("send_message", async (data) => {
    // data expects: { chatId, senderId, content, type }
    console.log("Message received:", data);

    try {
      const newMessage = new Message({
        sender: data.senderId,
        content: data.content,
        chatId: data.chatId,
        type: data.type || "group",
        participants: data.participants || [],
      });

      await newMessage.save();

      await newMessage.populate("sender", "name profilePicture email username");

      io.to(data.chatId).emit("receive_message", newMessage);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

dotenv.config();
connectDB();

// const corsOptions = {
//   origin: [
//     "http://localhost:5173",
//     "http://localhost:5174",
//     "http://localhost:3000",
//     "http://127.0.0.1:5173",
//     "https://hack-sprint-iitj.vercel.app",
//     "https://hacksprint.devluplabs.tech",
//   ],
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//   credentials: true,
//   optionsSuccessStatus: 200,
// };

// app.use(cors(corsOptions));
app.use(compression());
app.use(express.json());

app.use("/api/githubData", githubDataRoutes);
app.use("/api/devquest", devquestRoutes);
app.use("/api/hackathons", hackathonRoutes);
app.use("/api/user", userRoutes);
app.use("/api/dailyquiz", dailyQuizRoutes);
app.use("/api/register", registrationRoutes);
app.use("/api/submit", submitRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", githubRoutes);
app.use("/api", oauthRoutes);
app.use("/api/account", authRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/votes", voteRoutes);

app.get("/cron/daily-quiz", async (req, res) => {
  if (req.query.secret !== process.env.CRON_SECRET) {
    return res.status(403).send("Unauthorized");
  }

  console.log("Cron triggered");

  await runDailyQuizAutomation();

  res.send("Cron job executed");
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
