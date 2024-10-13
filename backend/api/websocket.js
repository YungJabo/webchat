// websocket.js

import { WebSocketServer } from "ws";
import { middleWareUser } from "./middleWareUser.js";
import { userController } from "./userController.js";
import { notifyDto } from "../dto/dto.js";
import { chatController } from "./chatController.js";
import ChatUserModel from "../schemas/chatUserSchema.js";

export function initializeWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on("connection", async (ws, req) => {
    console.log("Новое WebSocket соединение");
    wss.clients.forEach((ws) => {
      ws.send(JSON.stringify({ type: "test", text: "test" }));
    });

    ws.on("message", async (message) => {
      const parsedMessage = JSON.parse(message);
      switch (parsedMessage.type) {
        case "set_userId": {
          const userId = parsedMessage.id;
          ws.userId = userId;
          break;
        }
        case "friend_request": {
          const { receiverId, senderId } = parsedMessage;
          const notify = await userController.sendFriendRequest(
            senderId,
            receiverId
          );
          if (notify) {
            const notifications = await userController.getNotifications(
              receiverId
            );
            wss.clients.forEach((ws) => {
              if (ws.userId.toString() === senderId.toString()) {
                ws.send(
                  JSON.stringify({ type: "has_requested", id: receiverId })
                );
              }
              if (ws.userId.toString() === receiverId.toString()) {
                ws.send(
                  JSON.stringify({
                    type: "has_received_notification",
                    notify: notify,
                  })
                );
                ws.send(
                  JSON.stringify({
                    type: "updateNotifications",
                    notifications: notifications,
                  })
                );
              }
            });
          }
          break;
        }

        case "action_for_friendRequest": {
          const { action, notifyId } = parsedMessage;
          const { notify1, notify2 } =
            await userController.actionForFriendRequest(action, notifyId);
          const notifications1 = await userController.getNotifications(
            notify1.receiverId
          );
          const notifications2 = await userController.getNotifications(
            notify2.receiverId
          );
          wss.clients.forEach((ws) => {
            if (ws.userId.toString() === notify1.receiverId.toString()) {
              ws.send(
                JSON.stringify({
                  type: "has_received_notification",
                  notify: notifyDto(notify1),
                })
              );
              ws.send(
                JSON.stringify({
                  type: "updateNotifications",
                  notifications: notifications1,
                })
              );
            }
            if (
              notify2 &&
              ws.userId.toString() === notify2.receiverId.toString()
            ) {
              ws.send(
                JSON.stringify({
                  type: "has_received_notification",
                  notify: notifyDto(notify2),
                })
              );
              ws.send(
                JSON.stringify({
                  type: "updateNotifications",
                  notifications: notifications2,
                })
              );
            }
          });
          break;
        }
        case "send_message": {
          const newMessage = await chatController.sendMessage(
            parsedMessage.messageData
          );
          if (newMessage) {
            const chatUsers = await ChatUserModel.findAll({
              where: { chatId: parsedMessage.messageData.chatId },
            });

            const userIds = chatUsers.map((chatUser) => chatUser.userId);

            wss.clients.forEach((client) => {
              if (client.userId && userIds.includes(client.userId)) {
                client.send(
                  JSON.stringify({
                    type: "new_message",
                    message: {
                      id: newMessage.id,
                      text: newMessage.text,
                      image: newMessage.image,
                      sentAt: newMessage.sentAt,
                      senderId: newMessage.senderId,
                      chatId: newMessage.chatId,
                    },
                  })
                );
              }
            });
          }
          break;
        }
        case "create_group": {
          const { groupData } = parsedMessage;
          const newChat = await chatController.createGroupChat(groupData);
          wss.clients.forEach((client) => {
            if (
              client.userId &&
              (groupData.users.includes(client.userId) ||
                client.userId === groupData.userId)
            ) {
              client.send(
                JSON.stringify({
                  type: "new_chat",
                  chat: newChat,
                })
              );
            }
          });
        }
      }
    });

    ws.on("close", async () => {
      console.log("WebSocket соединение закрыто");
    });
  });
  console.log("WebSocket сервер инициализирован");
  return wss;
}
