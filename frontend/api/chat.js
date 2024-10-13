import axios from "axios";

export const openChatWithFriend = async (friendId) => {
  try {
    const response = await axios.get(
      "http://localhost:3000/api/getChatWithFriend",
      {
        params: { friendId: friendId },
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.log(error);
    return;
  }
};

export const getAllChats = async (text) => {
  try {
    const response = await axios.get("http://localhost:3000/api/getAllChats", {
      params: { text: text },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return;
  }
};
export const getChatById = async (chatId) => {
  try {
    const response = await axios.get("http://localhost:3000/api/getChatById", {
      params: { chatId: chatId },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return;
  }
};
