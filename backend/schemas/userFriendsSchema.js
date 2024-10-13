import { DataTypes } from "sequelize";
import { db } from "../db.js";

const UserFriendsModel = db.define(
  "UserFriends",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    friendId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  { tableName: "userfriends" }
);

export default UserFriendsModel;
