import "./ProfileContent.scss";
import avatar from "../../assets/images/avatar.png";
import { useEffect, useState } from "react";

import editSvg from "../../assets/images/edit.svg";
import { changeAvatar } from "../../../api/user";
import { useNavigate } from "react-router-dom";

export const ProfileContent = ({ user, getUser }) => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);

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
  const handleChangeAvatar = async () => {
    if (file) {
      const data = await changeAvatar(user.id, file);
      if (data) {
        navigate(0);
      } else {
        console.log("Failed to change avatar.");
      }
    }
    return;
  };

  return (
    <>
      {user && (
        <div className="profile">
          <div className="profile__content">
            <div className="profile__avatar">
              <img
                src={filePreview || user.avatar || avatar}
                alt=""
                className="profile__avatar__img"
              />
              <input
                type="file"
                id="fileInput"
                className="profile__file"
                style={{ display: "none" }}
                onChange={handleFileChange}
                accept=".jpg, .jpeg, .png"
              />
              {!filePreview && (
                <label htmlFor="fileInput" className="profile__file-label">
                  <img src={editSvg} alt="Прикрепить файл" />
                </label>
              )}

              {filePreview ? (
                <div className="profile__buttons">
                  <button
                    className="profile__button"
                    onClick={() => handleChangeAvatar()}
                  >
                    Сохранить
                  </button>
                  <button
                    className="profile__button"
                    onClick={(e) => handleDeleteFile(e)}
                  >
                    Отменить
                  </button>
                </div>
              ) : (
                ""
              )}
            </div>

            <div className="profile__info">
              <div className="profile__info__block">
                <div className="profile__info__title">Имя:</div>
                <div className="profile__info__value">{user.name}</div>
              </div>
              <div className="profile__info__block">
                <div className="profile__info__title">Почта:</div>
                <div className="profile__info__value">{user.email}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
