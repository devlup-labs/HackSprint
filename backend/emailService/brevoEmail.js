import axios from "axios";
import path from "path";
import fs from "fs";
import handlebars from "handlebars";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function renderTemplate(templateName, data) {
  const filePath = path.join(__dirname, "emails", `${templateName}.html`);
  const source = fs.readFileSync(filePath, "utf8");
  const template = handlebars.compile(source);
  return template(data);
}

async function sendMail({ to, subject, templateName, data, replyTo }) {
  try {
    const html = renderTemplate(templateName, data);

    const payload = {
      sender: {
        name: "HackSprint",
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      replyTo: {
        email: replyTo || process.env.BREVO_SENDER_EMAIL,
      },
    };

    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      payload,
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Email sent via Brevo:", response.data);
    return response.data;
  } catch (error) {
    console.error("Brevo email error:", error.response?.data || error.message);
    throw error;
  }
}

export { sendMail };
