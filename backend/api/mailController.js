import nodemailer from "nodemailer";
import { config } from "dotenv";
config();

class MailController {
  async sendActivationMail(to, link) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: "kirsmaxi@gmail.com",
          pass: "uuus stks hrxg lzdo",
        },
      });

      const mailOptions = {
        from: process.env.SMTP_USER,
        to,
        subject: "Account activation",
        text: `To activate your account, follow the link: ${link}`,
      };

      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.log(error);
    }
  }
  async sendChangePassMail(to, link) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: "kirsmaxi@gmail.com",
          pass: "uuus stks hrxg lzdo",
        },
      });

      const mailOptions = {
        from: process.env.SMTP_USER,
        to,
        subject: "Account activation",
        text: `To change your password, follow the link: ${link}`,
      };

      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.log(error);
    }
  }
}

export const mailController = new MailController();
