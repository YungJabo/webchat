import "./Header.scss";
import findSvg from "../../assets/images/find.svg";
import { useEffect, useRef, useState } from "react";
import { findFriends } from "../../../api/friends";
import avatarImg from "../../assets/images/avatar.png";
import nofityImg from "../../assets/images/notify.svg";
import Icon from "./addFriendSvg";
import { useContext } from "react";
import { Link } from "react-router-dom";

export const Header = ({ user, socket, notifications }) => {
  const [inputValue, setInputValue] = useState("");
  const [friends, setFriends] = useState([]);
  const [lastFriends, setLastFriends] = useState([]);
  const [isOpenNotify, setIsOpenNotify] = useState(false);

  const findRef = useRef();
  const handleInputChange = async () => {
    setInputValue(findRef.current.value);
    const newFriends = await findFriends(findRef.current.value);
    if (newFriends.length === 0) {
      setLastFriends(friends);
    }
    setFriends(newFriends);
  };
  const sendFriendRequest = async (receiverId) => {
    socket.send(
      JSON.stringify({
        type: "friend_request",
        receiverId: receiverId,
        senderId: user.id,
      })
    );
  };
  const sendActionForRequest = async (notifyId, action) => {
    socket.send(
      JSON.stringify({
        type: "action_for_friendRequest",
        action: action,
        notifyId: notifyId,
      })
    );
  };

  return (
    <>
      <div className="header">
        <div className="header__friends">
          <img src={findSvg} alt="" className="header__friends__find-img" />
          <input
            ref={findRef}
            type="text"
            className="header__friends__input"
            id="find-friends"
            onChange={() => handleInputChange()}
          />
          <label
            htmlFor="find-friends"
            className={`header__friends__placeholder ${
              inputValue.trim() ? "active" : ""
            }`}
          >
            Искать друзей
          </label>
        </div>
        <div className="lk">
          <div
            className="lk__notify-block"
            onMouseEnter={() => setIsOpenNotify(true)}
            onMouseLeave={() => setIsOpenNotify(false)}
          >
            <button className="lk__notify lk__notify--active">
              <img src={nofityImg} alt="" className="lk__notify__img" />
            </button>
            <ul
              className={`lk__notifications ${isOpenNotify ? "active" : ""} `}
              onMouseEnter={() => setIsOpenNotify(true)}
              onMouseLeave={() => setIsOpenNotify(false)}
            >
              {notifications.map((notify, index) => (
                <li key={index} className="lk__notification">
                  <h2 className="lk__notification__title">{notify.title}</h2>
                  <p className="lk__notitication__subtitle">{notify.text}</p>
                  <div
                    className={`lk__notification__buttons ${
                      notify.title === "Заявка в друзья" ? "" : "disable"
                    }`}
                  >
                    <button
                      className="lk__notification__button"
                      data-text="Принять"
                      onClick={() => sendActionForRequest(notify.id, true)}
                    ></button>
                    <button
                      className="lk__notification__button"
                      data-text="Отклонить"
                      onClick={() => sendActionForRequest(notify.id, false)}
                    ></button>
                  </div>
                </li>
              ))}
              {notifications.length === 0 ? (
                <>
                  <li className="lk__notification">
                    <h2 className="lk__notification__title">Уведомлений нет</h2>
                  </li>
                </>
              ) : (
                ""
              )}
            </ul>
          </div>

          <Link to={"/profile"} className="lk__user">
            <img
              src={(user && user.avatar) || avatarImg}
              alt=""
              className="lk__avatar"
            />
            <div className="lk__name">{user && user.name}</div>
          </Link>
        </div>

        <ul className={`people ${friends.length > 0 ? "people--active" : ""}`}>
          {friends.length > 0
            ? friends.map((friend, index) => (
                <li
                  key={index}
                  className="guy"
                  style={{
                    transitionDelay: `${Math.min(index, 10) * 120}ms`, // Задержка 100ms для первых 10 элементов
                  }}
                >
                  <img
                    src={friend.avatar || avatarImg}
                    alt=""
                    className="guy__avatar"
                  />
                  <div className="guy__name">{friend.name}</div>
                  {!friend.isFriend ? (
                    <button
                      className={`guy__button guy__button--send ${
                        friend.isRequested ? "disable" : ""
                      }`}
                      onClick={() => sendFriendRequest(friend.id)}
                    >
                      <Icon></Icon>
                    </button>
                  ) : (
                    <button className="guy__button guy__button--message"></button>
                  )}
                </li>
              ))
            : lastFriends.map((friend, index) => (
                <li
                  key={index}
                  className="guy"
                  style={{
                    transitionDelay: `${Math.min(index, 10) * 120}ms`, // Задержка 100ms для первых 10 элементов
                  }}
                >
                  <img
                    src={friend.avatar || avatarImg}
                    alt=""
                    className="guy__avatar"
                  />
                  <div className="guy__name">{friend.name}</div>
                </li>
              ))}
        </ul>
      </div>
    </>
  );
};
