import React, { useEffect, useRef, useState, createContext } from "react";
import { Header } from "../components/Header/Header";
import { HomeComponent } from "../components/Home/HomeComponent";
import { Notify } from "../components/Home/Notify";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../api/user";

export const UserContext = createContext();
export const SocketContext = createContext();

export const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState();
  const [notifications, setNotifications] = useState([]);
  const [notify, setNotify] = useState(null);

  const handleGetUser = async () => {
    const user = await getUser();
    setUser(user);
  };
  useEffect(() => {
    handleGetUser();
  }, []);

  useEffect(() => {
    if (user) {
      setNotifications(user.notifications);
      const ws = new WebSocket("ws://localhost:3000");

      ws.onopen = () => {
        console.log("Соединение открыто");
        ws.send(
          JSON.stringify({
            type: "set_userId",
            id: user.id,
          })
        );
      };
      ws.onmessage = (event) => {
        try {
          const parsedMessage = JSON.parse(event.data);

          console.log("Получено сообщение:", parsedMessage);
          switch (parsedMessage.type) {
            case "has_requested": {
              const id = parsedMessage.id;
              const updatedFriends = friends.map((friend) =>
                friend.id === id ? { ...friend, isRequested: true } : friend
              );
              setFriends(updatedFriends);
              setLastFriends(updatedFriends);
              break;
            }
            case "updateNotifications": {
              const updatedNotifications = [...parsedMessage.notifications];
              setNotifications(updatedNotifications);
              break;
            }
            case "has_received_notification": {
              const notify = parsedMessage.notify;
              setNotify(notify);
              break;
            }
            case "new__message": {
              const message = parsedMessage.message;
            }
          }
        } catch (error) {
          console.error("Ошибка при парсинге сообщения:", event.data); // Выводим непарсируемое сообщение
        }
      };

      ws.onerror = (error) => {
        console.error("Ошибка WebSocket:", error);
      };

      ws.onclose = () => {
        console.log("Соединение закрыто");
      };

      setSocket(ws);

      return () => {
        ws.close();
        setSocket(null);
      };
    }
  }, [user]);

  return (
    <>
      <SocketContext.Provider
        value={{
          socket,
        }}
      >
        <UserContext.Provider value={{ user }}>
          <div className="page home">
            <Header user={user} socket={socket} notifications={notifications} />
            <HomeComponent />
            <Notify notify={notify} setNotify={setNotify} />
          </div>
        </UserContext.Provider>
      </SocketContext.Provider>
    </>
  );
};
