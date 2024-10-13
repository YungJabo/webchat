import UserModel from "../schemas/userSchema.js";
import bcrypt from "bcrypt";
import { tokenController } from "./tokenController.js";
import { mailController } from "./mailController.js";
import { notifyDto, userDto } from "../dto/dto.js";
import { notifyController } from "./notifyController.js";
import NotifyModel from "../schemas/notifySchema.js";
import UserFriendsModel from "../schemas/userFriendsSchema.js";
import { Op } from "sequelize";
import { model } from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { uniqueName } from "./uniqueName.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
class UserController {
  async registration(name, email, pass) {
    try {
      const candidate = await UserModel.findOne({ where: { email } });
      if (candidate) {
        throw new Error("User already exists");
      }
      const hashPassword = await bcrypt.hash(pass, 5);
      await UserModel.create({
        name: name,
        email: email,
        password: hashPassword,
      });
      const activationToken = await tokenController.activationToken(email);
      const activationLink = `http://localhost:3000/api/activation/${activationToken}`;
      await mailController.sendActivationMail(email, activationLink);
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  async activateAccount(token) {
    try {
      const email = await tokenController.verifyToken(token);
      if (!email) {
        return false;
      }
      await UserModel.update({ isActive: true }, { where: { email } });
      const { accessToken, refreshToken } = await tokenController.createTokens(
        email
      );

      return { accessToken, refreshToken };
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  async login(email, pass) {
    try {
      let check = true;
      const candidate = await UserModel.findOne({ where: { email } });
      if (!candidate) {
        check = false;
      }
      const isPasswordMatch = await bcrypt.compare(pass, candidate.password);
      if (!isPasswordMatch) {
        check = false;
      }
      if (!check) {
        return { success: false, message: "Password or email are incorrect" };
      }
      if (!candidate.isActive) {
        return { success: false, message: "Account is not activated" };
      }
      const { accessToken, refreshToken } = await tokenController.createTokens(
        email
      );
      return { success: true, accessToken, refreshToken };
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  async linkToChangePass(email) {
    try {
      const candidate = await UserModel.findOne({ where: { email } });
      if (!candidate) {
        return false;
      }
      const resetToken = await tokenController.activationToken(email);
      const resetLink = `http://localhost:3000/login/${resetToken}`;
      await mailController.sendChangePassMail(email, resetLink);
      return {
        success: true,
        message: "Password reset link sent to your email",
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
        message: "An error occurred while sending the reset link",
      };
    }
  }
  async changePass(token, newPassword) {
    try {
      const email = await tokenController.verifyToken(token);
      if (!email) {
        return false;
      }

      const hashPassword = await bcrypt.hash(newPassword, 5);
      await UserModel.update({ password: hashPassword }, { where: { email } });
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  async findFriends(text, userId) {
    try {
      if (text === "") {
        return [];
      }
      const currentUser = await UserModel.findByPk(userId, {
        include: { model: UserFriendsModel, as: "friends" },
      });

      const friends = await UserModel.findAll({
        where: {
          name: { [Op.like]: `%${text}%` },
          id: { [Op.ne]: userId },
        },
        include: [
          {
            model: NotifyModel,
            as: "notifications",
          },
        ],
      });

      return friends.map((user) => {
        const isFriend = currentUser.friends.some(
          (friend) => friend.id.toString() === user.id.toString()
        );

        const isRequested = user.notifications.some(
          (notification) =>
            notification.senderId === userId &&
            notification.receiverId === user.id
        );

        return {
          ...userDto(user),
          isFriend: isFriend,
          isRequested: isRequested,
        };
      });
    } catch (error) {
      console.log(error);
      return [];
    }
  }
  async getUser(userId) {
    console.log(userId);
    try {
      const user = await UserModel.findByPk(userId, {
        include: { model: NotifyModel, as: "notifications" },
      });
      if (user) {
        const userData = userDto(user);
        userData.notifications = user.notifications.map((notify) =>
          notifyDto(notify)
        );
        return userData;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async sendFriendRequest(senderId, receiverId) {
    try {
      const notify = await notifyController.createNotify(
        receiverId,
        "friendRequest",
        senderId
      );

      return notifyDto(notify);
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async actionForFriendRequest(action, notifyId) {
    try {
      const notify = await NotifyModel.findByPk(notifyId);
      if (!notify || notify.title !== "Заявка в друзья") {
        throw new Error("Уведомление не найдено или это не заявка в друзья");
      }
      const { senderId, receiverId } = notify;
      let newNotify1;
      let newNotify2;

      if (action) {
        await UserFriendsModel.create({
          userId: senderId,
          friendId: receiverId,
        });
        await UserFriendsModel.create({
          userId: receiverId,
          friendId: senderId,
        });
        newNotify1 = await notifyController.createNotify(
          receiverId,
          "addFriend",
          senderId
        );
        newNotify2 = await notifyController.createNotify(
          senderId,
          "addFriend",
          receiverId
        );
      } else {
        newNotify1 = await notifyController.createNotify(
          senderId,
          "cancelRequest",
          receiverId
        );
        newNotify2 = null;
      }
      await NotifyModel.destroy({
        where: {
          id: notifyId,
        },
      });

      return { notify1: newNotify1, notify2: newNotify2 };
    } catch (error) {
      console.error("Ошибка при обработке заявки в друзья:", error);
      return false;
    }
  }
  async getNotifications(userId) {
    console.log(typeof userId);
    try {
      const user = await UserModel.findByPk(userId, {
        include: [{ model: NotifyModel, as: "notifications" }],
      });
      const notifications = user.notifications.map((notify) =>
        notifyDto(notify)
      );
      return notifications;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  async getFriends(userId, text) {
    try {
      const friends = await UserFriendsModel.findAll({
        where: { userId },
        attributes: ["friendId"],
      });

      const friendIds = friends.map((friend) => friend.friendId);

      if (friendIds.length === 0) {
        return [];
      }

      const whereCondition = {
        id: friendIds,
      };
      if (text) {
        whereCondition.name = { [Op.like]: `%${text}%` };
      }

      const friendList = await UserModel.findAll({
        where: whereCondition,
        attributes: ["id", "name", "avatar"],
      });

      return friendList;
    } catch (error) {
      console.error("Error fetching friends:", error);
      throw new Error("Could not fetch friends");
    }
  }

  async changeAvatar(userId, avatar) {
    try {
      const fileName = uniqueName() + avatar.originalname;
      const imagePath = `http://localhost:3000/images/users/${fileName}`;
      const filePath = path.join(__dirname, "../images/users", fileName);
      await fs.promises.writeFile(filePath, avatar.buffer);
      await UserModel.update(
        { avatar: imagePath },
        {
          where: {
            id: userId,
          },
        }
      );
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

export const userController = new UserController();
