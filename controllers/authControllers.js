import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1️⃣ Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // 2️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email already in use" });
    }

    // 3️⃣ Create new user
    const newUser = await User.create({ name, email, password });

    // 4️⃣ Generate JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 5️⃣ Set token in cookie
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 6️⃣ Prepare safe user object (exclude password)
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      avatarUrl: newUser.avatarUrl,
      bio: newUser.bio,
    };

    // 7️⃣ Send success response
    return res
      .status(201)
      .json({ msg: "Registration successful", user: userResponse });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({ msg: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    // 2️⃣ Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    // 3️⃣ Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    // 4️⃣ Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 5️⃣ Set token in cookie
    const isProduction = process.env.NODE_ENV === "production";
    res.cookie("token", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 6️⃣ Prepare safe user object (exclude password)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
    };

    // 7️⃣ Send success response
    return res.status(200).json({ msg: "Login successful", user: userResponse });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ msg: "Server error" });
  }
};

// Get current authenticated user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
    };

    return res.status(200).json({ user: userResponse });
  } catch (error) {
    console.error("Get Me Error:", error);
    return res.status(500).json({ msg: "Server error" });
  }
};

// Logout user
export const logout = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === "production";
    
    res.cookie("token", "", {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "None" : "Lax",
      maxAge: 0,
    });

    return res.status(200).json({ msg: "Logout successful" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ msg: "Server error" });
  }
};
