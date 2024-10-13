import {
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { SocketContext, UserContext } from "../../../pages/Home";
import avatar from "../../../assets/images/avatar.png";
import sendSvg from "../../../assets/images/send.svg";
import fileSvg from "../../../assets/images/file.svg";
import groupAvatar from "../../../assets/images/groupAvatar.png";

import deleteSvg from "../../../assets/images/delete.svg";
import { dateDto } from "../../../../dto.js";

export const Chat = ({ chat }) => {
  const { user } = useContext(UserContext);
  const [chatName, setChatName] = useState(null);
  const [chatImg, setChatImg] = useState(null);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const { socket } = useContext(SocketContext);
  const chatContentRef = useRef(null);

  useEffect(() => {
    console.log(chat);
    if (chat) {
      const usersInChat = chat.users;

      if (!chat.isGroup) {
        const friend = usersInChat.find(
          (userInChat) => userInChat.id !== user.id
        );
        setChatName(friend.name);
        setChatImg(friend.avatar || avatar);
      } else {
        const chatName = chat.chatName;
        setChatName(chatName);
        setChatImg(chat.image || groupAvatar);
      }
    }
  }, [chat]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (message.trim() === "" && !file) {
      return;
    }
    let messageData = {
      text: message,
      image: null,
      chatId: chat.id,
      senderId: user.id,
    };

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        messageData.image = reader.result;
        socket.send(
          JSON.stringify({
            type: "send_message",
            messageData: messageData,
          })
        );
      };
      reader.readAsDataURL(file);
    } else {
      socket.send(
        JSON.stringify({
          type: "send_message",
          messageData: messageData,
        })
      );
    }

    setMessage("");
    setFile(null);
    setFilePreview(null);
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
  useLayoutEffect(() => {
    if (
      chat &&
      user &&
      chatContentRef.current &&
      chat.messages.length > 0 &&
      chat.messages[chat.messages.length - 1].senderId === user.id
    ) {
      chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
    }
  }, [chat?.messages]);

  return (
    <>
      {chat && user && (
        <div className="chat">
          <div className="chat__header">
            <img
              src={chatImg ? chatImg : avatar}
              alt=""
              className="chat__header__img"
            />
            <div className="chat__header__name">{chatName}</div>
          </div>
          <div className="chat__content" ref={chatContentRef}>
            <ul className="chat__messages">
              {chat.messages.map((message, index) => {
                const messageSender = chat.users.find(
                  (user) => user.id === message.senderId
                );

                return (
                  <li
                    key={index}
                    className={`chat__message ${
                      messageSender.id === user.id ? "chat__message--my" : ""
                    } `}
                    id={`message-${message.id}`}
                  >
                    <div className="chat__message__name">
                      {messageSender.id === user.id ? "Вы" : messageSender.name}
                    </div>
                    <div className="chat__message__block">
                      <p className="chat__message__text">{message.text}</p>
                      {message.image ? (
                        <img
                          className="chat__message__img"
                          src={message.image}
                        />
                      ) : (
                        ""
                      )}
                      <span className="chat__message__time">
                        {dateDto(message.sentAt)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="chat__bottom">
            <form
              className="chat__form"
              onSubmit={handleSendMessage}
              encType="multipart/form-data"
            >
              <input
                type="text"
                className="chat__input"
                placeholder="Написать сообщение"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
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

              <button type="submit" className="chat__send">
                <img src={sendSvg} alt="Отправить" />
              </button>
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
            </form>
          </div>
        </div>
      )}
    </>
  );
};
