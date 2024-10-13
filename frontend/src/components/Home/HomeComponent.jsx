import { act, useContext, useEffect, useState } from "react";
import "./Home.scss";
import messageSvg from "../../assets/images/message.svg";
import friendsSvg from "../../assets/images/friends.svg";
import { getFriends } from "../../../api/friends";
import { Friends } from "./HomeContent/Friends";
import {
  getAllChats,
  getChatById,
  openChatWithFriend,
} from "../../../api/chat";
import { Chat } from "./Chat/Chat";
import { SocketContext } from "../../pages/Home";
import { Chats } from "./HomeContent/Chats";

export const HomeComponent = () => {
  const [activeItem, setActiveItem] = useState("chats");
  const [friends, setFriends] = useState([]);
  const [chats, setChats] = useState([]);
  const [chat, setChat] = useState(null);
  const { socket } = useContext(SocketContext);
  const handleGetFriends = async (text) => {
    const friends = await getFriends(text);
    setFriends(friends);
  };
  const handleGetChats = async (text) => {
    const chats = await getAllChats(text);

    setChats(chats);
  };
  useEffect(() => {
    handleGetFriends(null);
    handleGetChats(null);
  }, [activeItem]);

  const handleGetChat = async (friendId) => {
    const chat = await openChatWithFriend(friendId);

    setChat(chat);
  };
  const handleGetChatById = async (chatId) => {
    const chat = await getChatById(chatId);
    setChat(chat);
  };
  const handleMessage = (event) => {
    const parsedMessage = JSON.parse(event.data);
    switch (parsedMessage.type) {
      case "new_message": {
        setChat((prevChat) => {
          if (prevChat && prevChat.id === parsedMessage.message.chatId) {
            return {
              ...prevChat,
              messages: [...prevChat.messages, parsedMessage.message],
            };
          }
          return prevChat;
        });

        setChats((prevChats) => {
          return prevChats.map((chat) => {
            if (chat.id === parsedMessage.message.chatId) {
              return {
                ...chat,
                messages: [...chat.messages, parsedMessage.message],
              };
            }
            return chat;
          });
        });
        break;
      }

      case "new_chat": {
        console.log(parsedMessage);
        const newChat = parsedMessage.chat;
        
        setChats((prevChats) => [...prevChats, newChat]);
      }
    }
  };
  useEffect(() => {
    if (socket) {
      socket.addEventListener("message", handleMessage);
      console.log(socket);
      return () => {
        socket.removeEventListener("message", handleMessage);
      };
    }
  }, [socket]);

  return (
    <>
      <div className="home__content">
        <aside className="home__left-menu">
          <ul className="home__left-menu__list">
            <li
              className={`home__left-menu__item ${
                activeItem === "chats" ? "active" : ""
              }`}
            >
              <button
                className="home__left-menu__button"
                onClick={() => setActiveItem("chats")}
              >
                <img src={messageSvg} alt="" className="home__left-menu__img" />
              </button>
            </li>
            <li
              className={`home__left-menu__item ${
                activeItem === "friends" ? "active" : ""
              }`}
            >
              <button
                className="home__left-menu__button"
                onClick={() => setActiveItem("friends")}
              >
                <img src={friendsSvg} alt="" className="home__left-menu__img" />
              </button>
            </li>
          </ul>
        </aside>
        <div className="home__about">
          {activeItem === "chats" ? (
            <Chats
              chats={chats}
              getChat={handleGetChatById}
              friends={friends}
            />
          ) : (
            <Friends friends={friends} openChat={handleGetChat} />
          )}
        </div>
        <Chat chat={chat} />
      </div>
    </>
  );
};
