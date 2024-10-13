import { useEffect } from "react";
import "./Notify.scss";

export const Notify = ({ notify, setNotify }) => {
  useEffect(() => {
    if (notify) {
      setTimeout(() => {
        setNotify(null);
      }, 8000);
    }
  }, [notify]);
  return (
    <>
      {notify && (
        <div className={`notify`}>
          <h3 className="notify__title">Уведомление</h3>
          <div className="notify__content">
            <h4 className="notify__name">{notify.title}</h4>
            <p className="notify__text">{notify.text}</p>
          </div>
          <button className="notify__close">
            <img src="" alt="" className="notify__close__img" />
          </button>
        </div>
      )}
    </>
  );
};
