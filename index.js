require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const PORT = process.env.SERVER_PORT;
const nodemailer = require("nodemailer");
const swaggerUi = require("swagger-ui-express");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ status: true, message: "welcome to the app" });
});

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Email Service API",
    version: "1.0.0",
    description:
      "API documentation for an email service that converts content to HTML and sends it as an email using Nodemailer.",
  },
  servers: [
    {
      url: `http://localhost:${PORT}`,
      description: "Local development server",
    },
  ],
  paths: {
    "/send-email": {
      post: {
        summary: "Send an email",
        description:
          "Convert the content of the request body to HTML and send it as an email.",
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  subject: { type: "string", example: "Subject of the email" },
                  content: { type: "string", example: "Content of the email" },
                  email: { type: "string", example: "recipient@example.com" },
                },
                required: ["subject", "content", "recipient"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Email sent successfully",
            content: {
              "text/plain": {
                example: "Email sent successfully",
              },
            },
          },
          500: {
            description: "Failed to send email",
            content: {
              "text/plain": {
                example: "Failed to send email",
              },
            },
          },
        },
      },
    },
  },
};

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDefinition));

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
    const htmlContent = `<html><body><p>${content}</p></body></html>`;
    const mailOptions = {
      from: process.env.G_MAIL,
      to: email,
      subject,
      html: htmlContent,
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
