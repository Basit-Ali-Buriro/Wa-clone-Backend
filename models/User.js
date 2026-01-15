import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "Hey there! I’m using ChatApp.",
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["online", "offline", "away"],
      default: "offline",
    },
    autoReply: {
  enabled: { type: Boolean, default: false },
  mode: { type: String, enum: ["friendly", "professional", "funny"], default: "friendly" },
},

  },
  { timestamps: true }
);

// ✅ Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ Method to compare passwords during login
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
