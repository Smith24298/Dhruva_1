import { useState, type FormEvent, type ChangeEvent, type DragEvent } from "react";
import { Upload, File, X, CheckCircle, AlertCircle, Send } from "lucide-react";
import { useWeb3 } from "../../context/Web3Context";
import { backend } from "../../api/backend";
import { ethers } from "ethers";
import { BackButton } from "../../components/BackButton";

export const UserRequestApproval = () => {
  const { isActive, account } = useWeb3();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [documentType, setDocumentType] = useState("");
  const [description, setDescription] = useState("");
  const [organizationAddress, setOrganizationAddress] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length) {
      setFile(e.dataTransfer.files[0]);
      if (!documentName) {
        setDocumentName(e.dataTransfer.files[0].name);
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!documentName) {
        setDocumentName(selectedFile.name);
      }
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isActive) {
      setError("Please connect your wallet first");
      return;
    }
    if (!file) {
      setError("Please select a file");
      return;
    }
    if (!organizationAddress || !ethers.isAddress(organizationAddress)) {
      setError("Please enter a valid organization wallet address");
      return;
    }
    if (!expiryDate) {
      setError("Please select an expiry date");
      return;
    }

    const expiryTimestamp = Math.floor(new Date(expiryDate).getTime() / 1000);
    if (expiryTimestamp <= Math.floor(Date.now() / 1000)) {
      setError("Expiry date must be in the future");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      // Hash the document
      const buf = await file.arrayBuffer();
      const documentHash = ethers.keccak256(new Uint8Array(buf));

      // Save approval request to backend (no blockchain call needed at submission)
      // The credential will be issued on blockchain when organization approves
      const formData = new FormData();
      formData.append("requester", account!);
      formData.append("organization", organizationAddress);
      formData.append("documentHash", documentHash);
      formData.append("documentName", documentName);
      formData.append("documentType", documentType);
      formData.append("description", description);
      formData.append("expiryDate", String(expiryTimestamp * 1000));
      formData.append("file", file);
      formData.append("metadata", JSON.stringify({ requestedAt: Date.now() }));

      await backend.createApprovalRequest(formData);

      setSuccess(true);
      // Reset form
      setFile(null);
      setDocumentName("");
      setDocumentType("");
      setDescription("");
      setOrganizationAddress("");
      setExpiryDate("");
      
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: unknown) {
      console.error("Approval request error:", err);
      setError(err instanceof Error ? err.message : "Failed to submit approval request");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#5227FF] focus:ring-1 focus:ring-[#5227FF]";
  const labelClass = "block text-sm font-medium text-gray-400 mb-1.5";

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <BackButton to="/dashboard" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Request Document Approval</h1>
      <p className="text-sm text-gray-500 mb-6">
        Send your document to an organization for verification and approval
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className={labelClass}>Organization Wallet Address *</label>
          <input
            type="text"
            required
            value={organizationAddress}
            onChange={(e) => setOrganizationAddress(e.target.value)}
            className={inputClass}
            placeholder="0x..."
          />
          <p className="text-xs text-gray-500 mt-1">Enter the wallet address of the organization you want to approve this document</p>
        </div>

        <div>
          <label className={labelClass}>Document Name *</label>
          <input
            type="text"
            required
            value={documentName}
            onChange={(e) => setDocumentName(e.target.value)}
            className={inputClass}
            placeholder="e.g., Degree Certificate, Work Experience Letter"
          />
        </div>

        <div>
          <label className={labelClass}>Document Type</label>
          <input
            type="text"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className={inputClass}
            placeholder="e.g., Certificate, Letter, ID"
          />
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <textarea
            value={description}
            onChange={(e: any) => setDescription(e.target.value)}
            className={inputClass}
            placeholder="Add any additional information about this document"
            rows={3}
          />
        </div>

        <div>
          <label className={labelClass}>Expiry Date *</label>
          <input
            type="date"
            required
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className={inputClass}
          />
        </div>

        <div
          className={`rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
            dragActive ? "border-[#5227FF] bg-[#5227FF]/10" : "border-white/20 bg-white/5"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-[#3DC2EC] mx-auto mb-4" />
          <p className="text-gray-300 font-medium mb-2">Drag & drop your file here or click to browse</p>
          <input
            type="file"
            className="hidden"
            id="file-upload"
            onChange={handleChange}
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <label
            htmlFor="file-upload"
            className="inline-block px-6 py-2.5 rounded-xl bg-[#5227FF] text-white font-medium cursor-pointer hover:bg-[#3DC2EC] hover:text-[#0f0a18] transition-all border border-[#5227FF]/50"
          >
            Select file
          </label>
          <p className="text-xs text-gray-500 mt-4">PDF, JPG, PNG (max 10MB)</p>
        </div>

        {file && (
          <div className="rounded-2xl border border-white/10 bg-[#0f0a18]/70 p-6">
            <h3 className="font-semibold text-white mb-4">Selected file</h3>
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-3">
                <File className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-white">{file.name}</p>
                  <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">
              Approval request submitted successfully! The organization will review your document.
            </span>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !file}
          className="w-full py-3.5 rounded-xl bg-[#5227FF] text-white font-semibold hover:bg-[#3DC2EC] hover:text-[#0f0a18] disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-[#5227FF]/50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            "Submitting..."
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send for Approval
            </>
          )}
        </button>
      </form>
    </div>
  );
};
