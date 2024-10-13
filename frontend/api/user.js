import axios from "axios";

export const getUser = async () => {
  try {
    const response = await axios.get("http://localhost:3000/api/getUser", {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return;
  }
};

export const changeAvatar = async (userId, avatarFile) => {
  try {
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    const response = await axios.patch(
      `http://localhost:3000/api/changeAvatar/${userId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      }
    );

    return response.data;
  } catch (error) {
    console.log("Error while changing avatar:", error);
    return false;
  }
};
