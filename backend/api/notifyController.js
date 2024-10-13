import NotifyModel from "../schemas/notifySchema.js";
import UserModel from "../schemas/userSchema.js";

class NotifyController {
  async createNotify(receiverId, type, senderId) {
    console.log(typeof senderId);
    try {
      const sender = await UserModel.findByPk(senderId);
      let notify;
      if (type === "friendRequest") {
        notify = await NotifyModel.create({
          title: "Заявка в друзья",
          receiverId: receiverId,
          senderId: senderId,
          text: `${sender.name} отправил(а) вам заявку в друзья`,
        });
      }
      if (type === "addFriend") {
        notify = await NotifyModel.create({
          title: "Новый друг",
          receiverId: receiverId,
          senderId: senderId, 
          text: `Теперь вы и ${sender.name} друзья!`,
        });
      }
      if (type === "cancelRequest") {
        notify = await NotifyModel.create({
          title: "Запрос дружбы отклонен",
          receiverId: receiverId,
          senderId: senderId,
          text: `${sender.name} отклонил ваш запрос в друзья!`,
        });
      }
      return notify;
    } catch (error) {
      console.log(error);
    }
  }
}

export const notifyController = new NotifyController();
