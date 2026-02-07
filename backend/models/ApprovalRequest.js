import mongoose from "mongoose";

// Approval Request Schema - Users send documents to organizations for approval
const approvalRequestSchema = new mongoose.Schema({
  // User who is requesting approval
  requester: {
    type: String,
    required: true,
    lowercase: true,
  },
  // Organization address that will approve/reject
  organization: {
    type: String,
    required: true,
    lowercase: true,
  },
  // Document details
  documentHash: {
    type: String,
    required: true,
  },
  documentName: {
    type: String,
    required: true,
  },
  documentType: {
    type: String,
    default: "",
  },
  description: {
    type: String,
    default: "",
  },
  // File upload
  fileUrl: {
    type: String,
    default: "",
  },
  // Status: pending, approved, rejected
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  // Organization's response message
  responseMessage: {
    type: String,
    default: "",
  },
  // If approved, the issued credential hash
  issuedCredentialHash: {
    type: String,
    default: "",
  },
  // Timestamps
  requestedAt: {
    type: Date,
    default: Date.now,
  },
  respondedAt: {
    type: Date,
  },
  // Expiry date requested by user
  expiryDate: {
    type: Number,
  },
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

const ApprovalRequest = mongoose.model("ApprovalRequest", approvalRequestSchema);

export default ApprovalRequest;
