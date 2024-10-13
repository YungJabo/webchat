import { useEffect, useRef, useState } from "react";
import "./Login.scss";
import {
  registration,
  validationRegistration,
  login,
} from "../../../api/authorization.js";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const navigate = useNavigate();
  const handleRegistration = async (e) => {
    e.preventDefault();
    const name = nameRef.current.value;
    const email = emailRef.current.value;
    const pass1 = pass1Ref.current.value;
    const pass2 = pass2Ref.current.value;
    const response = await registration(name, email, pass1, pass2);
    if (response.errors) {
      setErrors(response.errors);
    }
    if (response) {
      alert("Проверьте почту");
      setType("login");
    }
  };
  const handleLogin = async (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    const pass1 = pass1Ref.current.value;

    const response = await login(email, pass1);
    if (response) {
      navigate("/");
    }
  };

  const [type, setType] = useState("login");
  const [errors, setErrors] = useState({
    name: null,
    email: null,
    pass1: null,
    pass2: null,
  });
  const emailRef = useRef();
  const nameRef = useRef();
  const pass1Ref = useRef();
  const pass2Ref = useRef();
  const blurInput = (ref) => {
    const isText = ref.current.value || null;
    const label = ref.current.nextSibling;
    if (isText) {
      label.classList.add("active");
    } else {
      label.classList.remove("active");
    }
  };
  const validationReg = () => {
    const name = nameRef.current.value;
    const email = emailRef.current.value;
    const pass1 = pass1Ref.current.value;
    const pass2 = pass2Ref.current.value;
    const validation = validationRegistration(name, email, pass1, pass2);
    setErrors(validation.errors);
  };

  useEffect(() => {
    setErrors({
      name: null,
      email: null,
      pass1: null,
      pass2: null,
    });
  }, [type]);
  return (
    <>
      {type === "login" && (
        <form action="" className="login__form">
          <h2 className="login__title">Авторизация</h2>

          <div className="login__input-block">
            <input
              type="email"
              name="email"
              id="email"
              ref={emailRef}
              onBlur={() => blurInput(emailRef)}
              onChange={() => validationReg()}
              className={errors.email ? "error" : ""}
            />
            <label htmlFor="email">Почта</label>
            <span className={`login__error ${errors.email ? "active" : ""}`}>
              {errors.email}
            </span>
          </div>
          <div className="login__input-block">
            <input
              type="password"
              name="pass"
              id="pass"
              ref={pass1Ref}
              onBlur={() => blurInput(pass1Ref)}
              onChange={() => validationReg()}
              className={errors.pass1 ? "error" : ""}
            />
            <label htmlFor="pass">Пароль</label>
            <span className={`login__error ${errors.pass1 ? "active" : ""}`}>
              {errors.pass1}
            </span>
          </div>
          <button className="login__confirm" onClick={(e) => handleLogin(e)}>
            Войти
          </button>
          <div className="login__buttons">
            <button className="login__change" onClick={() => setType("forgot")}>
              Забыли пароль
            </button>
            <button
              className="login__change"
              onClick={() => setType("registration")}
            >
              Создать аккаунт
            </button>
          </div>
        </form>
      )}
      {type === "registration" && (
        <form action="" className="login__form">
          <h2 className="login__title">Регистрация</h2>
          <div className="login__input-block">
            <input
              type="text"
              name="name"
              id="name"
              ref={nameRef}
              onBlur={() => blurInput(nameRef)}
              onChange={() => validationReg()}
              className={errors.name ? "error" : ""}
            />
            <label htmlFor="name">Имя</label>
            <span className={`login__error ${errors.name ? "active" : ""}`}>
              {errors.name}
            </span>
          </div>
          <div className="login__input-block">
            <input
              type="email"
              name="email"
              id="email"
              ref={emailRef}
              onBlur={() => blurInput(emailRef)}
              onChange={() => validationReg()}
              className={errors.email ? "error" : ""}
            />
            <label htmlFor="email">Почта</label>
            <span className={`login__error ${errors.email ? "active" : ""}`}>
              {errors.email}
            </span>
          </div>
          <div className="login__input-block">
            <input
              type="password"
              name="pass1"
              id="pass1"
              ref={pass1Ref}
              onBlur={() => blurInput(pass1Ref)}
              onChange={() => validationReg()}
              className={errors.pass1 ? "error" : ""}
            />
            <label htmlFor="pass1">Пароль</label>
            <span className={`login__error ${errors.pass1 ? "active" : ""}`}>
              {errors.pass1}
            </span>
          </div>
          <div className="login__input-block">
            <input
              type="password"
              name="pass2"
              id="pass2"
              ref={pass2Ref}
              onBlur={() => blurInput(pass2Ref)}
              onChange={() => validationReg()}
              className={errors.pass2 ? "error" : ""}
            />
            <label htmlFor="pass2">Повторите пароль</label>
            <span className={`login__error ${errors.pass2 ? "active" : ""}`}>
              {errors.pass2}
            </span>
          </div>
          <button
            className="login__confirm"
            onClick={(e) => handleRegistration(e)}
          >
            Создать аккаунт
          </button>
          <div className="login__buttons">
            <button className="login__change" onClick={() => setType("login")}>
              Войти
            </button>
            <button className="login__change" onClick={() => setType("forgot")}>
              Забыли пароль
            </button>
          </div>
        </form>
      )}
      {type === "forgot" && (
        <form action="" className="login__form">
          <h2 className="login__title">Сменить пароль</h2>

          <div className="login__input-block">
            <input type="email" name="email" id="email" />
            <label htmlFor="email">Почта</label>
          </div>

          <button className="login__confirm">Сменить пароль</button>
          <div className="login__buttons">
            <button className="login__change" onClick={() => setType("login")}>
              Войти
            </button>
            <button
              className="login__change"
              onClick={() => setType("registration")}
            >
              Создать аккаунт
            </button>
          </div>
        </form>
      )}
    </>
  );
};
