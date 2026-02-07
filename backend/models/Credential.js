import mongoose from "mongoose";

// Verifiable Credential JSON structure (off-chain, full data)
const credentialSchema = new mongoose.Schema({
  hash: {
    type: String,
    required: true,
    unique: true,
  },
  // On-chain: issuer address, holder address (for lookup)
  issuer: { type: String, required: true, lowercase: true },
  holder: { type: String, required: true, lowercase: true },
  // VC fields
  credentialName: { type: String, required: true },
  description: { type: String, default: "" },
  documentType: { type: String, default: "" },
  fromOrganisation: { type: String, default: "" },
  // Holder DID (did:dhurva:0x...)
  holderDID: { type: String, default: "" },
  issuerDID: { type: String, default: "" },
  // Credential subject (selective disclosure fields)
  credentialSubject: {
    degreeName: String,
    course: String,
    graduationYear: String,
    skillCategory: String,
    certificationId: String,
    custom: mongoose.Schema.Types.Mixed,
  },
  fileUrl: { type: String },
  expiryDate: { type: Number, default: 0 },
  issuedAt: { type: Date, default: Date.now },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

const Credential = mongoose.model("Credential", credentialSchema);

export default Credential;
