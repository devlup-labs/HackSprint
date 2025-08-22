import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import handlebars from "handlebars";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import dotenv from 'dotenv'
dotenv.config()

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL, // your Gmail address
//     pass: process.env.EMAIL_PASS, // your App Password
//   },
// });

// const transporter = nodemailer.createTransport({
//   host: "smtp-relay.brevo.com",
//   port: 587,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS
//   }
// })


// export {transporter}



const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,       // Your Gmail / SMTP email
    pass: process.env.EMAIL_PASS,  // App password
  },
});

// helper to render HTML template
function renderTemplate(templateName, data) {
  const filePath = path.join(__dirname, "emails", `${templateName}.html`);
  const source = fs.readFileSync(filePath, "utf8");
  const template = handlebars.compile(source);
  return template(data);
}

// main function to send email
async function sendMail({ to, subject, templateName, data, replyTo }) {
  const html = renderTemplate(templateName, data);

  return transporter.sendMail({
    from: `"HackSprint" <${process.env.EMAIL}>`,
    to,
    subject,
    html,
    replyTo: process.env.EMAIL
  });
}

export { sendMail };
