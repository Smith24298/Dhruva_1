import express from "express";
import OrgApprovalRequest from "../models/OrgApprovalRequest.js";
import User from "../models/User.js";

const router = express.Router();

// Get all organization approval requests
router.get("/org-requests", async (req, res) => {
  try {
    const requests = await OrgApprovalRequest.find()
      .sort({ createdAt: -1 })
      .populate("organizationId", "username walletAddress");
    
    // Filter out requests with invalid data (null wallet, non-existent orgs)
    const validRequests = requests.filter(req => {
      // Remove requests where organization doesn't exist
      if (!req.organizationId) return false;
      
      // Remove requests where wallet address is null/empty
      if (!req.walletAddress || req.walletAddress.trim() === "") return false;
      
      return true;
    });
    
    // Clean up invalid requests from database (async, don't wait)
    requests.forEach(async (req) => {
      if (!req.organizationId || !req.walletAddress || req.walletAddress.trim() === "") {
        try {
          await OrgApprovalRequest.findByIdAndDelete(req._id);
        } catch (err) {
          console.error("Error cleaning up invalid request:", err);
        }
      }
    });
    
    res.json(validRequests);
  } catch (error) {
    console.error("Error fetching org requests:", error);
    res.status(500).json({ error: "Failed to fetch organization requests" });
  }
});

// Approve an organization
router.post("/org-requests/:id/approve", async (req, res) => {
  try {
    const { id } = req.params;
    const { adminUsername } = req.body;

    if (!adminUsername) {
      return res.status(400).json({ error: "Admin username is required" });
    }

    const request = await OrgApprovalRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ error: "Request has already been reviewed" });
    }

    // Update the approval request
    request.status = "approved";
    request.reviewedBy = adminUsername;
    request.reviewedAt = new Date();
    await request.save();

    // Validate that wallet address exists
    if (!request.walletAddress || request.walletAddress.trim() === "") {
      return res.status(400).json({ error: "Organization wallet address is missing. Organization must connect their wallet first." });
    }

    // Update the organization user
    const org = await User.findById(request.organizationId);
    if (!org) {
      return res.status(404).json({ error: "Organization user not found" });
    }
    
    // Ensure wallet address matches
    if (org.walletAddress && org.walletAddress.toLowerCase() !== request.walletAddress.toLowerCase()) {
      return res.status(400).json({ error: "Wallet address mismatch between request and user account" });
    }
    
    // Update wallet address if not set
    if (!org.walletAddress) {
      org.walletAddress = request.walletAddress.toLowerCase();
    }
    
    org.isApproved = true;
    org.approvedBy = adminUsername;
    org.approvedAt = new Date();
    await org.save();

    res.json({ message: "Organization approved successfully", request });
  } catch (error) {
    console.error("Error approving organization:", error);
    res.status(500).json({ error: "Failed to approve organization" });
  }
});

// Reject an organization
router.post("/org-requests/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;
    const { adminUsername, reason } = req.body;

    if (!adminUsername) {
      return res.status(400).json({ error: "Admin username is required" });
    }

    const request = await OrgApprovalRequest.findById(id);
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ error: "Request has already been reviewed" });
    }

    // Update the approval request
    request.status = "rejected";
    request.reviewedBy = adminUsername;
    request.reviewedAt = new Date();
    request.rejectionReason = reason || "No reason provided";
    await request.save();

    res.json({ message: "Organization rejected successfully", request });
  } catch (error) {
    console.error("Error rejecting organization:", error);
    res.status(500).json({ error: "Failed to reject organization" });
  }
});

export default router;
