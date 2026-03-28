import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";

export const adminAuth = async (req, res, next) => {
  try {
    // 1. Get token from the 'Authorization' header
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Authorization header is missing" });
    }

    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Token is missing" });
    }

    // 2. Verify the token using the SAME secret key from your .env file
    // This MUST match the key used in your adminLogin function
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // 3. Find the admin in the database using the ID from the token
    const admin = await Admin.findById(decoded.id);
    if (!admin) {
      throw new Error("Admin not found.");
    }

    // 4. Attach the admin's data to the request object so the next controller can use it
    req.admin = admin;

    // 5. Proceed to the intended route's controller (e.g., getAdminDetails)
    next();
  } catch (error) {
    // This block runs if jwt.verify fails
    console.error("!!! ADMIN AUTH MIDDLEWARE FAILED !!!:", error.message);
    res
      .status(401)
      .json({ error: "Authentication failed. Please log in again." });
  }
};
