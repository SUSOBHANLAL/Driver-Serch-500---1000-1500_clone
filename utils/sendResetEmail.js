const { text } = require("express");
const nodemailer = require("nodemailer");
const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ?? 5000;
const sendResetEmail = (to, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail", // Change this as needed
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Optional for local development
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Email Verification",
    text: `Click the link to verify your email: http://${host}:${port}/api/auth/reset-password/${token}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log("Email sent: " + info.response);
  });
};

module.exports = { sendResetEmail };
