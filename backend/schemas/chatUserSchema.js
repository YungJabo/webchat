import { DataTypes } from "sequelize";
import { db } from "../db.js";
import UserModel from "./userSchema.js";
import ChatModel from "./chatSchema.js";
const ChatUserModel = db.define(
  "ChatUser",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    chatId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  { tableName: "chat_users" }
);

UserModel.belongsToMany(ChatModel, {
  through: ChatUserModel,
  foreignKey: "userId",
});

ChatModel.belongsToMany(UserModel, {
  through: ChatUserModel,
  foreignKey: "chatId",
});

export default ChatUserModel;
