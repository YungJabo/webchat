import axios from "axios";
export const validationRegistration = (name, email, pass1, pass2) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let check = true;
  const errors = {
    name: "",
    email: "",
    pass1: "",
    pass2: "",
  };
  if (name.trim() === "") {
    check = false;
    errors.name = "Поле не должно быть пустым";
  }
  if (email.trim() === "") {
    check = false;
    errors.email = "Поле не должно быть пустым";
  }

  if (!emailRegex.test(email)) {
    check = false;
    errors.email = "Неверный формат почты";
  }
  if (pass1 !== pass2) {
    check = false;
    errors.pass2 = "Passwords do not match";
  }
  if (pass1.length < 6) {
    check = false;
    errors.pass1 = "Password must be at least 6 characters long";
  }
  return { isValid: check, errors };
};

export const registration = async (name, email, pass1, pass2) => {
  const validation = validationRegistration(name, email, pass1, pass2);
  if (!validation.isValid) {
    return { errors: validation.errors };
  }
  try {
    const response = await axios.post(
      "http://localhost:3000/api/sign_up",
      {
        name: name,
        email: email,
        pass: pass1,
      },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const login = async (email, pass) => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/login",
      {
        email: email,
        pass: pass,
      },
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return false;
  }
};
