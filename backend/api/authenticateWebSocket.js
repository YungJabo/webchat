import jwt from "jsonwebtoken";
import { UserModel } from "../schemas/userSchema.js";
import { tokenController } from "./tokenController.js";
import { config } from "dotenv";

config();

const secretKey = process.env.JWT_SECRET;

export async function authenticateWebSocket(req, ws) {
  try {
    
    const cookies = req.headers.cookie?.split("; ") || [];
    const cookieMap = Object.fromEntries(
      cookies.map((cookie) => cookie.split("="))
    );

    const accessToken = cookieMap.accessToken;
    const refreshToken = cookieMap.refreshToken;

    if (!accessToken || !refreshToken) {
      ws.close(4001, "Unauthorized: Missing tokens");
      return null;
    }

    let decodedAccess;
    try {
      decodedAccess = jwt.verify(accessToken, secretKey);
      const { email } = decodedAccess;
      const user = await UserModel.findOne({ email });
      if (user) {
        return user;
      } else {
        ws.close(4001, "Unauthorized: Invalid tokens");
        return null;
      }
    } catch (err) {
      try {
        const decodedRefresh = jwt.verify(refreshToken, secretKey);
        const { email } = decodedRefresh;
        const user = await UserModel.findOne({ email });
        if (user) {
          return user;
        } else {
          ws.close(4001, "Unauthorized: Invalid tokens");
          return null;
        }
      } catch (err) {
        ws.close(4001, "Unauthorized: Invalid tokens");
        return null;
      }
    }
  } catch (error) {
    console.error("Ошибка аутентификации WebSocket:", error);
    ws.close(4002, "Error during connection");
    return null;
  }
}
