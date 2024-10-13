import { DataTypes } from "sequelize";
import { db } from "../db.js";

const NotifyModel = db.define("Notify", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default NotifyModel;
