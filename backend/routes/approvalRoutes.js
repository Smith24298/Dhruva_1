import express from "express";
import ApprovalRequest from "../models/ApprovalRequest.js";
import Credential from "../models/Credential.js";
import upload from "../middleware/upload.js";

const router = express.Router();

// User: Create a new approval request (send document to organization)
router.post("/", upload.single("file"), async (req, res) => {
  try {
    console.log("POST /api/approval-requests - Request Body:", req.body);
    console.log("POST /api/approval-requests - File:", req.file);

    const {
      requester,
      organization,
      documentHash,
      documentName,
      documentType,
      description,
      expiryDate,
      metadata,
    } = req.body;

    if (!requester || !organization || !documentHash || !documentName) {
      return res.status(400).json({
        message: "Missing required fields: requester, organization, documentHash, documentName",
      });
    }

    // Check if request already exists for this document
    const existing = await ApprovalRequest.findOne({ 
      documentHash, 
      requester: String(requester).toLowerCase(),
      organization: String(organization).toLowerCase(),
      status: "pending"
    });
    
    if (existing) {
      return res.status(409).json({ message: "Approval request already pending for this document" });
    }

    let fileUrl = "";
    if (req.file) {
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }

    let parsedMetadata = {};
    if (metadata) {
      try {
        parsedMetadata = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
      } catch (e) {
        console.error("Failed to parse metadata JSON:", metadata);
      }
    }

    const newRequest = new ApprovalRequest({
      requester: String(requester).toLowerCase(),
      organization: String(organization).toLowerCase(),
      documentHash,
      documentName,
      documentType: documentType || "",
      description: description || "",
      fileUrl,
      expiryDate: expiryDate ? Number(expiryDate) : undefined,
      metadata: parsedMetadata,
      status: "pending",
    });

    await newRequest.save();
    res.status(201).json({
      success: true,
      request: newRequest,
    });
  } catch (error) {
    console.error("Error creating approval request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Organization: Get all approval requests for their address
router.get("/organization/:address", async (req, res) => {
  try {
    const address = req.params.address.toLowerCase();
    const status = req.query.status; // optional filter: pending, approved, rejected
    
    const query = { organization: address };
    if (status) {
      query.status = status;
    }
    
    const requests = await ApprovalRequest.find(query).sort({ requestedAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error("Error fetching approval requests:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// User: Get all approval requests by user address
router.get("/requester/:address", async (req, res) => {
  try {
    const address = req.params.address.toLowerCase();
    const requests = await ApprovalRequest.find({ requester: address }).sort({ requestedAt: -1 });
    res.json(requests);
  } catch (error) {
    console.error("Error fetching user requests:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Organization: Approve or reject a request
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, responseMessage, issuedCredentialHash } = req.body;

    if (!status || !["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status. Must be 'approved' or 'rejected'" });
    }

    const request = await ApprovalRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Approval request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Request already processed" });
    }

    request.status = status;
    request.responseMessage = responseMessage || "";
    request.respondedAt = new Date();
    
    if (status === "approved" && issuedCredentialHash) {
      request.issuedCredentialHash = issuedCredentialHash;
      
      // Update the credential as verified
      await Credential.findOneAndUpdate(
        { hash: issuedCredentialHash },
        { 
          $set: { 
            "metadata.verified": true,
            "metadata.verifiedBy": request.organization,
            "metadata.verifiedAt": Date.now()
          }
        }
      );
    }

    await request.save();
    res.json({
      success: true,
      request,
    });
  } catch (error) {
    console.error("Error updating approval request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get single approval request by ID
router.get("/:id", async (req, res) => {
  try {
    const request = await ApprovalRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: "Approval request not found" });
    }
    res.json(request);
  } catch (error) {
    console.error("Error fetching approval request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete/cancel a request (only if pending and by requester)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { requester } = req.query;

    const request = await ApprovalRequest.findById(id);
    if (!request) {
      return res.status(404).json({ message: "Approval request not found" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "Cannot cancel processed request" });
    }

    if (requester && request.requester !== String(requester).toLowerCase()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await ApprovalRequest.findByIdAndDelete(id);
    res.json({ success: true, message: "Request cancelled" });
  } catch (error) {
    console.error("Error deleting approval request:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
