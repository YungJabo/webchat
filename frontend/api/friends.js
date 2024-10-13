import axios from "axios";

export const findFriends = async (text) => {
  try {
    const response = await axios.get("http://localhost:3000/api/findFriends", {
      params: { text: text },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return;
  }
};

export const getFriends = async (text) => {
  try {
    const response = await axios.get("http://localhost:3000/api/getFriends", {
      params: { text: text },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return;
  }
};
