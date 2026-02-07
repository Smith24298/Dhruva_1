import { useState, type FormEvent, type ChangeEvent, useEffect } from "react";
import { Upload, CheckCircle, AlertCircle, FileUp, Building2, Clock } from "lucide-react";
import { useWeb3 } from "../../context/Web3Context";
import { useAuth } from "../../context/AuthContext";
import { backend } from "../../api/backend";
import { ethers } from "ethers";

export const OrgIssue = () => {
  const { user } = useAuth();
  const { account, issueCredential, isActive } = useWeb3();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [destinationAddress, setDestinationAddress] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [credentialName, setCredentialName] = useState("");
  const [description, setDescription] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isApproved, setIsApproved] = useState<boolean | null>(null);

  const organisationUsername = user?.name ?? "Organisation";

  useEffect(() => {
    // Check if organization is approved
    const checkApproval = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/users/profile/${user?.username}`);
        if (response.ok) {
          const userData = await response.json();
          setIsApproved(userData.isApproved || false);
        }
      } catch (err) {
        console.error("Failed to check approval status", err);
        setIsApproved(false);
      }
    };
    if (user?.username) {
      checkApproval();
    }
  }, [user]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isActive) {
      setError("Please connect your wallet first");
      return;
    }

    if (isApproved === false) {
      setError("Your organization is pending admin approval. You cannot issue credentials yet.");
      return;
    }

    if (!file) {
      setError("Please upload a document (PDF or image)");
      return;
    }

    const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || "";
    const destNorm = destinationAddress.trim();
    if (contractAddress && destNorm.toLowerCase() === contractAddress.toLowerCase()) {
      setError("Destination address cannot be the contract address. Enter the recipient's wallet address.");
      return;
    }
    const holderAddress = ethers.getAddress(destNorm);

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Use 0 for no expiry, or validate if provided
      let expiryTimestamp = 0;
      if (expiryDate) {
        expiryTimestamp = Math.floor(new Date(expiryDate).getTime() / 1000);
        if (expiryTimestamp <= Math.floor(Date.now() / 1000)) {
          setError("Expiry date must be in the future");
          setLoading(false);
          return;
        }
      }

      const buf = await file.arrayBuffer();
      const fileHashHex = ethers.keccak256(new Uint8Array(buf));

      const credentialData = JSON.stringify({
        documentType,
        credentialName,
        description,
        destinationAddress: holderAddress,
        recipientName,
        issuer: account,
        fromOrganisation: organisationUsername,
        fileHash: fileHashHex,
        issuedAt: Date.now(),
      });

      const credentialHash = ethers.keccak256(ethers.toUtf8Bytes(credentialData));

      // Issue credential on blockchain
      await issueCredential(
        holderAddress,
        credentialHash,
        expiryTimestamp,
        credentialName,
        description
      );

      const formData = new FormData();
      formData.append("hash", credentialHash);
      formData.append("issuer", account!);
      formData.append("holder", holderAddress);
      formData.append("credentialName", credentialName);
      formData.append("description", description);
      formData.append("documentType", documentType);
      formData.append("fromOrganisation", organisationUsername);
      // Only send expiryDate if it was set (not 0)
      formData.append("expiryDate", expiryTimestamp === 0 ? "0" : String(expiryTimestamp * 1000));
      formData.append("file", file);
      formData.append("metadata", JSON.stringify({ recipientName }));

      await backend.saveCredential(formData);

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setDestinationAddress("");
        setDocumentType("");
        setRecipientName("");
        setCredentialName("");
        setDescription("");
        setExpiryDate("");
        setFile(null);
      }, 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to issue credential");
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#5227FF] focus:ring-1 focus:ring-[#5227FF]";
  const labelClass = "block text-sm font-medium text-gray-400 mb-1.5";

  // Show pending approval message
  if (isApproved === false) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-white mb-6">Issue new credential</h1>
        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-8 text-center">
          <Clock className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-xl font-bold text-yellow-400 mb-2">Pending Admin Approval</h2>
          <p className="text-gray-300 mb-4">
            Your organization registration is awaiting approval from a system administrator.
            You will be able to issue credentials once your organization is approved.
          </p>
          <p className="text-sm text-gray-400">
            This typically takes 24-48 hours. You will be notified once approved.
          </p>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isApproved === null) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-white mb-6">Issue new credential</h1>
        <div className="text-center py-12 text-gray-400">Checking approval status...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Issue new credential</h1>

      {/* Approved Banner */}
      <div className="mb-6 flex items-start gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-200">
        <img src="/DHRUVALOGO.jpeg" alt="Dhruva Logo" className="w-5 h-5 shrink-0 mt-0.5 object-contain" />
        <div>
          <p className="font-semibold text-emerald-200">✓ Organization Approved</p>
          <p className="text-sm text-emerald-200/90 mt-1">
            Your organization is approved. Credentials will be issued on blockchain.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0f0a18]/70 p-8">
        <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Building2 className="w-4 h-4 text-[#3DC2EC]" />
            <span><strong className="text-white">From organisation:</strong> {organisationUsername}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className={labelClass}>Destination address</label>
            <p className="text-xs text-gray-500 mb-2">Receiver&apos;s wallet address. The issued document will be visible at this address.</p>
            <input type="text" required value={destinationAddress} onChange={(e) => setDestinationAddress(e.target.value)} className={`${inputClass} font-mono`} placeholder="0x..." />
          </div>
          <div>
            <label className={labelClass}>Type of document</label>
            <input type="text" required value={documentType} onChange={(e) => setDocumentType(e.target.value)} className={inputClass} placeholder="e.g. Degree Certificate, License" />
          </div>
          <div>
            <label className={labelClass}>Recipient name</label>
            <input type="text" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} className={inputClass} placeholder="Full name (optional)" />
          </div>
          <div>
            <label className={labelClass}>Credential name</label>
            <input type="text" required value={credentialName} onChange={(e) => setCredentialName(e.target.value)} className={inputClass} placeholder="e.g. Master's Degree in Computer Science" />
          </div>
          <div>
            <label className={labelClass}>Description / experience</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} h-32 resize-none`} placeholder="Describe the qualification or experience..." />
          </div>
          <div>
            <label className={labelClass}>Expiry date (optional)</label>
            <p className="text-xs text-gray-500 mb-2">Leave empty for no expiration. If set, must be in the future.</p>
            <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} className={inputClass} min={new Date().toISOString().split("T")[0]} />
          </div>
          <div>
            <label className={labelClass}>Upload document (PDF / image) *</label>
            <p className="text-xs text-gray-500 mb-2">Required. Document will be stored and visible to the recipient.</p>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-[#5227FF] bg-white/5 transition-colors">
              <input type="file" accept=".pdf,image/*" className="hidden" onChange={handleFileChange} />
              {file ? (
                <span className="flex items-center gap-2 text-sm text-white"><FileUp className="w-5 h-5" />{file.name}</span>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-500 mb-2" />
                  <span className="text-sm text-gray-400">Click to upload or drag and drop</span>
                </>
              )}
            </label>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}
          <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-[#5227FF] text-white font-semibold hover:bg-[#3DC2EC] hover:text-[#0f0a18] disabled:opacity-50 transition-all border border-[#5227FF]/50">
            {loading ? "Confirm in MetaMask…" : "Issue credential"}
          </button>
        </form>
        {success && (
          <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 shrink-0" />
            Credential issued on blockchain. Document will be visible at the destination address.
          </div>
        )}
      </div>
    </div>
  );
};
