import { config } from "dotenv";
import jwt from "jsonwebtoken";
import UserModel from "../schemas/userSchema.js";
import { tokenController } from "./tokenController.js";

config();

const secretKey = process.env.JWT_SECRET;

export const middleWareUser = async (req, res, next, isUpgrade = false) => {
  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    if ((!accessToken || !refreshToken) && req.path !== "/login") {
      return res.redirect("/login");
    }
    if ((!accessToken || !refreshToken) && req.path === "/login") {
      return next();
    }

    try {
      const decodedAccess = jwt.verify(accessToken, secretKey);
      const { email } = decodedAccess;

      const user = await UserModel.findOne({ where: { email } });

      if (user) {
        req.user = user.id;
        return next();
      } else {
        return res.status(403).json({ error: "Access denied." });
      }
    } catch (accessError) {
      console.log("Access token error:", accessError.message);

      // Проверка refreshToken, если accessToken невалиден
      try {
        const decodedRefresh = jwt.verify(refreshToken, secretKey);
        const { email } = decodedRefresh;
        const user = await UserModel.findOne({ where: { email } });

        if (user) {
          req.user = user.id;

          if (!isUpgrade) {
            const { accessToken, refreshToken } =
              await tokenController.createTokens(email);

            res.cookie("accessToken", accessToken, {
              httpOnly: true,
              maxAge: 60 * 60 * 1000,
            });
            res.cookie("refreshToken", refreshToken, {
              httpOnly: true,
              maxAge: 2 * 24 * 60 * 60 * 1000,
            });
          }

          return next();
        } else {
          return res.status(403).json({ error: "Access denied." });
        }
      } catch (refreshError) {
        console.log("Refresh token error:", refreshError.message);
        return res.redirect("/login");
      }
    }
  } catch (error) {
    console.log("Ошибка!!!", error);
  }
};
