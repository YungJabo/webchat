import express from "express";
import { connectDB } from "./db.js";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import cors from "cors";
import path from "path";
import multer from "multer";
import cookieParser from "cookie-parser";
import { userController } from "./api/userController.js";
import { middleWareUser } from "./api/middleWareUser.js";
import { tokenController } from "./api/tokenController.js";
import { initializeWebSocket } from "./api/websocket.js";
import { chatController } from "./api/chatController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = 3000;

config();

const staticFilesPath = path.join(__dirname, "dist");

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(cookieParser());
app.use("/images", express.static(path.join(__dirname, "/images")));
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get("/", middleWareUser, async (req, res) => {
  res.sendFile(path.join(staticFilesPath, "index.html"));
});
app.get("/profile", middleWareUser, async (req, res) => {
  res.sendFile(path.join(staticFilesPath, "index.html"));
});

app.get("/login", middleWareUser, (req, res) => {
  if (req.user) {
    res.redirect("/");
  } else {
    res.sendFile(path.join(staticFilesPath, "index.html"));
  }
});

app.get("/login/:token", async (req, res) => {
  const { token } = req.params;
  const email = await tokenController.verifyToken(token);
  if (!email) {
    return res.status(400).send("Invalid or expired token");
  }

  res.sendFile(path.join(staticFilesPath, "index.html"));
});

app.get("/api/activation/:activationToken", async (req, res) => {
  const { activationToken } = req.params;
  const { accessToken, refreshToken } = await userController.activateAccount(
    activationToken
  );
  if (!accessToken) {
    res.json("Время истекло");
    return;
  }
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    maxAge: 2 * 24 * 60 * 60 * 1000,
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    maxAge: 2 * 24 * 60 * 60 * 1000,
  });

  res.redirect("/");
});

app.post("/api/sign_up", upload.none(), async (req, res) => {
  const { name, email, pass } = req.body;
  console.log(name, email, pass);
  const response = await userController.registration(name, email, pass);
  res.json(response);
});
app.post("/api/forgot_pass", upload.none(), async (req, res) => {
  const { email } = req.body;
  const response = await userController.linkToChangePass(email);
  res.json(response);
});

app.post("/api/reset-password/:token", upload.none(), async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  const response = await userController.changePass(token, newPassword);
  if (response) {
    res.redirect("/login");
  }
});

app.post("/api/login", upload.none(), async (req, res) => {
  const { email, pass } = req.body;

  const response = await userController.login(email, pass);
  if (response.success) {
    res.cookie("accessToken", response.accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.cookie("refreshToken", response.refreshToken, {
      httpOnly: true,
      maxAge: 4 * 24 * 60 * 60 * 1000,
    });
    res.json(true);
  } else {
    res.json(response);
  }
});

app.get("/api/findFriends", middleWareUser, async (req, res) => {
  const { text } = req.query;
  const userId = req.user;
  const friends = await userController.findFriends(text, userId);
  res.json(friends);
});
app.get("/api/getUser", middleWareUser, async (req, res) => {
  if (req.user) {
    const userId = req.user;
    const user = await userController.getUser(userId);
    res.json(user);
  }
});
app.get("/api/getFriends", middleWareUser, async (req, res) => {
  const userId = req.user;
  const { text } = req.query;
  const friends = await userController.getFriends(userId, text);
  res.json(friends);
});
app.get("/api/getChatWithFriend", middleWareUser, async (req, res) => {
  const userId = req.user;
  const { friendId } = req.query;
  const chat = await chatController.getChatWithFriend(userId, friendId);
  res.json(chat);
});

app.get("/api/getAllChats", middleWareUser, async (req, res) => {
  const userId = req.user;
  const { text } = req.query;
  const userChats = await chatController.getAllChats(userId, text);
  res.json(userChats);
});
app.get("/api/getChatById", middleWareUser, async (req, res) => {
  const userId = req.user;
  const { chatId } = req.query;
  const chat = await chatController.getChatById(chatId, userId);
  res.json(chat);
});
app.patch(
  "/api/changeAvatar/:userId",
  upload.single("avatar"),
  middleWareUser,
  async (req, res) => {
    const userId = req.params.userId;
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    console.log("--------------------------------");
    const response = await userController.changeAvatar(userId, req.file);
    res.json(response);
  }
);

app.use(express.static(staticFilesPath));

const server = app.listen(port, () => {
  console.log(`Express server running on http://localhost:${port}`);
  connectDB();
});

initializeWebSocket(server);
