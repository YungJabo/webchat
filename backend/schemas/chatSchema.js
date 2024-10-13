import { DataTypes } from "sequelize";
import { db } from "../db.js";

const ChatModel = db.define(
  "Chat",
  {
    chatName: {
      type: DataTypes.STRING, // имя чата для групповых чатов
      allowNull: true,
    },
    isGroup: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, // по умолчанию чат не является групповым
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  { tableName: "chats" }
);

export default ChatModel;
