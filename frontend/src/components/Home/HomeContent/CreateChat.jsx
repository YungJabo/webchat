import { useContext, useEffect, useState } from "react";
import { SocketContext, UserContext } from "../../../pages/Home";
import avatarImg from "../../../assets/images/avatar.png";
import groupImg from "../../../assets/images/groupAvatar.png";
import findSvg from "../../../assets/images/find.svg";
import addSvg from "../../../assets/images/add.svg";
import cancelSvg from "../../../assets/images/cancel.svg";
import fileSvg from "../../../assets/images/file.svg";
import deleteSvg from "../../../assets/images/delete.svg";

export const CreateChat = ({ friends, setIsCreateChat }) => {
  const [currentFriends, setCurrentFriends] = useState(friends);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [filePreview, setFilePreview] = useState(null);
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const { user } = useContext(UserContext);
  const { socket } = useContext(SocketContext);

  const handleFriendSelect = (friendId) => {
    setSelectedFriends((prevSelected) => {
      if (prevSelected.includes(friendId)) {
        return prevSelected.filter((id) => id !== friendId);
      } else {
        return [...prevSelected, friendId];
      }
    });
  };
  const findFriends = (e) => {
    const searchValue = e.target.value.toLowerCase();
    const filteredFriends = friends.filter((friend) =>
      friend.name.toLowerCase().includes(searchValue)
    );
    setCurrentFriends(filteredFriends);
  };
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const validImageTypes = ["image/jpeg", "image/png"];
    if (!validImageTypes.includes(selectedFile.type)) {
      alert("Только файлы форматов JPG и PNG разрешены.");
      setFile(null);
      setFilePreview(null);
      return;
    }
    setFile(selectedFile);

    if (selectedFile && selectedFile.type.startsWith("image/")) {
      const fileURL = URL.createObjectURL(selectedFile);
      setFilePreview(fileURL);
    } else {
      setFilePreview(null);
    }
  };
  const handleDeleteFile = (e) => {
    e.preventDefault();
    setFile(null);
    setFilePreview(null);
  };
  const handleCreateChat = async (e) => {
    e.preventDefault();

    if (name.trim() === "" || selectedFriends.length === 0) {
      return;
    }
    let groupData = {
      name: name,
      image: null,
      users: selectedFriends,
      userId: user.id,
    };

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        groupData.image = reader.result;
        socket.send(
          JSON.stringify({
            type: "create_group",
            groupData: groupData,
          })
        );
      };
      reader.readAsDataURL(file);
    } else {
      socket.send(
        JSON.stringify({
          type: "create_group",
          groupData: groupData,
        })
      );
    }

    setIsCreateChat(false);
  };
  return (
    <>
      {currentFriends && (
        <div className="home__friends">
          <h2 className="home__friends__title">Создание чата</h2>
          <div className="home__friends__top">
            <label
              className="home__friends__find-block"
              htmlFor="filter-friends"
            >
              <img src={findSvg} alt="" className="home__friends__find-img" />
              <input
                type="text"
                className="home__friends__find-input"
                onChange={(e) => findFriends(e)}
                id="filter-friends"
              />
            </label>
            <button
              className="home__chats__create"
              onClick={() => setIsCreateChat(false)}
            >
              <img src={cancelSvg} alt="" />
            </button>
          </div>
          <form
            className="home__create-chat"
            encType="multipart/form-data"
            onSubmit={handleCreateChat}
          >
            <div className="home__create-chat__top">
              <input
                type="text"
                name=""
                id=""
                placeholder="Введите название"
                className="home__create-chat__name"
                onChange={(e) => setName(e.target.value)}
              />
              <input
                type="file"
                id="fileInput"
                className="chat__file"
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept=".jpg, .jpeg, .png"
              />
              <label htmlFor="fileInput" className="chat__file-label">
                <img src={fileSvg} alt="Прикрепить файл" />
              </label>
            </div>
            {file && (
              <div className="chat__uploaded-file">
                <div className="chat__uploaded-file__name">{file.name}</div>
                {filePreview && (
                  <img
                    src={filePreview}
                    alt="Превью файла"
                    className="chat__uploaded-file__img"
                  />
                )}
                <button
                  className="chat__uploaded-file__cancel"
                  onClick={(e) => handleDeleteFile(e)}
                >
                  <img src={deleteSvg} alt="" />
                </button>
              </div>
            )}
            <button className="home__create-chat__create" type="submit">
              Создать чат
            </button>
          </form>
          <ul className="home__friends__list">
            {currentFriends.map((friend, index) => (
              <li className="home__friend" key={index}>
                <label
                  htmlFor={`checkbox-${index}`}
                  className="home__friend__choose"
                >
                  <div className="home__friend__about">
                    <img
                      src={(friend && friend.avatar) || avatarImg}
                      alt=""
                      className="home__friend__avatar"
                    />
                    <div className="home__friend__name">{friend.name}</div>

                    <input
                      type="checkbox"
                      name=""
                      id={`checkbox-${index}`}
                      style={{ display: "none" }}
                      onChange={() => handleFriendSelect(friend.id)}
                    />
                    <div
                      className={`home__friend__checkbox ${
                        selectedFriends.includes(friend.id) ? "active" : ""
                      }`}
                    ></div>
                  </div>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
};
