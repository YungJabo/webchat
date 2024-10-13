import moment from "moment-timezone";

export const dateDto = (date) => {
  const newDate = moment(date).tz("Europe/Moscow");
  const formattedDate = newDate.format("HH:mm YYYY-MM-DD");
  return formattedDate;
};
