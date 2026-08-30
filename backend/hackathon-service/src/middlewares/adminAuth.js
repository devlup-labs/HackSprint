import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import Admin from "../models/admin.model.js";

export const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authentication required");
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    const admin = await Admin.findById(decoded.id);

    if (!admin) {
      throw new UnauthorizedError("Admin not found");
    }

    if (!admin.isActive) {
      throw new UnauthorizedError("Account disabled");
    }

    req.admin = admin;

    next();
  } catch (error) {
    next(error);
  }
};
