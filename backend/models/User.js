import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    unique: true,
    lowercase: true,
    sparse: true, // Allow null/undefined since they might register with username first
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "org", "verifier", "admin"],
    required: true,
  },
  name: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    default: "",
  },
  // For Organization
  organizationName: {
    type: String,
  },
  website: {
    type: String,
  },
  description: {
    type: String,
  },
  // Organization approval fields
  isApproved: {
    type: Boolean,
    default: function() {
      return this.role !== "org"; // Auto-approve all roles except org
    },
  },
  approvedBy: {
    type: String, // Admin username who approved
  },
  approvedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);

export default User;
