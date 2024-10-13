import { DataTypes } from "sequelize";
import { db } from "../db.js";
import NotifyModel from "./notifySchema.js";
import UserFriendsModel from "./userFriendsSchema.js";

const UserModel = db.define(
  "User",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    avatar: {
      type: DataTypes.STRING,
      defaultValue: null,
      allowNull: true,
    },
  },
  { tableName: "users" }
);

UserModel.hasMany(NotifyModel, {
  as: "notifications",
  foreignKey: "receiverId",
});
NotifyModel.belongsTo(UserModel, { foreignKey: "receiverId" });
UserModel.hasMany(UserFriendsModel, {
  as: "friends",
  foreignKey: "userId",
});
UserFriendsModel.belongsTo(UserModel, { foreignKey: "userId" });

export default UserModel;
