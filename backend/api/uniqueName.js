export const uniqueName = () => {
  return Date.now() + "-" + Math.round(Math.random() * 1e9);
};
