require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.SERVER_PORT;
const nodemailer = require("nodemailer");
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ status: true, message: "welcome to the app" });
});

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.G_MAIL,
    pass: process.env.G_MAIL_PASS,
  },
});

app.post("/send-email", (req, res) => {
  const { email, subject, content } = req.body;
  try {
    if (!email || !subject || !content) throw new Error("invalid credentials");

    const mailOptions = {
      from: process.env.G_MAIL,
      to: email,
      subject,
      text: content,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) throw new Error("Error sending email");
      console.log("Email sent: " + info.response);
      return res.status(200).json({
        status: true,
        message: "Email sent successfully",
      });
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`app listening at port ${PORT}`);
});
