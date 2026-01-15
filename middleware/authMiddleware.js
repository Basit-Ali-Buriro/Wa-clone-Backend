import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    // 1️⃣ Get token from cookies
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    // 2️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3️⃣ Attach user to request
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    req.user = user;

    // 4️⃣ Proceed to next middleware or controller
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(403).json({ msg: "Token is not valid" });
  }
};

// Export both as default and named exports for flexibility
export const protect = authMiddleware;
export default authMiddleware;
