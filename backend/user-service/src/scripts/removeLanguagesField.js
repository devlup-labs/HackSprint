// One-off migration: the profile "languages" feature was removed — drop the
// leftover field from every existing user document.
//   node src/scripts/removeLanguagesField.js
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import UserModel from "../models/user.models.js";

await connectDB();

// Goes through the raw collection — the field no longer exists on the
// schema, so a normal Mongoose update would strip it as an unknown path.
const withLanguages = await UserModel.collection.countDocuments({
  languages: { $exists: true },
});
const res = await UserModel.collection.updateMany(
  { languages: { $exists: true } },
  { $unset: { languages: "" } }
);

console.log(
  JSON.stringify({ usersWithLanguagesBefore: withLanguages, modified: res.modifiedCount })
);

await mongoose.connection.close();
process.exit(0);
