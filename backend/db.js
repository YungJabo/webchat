import { Sequelize } from "sequelize";
import { config } from "dotenv";

config();

export const db = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    dialectOptions: {
      timezone: "+03:00", 
    },
    timezone: "+03:00",
  }
);

// Функция для проверки подключения
export const connectDB = async () => {
  try {
    await db.authenticate();
    console.log("Соединение с MySQL успешно установлено");
    await db.sync();
    console.log("Все таблицы синхронизированы");
  } catch (error) {
    console.error("Ошибка соединения с MySQL:", error);
  }
};
