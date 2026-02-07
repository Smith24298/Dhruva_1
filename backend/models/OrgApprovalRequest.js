import mongoose from "mongoose";

const orgApprovalRequestSchema = new mongoose.Schema({
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  walletAddress: {
    type: String,
    required: true,
    lowercase: true,
  },
  username: {
    type: String,
    required: true,
  },
  organizationName: {
    type: String,
    required: true,
  },
  website: {
    type: String,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  reviewedBy: {
    type: String, // Admin username
  },
  reviewedAt: {
    type: Date,
  },
  rejectionReason: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const OrgApprovalRequest = mongoose.model("OrgApprovalRequest", orgApprovalRequestSchema);

export default OrgApprovalRequest;
