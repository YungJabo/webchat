import { useRef, useState } from "react";
import avatarImg from "../../../assets/images/avatar.png";
import deleteFriendSvg from "../../../assets/images/delete_friend.svg";
import starMessageSvg from "../../../assets/images/start_message.svg";
import findSvg from "../../../assets/images/find.svg";

export const Friends = ({ friends, openChat }) => {
  const [currentFriends, setCurrentFriends] = useState(friends);
  const findFriends = (e) => {
    const searchValue = e.target.value.toLowerCase();
    const filteredFriends = friends.filter((friend) =>
      friend.name.toLowerCase().includes(searchValue)
    );
    setCurrentFriends(filteredFriends);
  };
  return (
    <>
      {currentFriends && (
        <div className="home__friends">
          <label className="home__friends__find-block" htmlFor="filter-friends">
            <img src={findSvg} alt="" className="home__friends__find-img" />
            <input
              type="text"
              className="home__friends__find-input"
              onChange={(e) => findFriends(e)}
              id="filter-friends"
            />
          </label>
          <ul className="home__friends__list">
            {currentFriends.map((friend, index) => (
              <li className="home__friend" key={index}>
                <div className="home__friend__about">
                  <img
                    src={(friend && friend.avatar) || avatarImg}
                    alt=""
                    className="home__friend__avatar"
                  />
                  <div className="home__friend__name">{friend.name}</div>
                  <div className="home__friend__buttons">
                    <button
                      className="home__friend__button"
                      onClick={() => openChat(friend.id)}
                    >
                      <img
                        src={starMessageSvg}
                        alt=""
                        className="home__friend__button-img"
                      />
                    </button>
                    <button className="home__friend__button">
                      <img
                        src={deleteFriendSvg}
                        alt=""
                        className="home__friend__button-img"
                      />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};
