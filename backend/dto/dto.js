export const userDto = (user) => {
  return {
    name: user.name,
    avatar: user.avatar || null,
    id: user.id,
    email: user.email,
  };
};

export const notifyDto = (notify) => {
  return {
    id: notify.id,
    title: notify.title,
    text: notify.text,
  };
};

export const chatDto = (chat) => {
  return {
    id: chat.id,
    chatName: chat.chatName,
    isGroup: chat.isGroup,
    image: chat.image,
    users: chat.Users.map((user) => ({
      id: user.id,
      name: user.name,
      avatar: user.avatar || null,
    })),
    messages:
      chat.Messages.length > 0
        ? chat.Messages.map((message) => {
            return {
              id: message.id,
              text: message.text,
              sentAt: message.sentAt,
              image: message.image,
              senderId: message.senderId,
              chatId: message.chatId,
            };
          }).sort((a, b) => new Date(a.sentAt) - new Date(b.sentAt))
        : [],
  };
};
