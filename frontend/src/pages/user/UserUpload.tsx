import { useState, type FormEvent, type ChangeEvent, type DragEvent } from "react";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";
import { useWeb3 } from "../../context/Web3Context";
import { backend } from "../../api/backend";
import { ethers } from "ethers";
import { BackButton } from "../../components/BackButton";

export const UserUpload = () => {
  const { registerDocument, isActive, account } = useWeb3();
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [timeFrom, setTimeFrom] = useState("");
  const [timeTo, setTimeTo] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [uploading, setUploading] = useState(false);
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
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles?.length) {
      setFiles((prev) => [...prev, ...Array.from(selectedFiles)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!isActive) {
      setError("Please connect your wallet first");
      return;
    }
    if (!timeFrom || !timeTo) {
      setError("Please set duration (from and to)");
      return;
    }
    if (!organizationName.trim()) {
      setError("Please enter organization name");
      return;
    }
    if (files.length === 0) {
      setError("Please select at least one file");
      return;
    }
    const validFrom = Math.floor(new Date(timeFrom).getTime() / 1000);
    const validTo = Math.floor(new Date(timeTo).getTime() / 1000);
    if (validTo <= validFrom) {
      setError("End time must be after start time");
      return;
    }
    setUploading(true);
    setError("");
    setSuccess(false);
    try {
      const file = files[0];
      const buf = await file.arrayBuffer();
      const documentHash = ethers.keccak256(new Uint8Array(buf));
      await registerDocument(documentHash, validFrom, validTo, organizationName.trim());
      const formData = new FormData();
      formData.append("hash", documentHash);
      formData.append("issuer", organizationName.trim());
      formData.append("holder", account!);
      formData.append("credentialName", file.name);
      formData.append("description", `Self uploaded document from ${organizationName}`);
      formData.append("expiryDate", String(validTo * 1000));
      formData.append("file", file);
      formData.append("metadata", JSON.stringify({ validFrom: validFrom * 1000, organizationName }));
      await backend.saveCredential(formData);
      setSuccess(true);
      setFiles([]);
      setTimeFrom("");
      setTimeTo("");
      setOrganizationName("");
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
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
      <h1 className="text-2xl font-bold text-white mb-2">Upload new document</h1>
      <p className="text-sm text-gray-500 mb-6">Only digitally signed documents or with valid QR code.</p>

      <form onSubmit={handleUpload} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Date – from</label>
            <input
              type="date"
              required
              value={timeFrom}
              onChange={(e) => setTimeFrom(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Date – to</label>
            <input
              type="date"
              required
              value={timeTo}
              onChange={(e) => setTimeTo(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Organization name</label>
          <input
            type="text"
            required
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
            className={inputClass}
            placeholder="Issuing organization"
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
          <input type="file" multiple className="hidden" id="file-upload" onChange={handleChange} />
          <label
            htmlFor="file-upload"
            className="inline-block px-6 py-2.5 rounded-xl bg-[#5227FF] text-white font-medium cursor-pointer hover:bg-[#3DC2EC] hover:text-[#0f0a18] transition-all border border-[#5227FF]/50"
          >
            Select files
          </label>
          <p className="text-xs text-gray-500 mt-4">PDF, JPG, PNG (max 10MB)</p>
        </div>
        {files.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-[#0f0a18]/70 p-6">
            <h3 className="font-semibold text-white mb-4">Selected files</h3>
            <div className="space-y-3">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <File className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-white">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(idx)}
                    className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}
        <button
          type="submit"
          disabled={uploading || files.length === 0}
          className="w-full py-3.5 rounded-xl bg-[#5227FF] text-white font-semibold hover:bg-[#3DC2EC] hover:text-[#0f0a18] disabled:opacity-50 transition-all border border-[#5227FF]/50"
        >
          {uploading ? "Confirm in MetaMask…" : "Upload document"}
        </button>
      </form>
      {success && (
        <div className="mt-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 shrink-0" />
          Document registered on blockchain.
        </div>
      )}
    </div>
  );
};
