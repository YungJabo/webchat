import UserModel from "../schemas/userSchema.js";
import ChatModel from "../schemas/chatSchema.js";
import ChatUserModel from "../schemas/chatUserSchema.js";
import MessageModel from "../schemas/MessageSchema.js";
import { chatDto } from "../dto/dto.js";
import { Op } from "sequelize";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Sequelize from "sequelize";
import { uniqueName } from "./uniqueName.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ChatController {
  async getChatWithFriend(userId, friendId) {
    try {
      const existingChat = await ChatModel.findOne({
        include: [
          {
            model: UserModel,
            through: { attributes: [] },
            where: {
              id: {
                [Op.in]: [userId, friendId],
              },
            },
            required: true,
          },
          {
            model: MessageModel,
            attributes: ["text", "image", "sentAt", "senderId", "chatId", "id"],
          },
        ],
        group: ["Chat.id"],
      });

      if (existingChat && existingChat.Users.length === 2) {
        return chatDto(existingChat);
      }

      const newChat = await ChatModel.create({
        isGroup: false,
      });

      await ChatUserModel.bulkCreate([
        { userId: userId, chatId: newChat.id },
        { userId: friendId, chatId: newChat.id },
      ]);
      const fullNewChat = await ChatModel.findOne({
        where: { id: newChat.id },
        include: [
          {
            model: UserModel,
            through: { attributes: [] },
            where: {
              id: {
                [Op.in]: [userId, friendId],
              },
            },
          },
          {
            model: MessageModel,
            attributes: ["text", "image", "sentAt", "senderId", "chatId", "id"],
          },
        ],
      });

      return chatDto(fullNewChat);
    } catch (error) {
      console.error("Error in getChatWithFriend:", error);
      throw new Error("Failed to get or create chat.");
    }
  }
  async sendMessage(message) {
    try {
      let imagePath = null;
      if (message.image) {
        const matches = message.image.match(
          /^data:(image\/[a-zA-Z]+);base64,(.+)$/
        );

        if (matches) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          const extension = mimeType.split("/")[1];

          const fileName = uniqueName() + "." + extension;
          const filePath = path.join(__dirname, "../images/chats", fileName);

          await fs.promises.writeFile(filePath, base64Data, {
            encoding: "base64",
          });
          imagePath = `http://localhost:3000/images/chats/${fileName}`; // Сохраняем путь к изображению
        }
      }
      const newMessage = await MessageModel.create({
        text: message.text,
        image: imagePath,
        chatId: message.chatId,
        senderId: message.senderId,
        chatId: message.chatId,
      });

      return newMessage;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async getAllChats(userId, text) {
    try {
      const userChats = await ChatModel.findAll({
        include: [
          {
            model: UserModel,
            through: {
              attributes: ["userId", "chatId"],
            },
            attributes: ["id", "name", "avatar"],
            required: true,
          },

          {
            model: MessageModel,
            attributes: ["text", "image", "sentAt", "senderId", "chatId", "id"],
          },
        ],
        where: {
          id: {
            [Op.in]: Sequelize.literal(
              `(SELECT chatId FROM chat_users WHERE userId = ${userId})`
            ),
          },
        },
        ...(text
          ? {
              include: [
                {
                  model: UserModel,
                  through: { attributes: [] },
                  where: {
                    name: {
                      [Op.like]: `%${text}%`,
                    },
                    id: {
                      [Op.ne]: userId,
                    },
                  },
                  required: true,
                },
              ],
            }
          : {}),
      });

      const userChatsDto = userChats.map((chat) => chatDto(chat));

      return userChatsDto;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
  async getChatById(chatId, userId) {
    try {
      const existingChat = await ChatModel.findOne({
        where: {
          [Op.and]: [
            { id: chatId },
            {
              id: {
                [Op.in]: Sequelize.literal(
                  `(SELECT chatId FROM chat_users WHERE userId = ${userId})`
                ),
              },
            },
          ],
        },
        include: [
          {
            model: UserModel,
            through: {
              attributes: [],
            },
            attributes: ["id", "name", "avatar"],
            required: true,
          },
          {
            model: MessageModel,
            attributes: ["text", "image", "sentAt", "senderId", "chatId", "id"],
          },
        ],
      });

      if (existingChat) {
        return chatDto(existingChat);
      }
    } catch (error) {
      throw new Error("Failed to get or create chat.");
    }
  }
  async createGroupChat(groupData) {
    try {
      const { users, name, image, userId } = groupData;
      let imagePath = null;
      if (image) {
        const matches = image.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);

        if (matches) {
          const mimeType = matches[1];
          const base64Data = matches[2];
          const extension = mimeType.split("/")[1];

          const fileName =
            base64Data.slice(-30).replace(/\//g, "") + "." + extension;
          const filePath = path.join(__dirname, "../images/chats", fileName);

          await fs.promises.writeFile(filePath, base64Data, {
            encoding: "base64",
          });
          imagePath = `http://localhost:3000/images/chats/${fileName}`;
        }
      }
      const newChat = await ChatModel.create({
        isGroup: true,
        chatName: name,
        image: imagePath,
      });
      const chatUsers = users.map((userId) => ({
        userId: userId,
        chatId: newChat.id,
      }));
      chatUsers.push({ userId: userId, chatId: newChat.id });
      console.log(users, chatUsers);
      await ChatUserModel.bulkCreate(chatUsers);
      const currentChat = await this.getChatById(newChat.id, userId);
      return currentChat;
    } catch (error) {
      console.log(error);
      return false;
    }
  }
}

export const chatController = new ChatController();
