import { useContext, useEffect, useState } from "react";
import { UserContext } from "../../../pages/Home";
import avatarImg from "../../../assets/images/avatar.png";
import groupImg from "../../../assets/images/groupAvatar.png";
import findSvg from "../../../assets/images/find.svg";
import addSvg from "../../../assets/images/add.svg";

import { CreateChat } from "./CreateChat";

export const Chats = ({ chats, getChat, friends }) => {
  const { user } = useContext(UserContext);
  const [currentChats, setCurrentChats] = useState(chats);
  const [isCreateChat, setIsCreateChat] = useState(false);

  const findChats = (e) => {
    const searchValue = e.target.value.toLowerCase();

    const filteredChats = chats.filter((chat) => {
      let otherUser = null;

      if (!chat.isGroup) {
        otherUser = chat.users.find(
          (currentUser) => currentUser.id !== user.id
        );
      }

      return (
        (chat.name && chat.name.toLowerCase().includes(searchValue)) ||
        (otherUser && otherUser.name.toLowerCase().includes(searchValue))
      );
    });

    setCurrentChats(filteredChats);
  };
  useEffect(() => {
    setCurrentChats(chats);
  }, [chats]);
  return (
    <>
      {currentChats && user && (
        <>
          {isCreateChat ? (
            <CreateChat friends={friends} setIsCreateChat={setIsCreateChat} />
          ) : (
            <div className="home__chats">
              <div className="home__chats__top">
                <label
                  className="home__chats__find-block"
                  htmlFor="filter-chats"
                >
                  <img src={findSvg} alt="" className="home__chats__find-img" />
                  <input
                    type="text"
                    className="home__chats__find-input"
                    onChange={(e) => findChats(e)}
                    id="filter-chats"
                  />
                </label>
                <button
                  className="home__chats__create"
                  onClick={() => setIsCreateChat(!isCreateChat)}
                >
                  <img src={addSvg} alt="" />
                </button>
              </div>
              <ul className="home__chats__list">
                {currentChats.map((chat, index) => {
                  let otherUser = null;
                  if (!chat.isGroup) {
                    otherUser = chat.users.find(
                      (friend) => friend.id !== user.id
                    );
                  }
                  return (
                    <li
                      className="home__chat"
                      key={index}
                      onClick={() => getChat(chat.id)}
                    >
                      <div className="home__chat__about">
                        {chat.isGroup ? (
                          <img
                            className="home__chat__avatar"
                            src={chat.image ? chat.image : groupImg}
                          />
                        ) : (
                          <img
                            className="home__chat__avatar"
                            src={
                              otherUser.avatar ? otherUser.avatar : avatarImg
                            }
                          />
                        )}

                        <div className="home__chat__block">
                          <div className="home__chat__name">
                            {chat.chatName || otherUser.name}
                          </div>
                          <div className="home__chat__last-message">
                            {chat.messages && chat.messages.length > 0
                              ? chat.messages[chat.messages.length - 1].text
                              : ""}
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </>
      )}
    </>
  );
};
