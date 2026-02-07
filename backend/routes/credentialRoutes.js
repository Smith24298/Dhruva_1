import express from "express";
import Credential from "../models/Credential.js";

import upload from "../middleware/upload.js";

const router = express.Router();

// Store credential metadata (called after on-chain issue)
router.post("/", upload.single("file"), async (req, res) => {
  try {
    console.log("POST /api/credentials - Request Body:", req.body);
    console.log("POST /api/credentials - File:", req.file);

    const {
      hash,
      issuer,
      holder,
      credentialName,
      description,
      documentType,
      fromOrganisation,
      expiryDate,
      metadata,
    } = req.body;

    let parsedMetadata = {};
    if (metadata) {
      try {
        parsedMetadata = typeof metadata === "string" ? JSON.parse(metadata) : metadata;
      } catch (e) {
        console.error("Failed to parse metadata JSON:", metadata);
        return res.status(400).json({ message: "Invalid metadata JSON format", error: e.message });
      }
    }

    if (!hash || !issuer || !holder || !credentialName || !expiryDate) {
      return res.status(400).json({
        message: "Missing required fields: hash, issuer, holder, credentialName, expiryDate",
      });
    }

    const existing = await Credential.findOne({ hash });
    if (existing) {
      return res.status(409).json({ message: "Credential with this hash already exists" });
    }

    let fileUrl = "";
    if (req.file) {
      // Create a full URL to the file
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      fileUrl = `${baseUrl}/uploads/${req.file.filename}`;
    }

    const newCredential = new Credential({
      hash,
      issuer: String(issuer).toLowerCase(),
      holder: String(holder).toLowerCase(),
      credentialName,
      description: description || "",
      documentType: documentType || "",
      fromOrganisation: fromOrganisation || "",
      fileUrl: fileUrl,
      expiryDate,
      metadata: parsedMetadata,
    });

    await newCredential.save();
    res.status(201).json({
      success: true,
      credential: newCredential,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get credentials by holder address (recipient)
router.get("/holder/:address", async (req, res) => {
  try {
    const address = req.params.address.toLowerCase();
    const credentials = await Credential.find({ holder: address }).sort({ issuedAt: -1 });
    res.json(credentials);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get credentials by issuer address
router.get("/issuer/:address", async (req, res) => {
  try {
    const address = req.params.address.toLowerCase();
    const credentials = await Credential.find({ issuer: address }).sort({ issuedAt: -1 });
    res.json(credentials);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get credential by hash (for verification)
router.get("/hash/:hash", async (req, res) => {
  try {
    const credential = await Credential.findOne({ hash: req.params.hash });
    if (!credential) {
      return res.status(404).json({ message: "Credential not found" });
    }
    res.json(credential);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Verification API: returns credential metadata (blockchain check done by frontend)
router.get("/verify/:hash", async (req, res) => {
  try {
    const credential = await Credential.findOne({ hash: req.params.hash });
    if (!credential) {
      return res.status(404).json({ valid: false, message: "Credential not found" });
    }
    res.json({
      valid: true,
      credential,
      verificationUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/verify?hash=${req.params.hash}`,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Batch verification: pass array of hashes
router.post("/batch-verify", async (req, res) => {
  try {
    const { hashes } = req.body;
    if (!Array.isArray(hashes) || hashes.length === 0) {
      return res.status(400).json({ message: "hashes must be a non-empty array" });
    }
    const results = await Credential.find({ hash: { $in: hashes } });
    const resultMap = {};
    results.forEach((c) => { resultMap[c.hash] = c; });
    const output = hashes.map((h) => ({
      hash: h,
      found: !!resultMap[h],
      credential: resultMap[h] || null,
    }));
    res.json({ results: output });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
