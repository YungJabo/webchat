import { config } from "dotenv";
import jwt from "jsonwebtoken";
import UserModel from "../schemas/userSchema.js";

config();

const secretKey = process.env.JWT_SECRET;

class TokenController {
  async createTokens(email) {
    const accessToken = jwt.sign({ email: email }, secretKey, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign({ email: email }, secretKey, {
      expiresIn: "2d",
    });

    return { accessToken, refreshToken };
  }
  async activationToken(email) {
    const activationToken = jwt.sign({ email: email }, secretKey, {
      expiresIn: "30m",
    });
    return activationToken;
  }

  async verifyToken(token) {
    try {
      const decodedAccess = jwt.verify(token, secretKey);
      if (decodedAccess) {
        return decodedAccess.email;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
}

export const tokenController = new TokenController();
