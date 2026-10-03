import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID) {
  throw new Error(
    "GOOGLE_CLIENT_ID is missing."
  );
}

if (!GOOGLE_CLIENT_SECRET) {
  throw new Error(
    "GOOGLE_CLIENT_SECRET is missing."
  );
}

export const oauth2client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  "postmessage"
);


// export const oauth2client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   "http://localhost:5002/admin/auth/google/callback"
// );

// export const redirectToGoogle = (req, res) => {
//   const url = oauth2client.generateAuthUrl({
//     access_type: "offline",
//     scope: ["openid", "email", "profile"],
//     prompt: "consent",
//   });

//   res.redirect(url);
// };