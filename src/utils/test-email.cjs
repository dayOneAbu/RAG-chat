// test-email.js
require('dotenv').config();

const nodemailer = require("nodemailer");
// import nodemailer from "nodemailer";
async function main() {
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  let info = await transporter.sendMail({
    from: '"Test" <yonasres@gmail.com>',
    to: "uonas@protonmail.com",
    subject: "Test Email",
    text: "Hello world?",
  });

  console.log("Message sent: %s", info.messageId);
}

main().catch(console.error);