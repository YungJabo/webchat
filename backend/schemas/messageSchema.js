import { DataTypes } from "sequelize";
import { db } from "../db.js";
import UserModel from "./userSchema.js";
import ChatModel from "./chatSchema.js";

const MessageModel = db.define(
  "Message",
  {
    text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    sentAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    chatId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  { tableName: "messages" }
);

// Сообщения принадлежат как пользователю, так и чату
MessageModel.belongsTo(UserModel, { foreignKey: "senderId" });
UserModel.hasMany(MessageModel, { foreignKey: "senderId" });

MessageModel.belongsTo(ChatModel, { foreignKey: "chatId" });
ChatModel.hasMany(MessageModel, { foreignKey: "chatId" });

export default MessageModel;
