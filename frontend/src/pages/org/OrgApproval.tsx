import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, FileText, User, Calendar, AlertCircle, Eye } from "lucide-react";
import { useWeb3 } from "../../context/Web3Context";
import { useAuth } from "../../context/AuthContext";
import { backend } from "../../api/backend";
import { ethers } from "ethers";
import { isAuthorizedIssuer } from "../../services/contractService";

interface ApprovalRequest {
  _id: string;
  requester: string;
  organization: string;
  documentHash: string;
  documentName: string;
  documentType: string;
  description: string;
  fileUrl: string;
  status: "pending" | "approved" | "rejected";
  responseMessage: string;
  requestedAt: string;
  respondedAt?: string;
  expiryDate: number;
}

export const OrgApproval = () => {
  const { account, isActive, issueCredential } = useWeb3();
  const { user } = useAuth();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [error, setError] = useState("");
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [isOnChainAuthorized, setIsOnChainAuthorized] = useState<boolean | null>(null);
  const { getSigner } = useWeb3();

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

    const checkOnChainAuth = async () => {
      if (account && isActive) {
        try {
          const signer = await getSigner();
          if (signer.provider) {
            const authorized = await isAuthorizedIssuer(account, signer.provider as any);
            setIsOnChainAuthorized(authorized);
          }
        } catch (e) {
          console.error("Failed to check on-chain auth", e);
        }
      }
    };

    if (user?.username) {
      checkApproval();
    }
    if (account && isActive) {
      checkOnChainAuth();
    }
  }, [user, account, isActive]);

  useEffect(() => {
    if (account && isActive) {
      loadRequests();
    }
  }, [account, isActive, filter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const status = filter === "all" ? undefined : filter;
      const data = await backend.getApprovalRequestsByOrganization(account!, status);
      setRequests(data);
    } catch (err) {
      console.error("Error loading approval requests:", err);
      setError("Failed to load approval requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: ApprovalRequest) => {
    if (!account) return;

    if (isApproved === false) {
      setError("Your organization is pending admin approval. You cannot approve requests yet.");
      return;
    }

    setProcessingId(request._id);
    setError("");

    try {
      // Generate credential hash
      const credentialData = JSON.stringify({
        holder: request.requester,
        issuer: account,
        documentHash: request.documentHash,
        documentName: request.documentName,
        timestamp: Date.now(),
      });
      const credentialHash = ethers.keccak256(ethers.toUtf8Bytes(credentialData));

      // Issue the credential on blockchain
      const expiryTimestamp = Math.floor(request.expiryDate / 1000);
      await issueCredential(
        request.requester,
        credentialHash,
        expiryTimestamp,
        request.documentName,
        request.description || "Verified by organization"
      );

      // Save credential to backend
      const formData = new FormData();
      formData.append("hash", credentialHash);
      formData.append("issuer", account);
      formData.append("holder", request.requester);
      formData.append("credentialName", request.documentName);
      formData.append("description", request.description);
      formData.append("documentType", request.documentType);
      formData.append("fromOrganisation", account);
      formData.append("expiryDate", String(request.expiryDate));
      formData.append("metadata", JSON.stringify({
        verified: true,
        verifiedBy: account,
        verifiedAt: Date.now(),
        originalDocumentHash: request.documentHash
      }));

      await backend.saveCredential(formData);

      // Update approval request status in backend
      await backend.updateApprovalRequest(request._id, {
        status: "approved",
        responseMessage: responseMessage || "Document approved and credential issued",
        issuedCredentialHash: credentialHash,
      });

      // Reload requests
      await loadRequests();
      setSelectedRequest(null);
      setResponseMessage("");
    } catch (err: unknown) {
      console.error("Error approving request:", err);
      setError(err instanceof Error ? err.message : "Failed to approve request");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (request: ApprovalRequest) => {
    if (!responseMessage.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    setProcessingId(request._id);
    setError("");

    try {
      // Update approval request status in backend
      await backend.updateApprovalRequest(request._id, {
        status: "rejected",
        responseMessage: responseMessage,
      });

      // Reload requests
      await loadRequests();
      setSelectedRequest(null);
      setResponseMessage("");
    } catch (err: unknown) {
      console.error("Error rejecting request:", err);
      setError(err instanceof Error ? err.message : "Failed to reject request");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-medium">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case "approved":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (!isActive) {
    return (
      <div className="max-w-4xl">
        <div className="rounded-2xl border border-white/10 bg-[#0f0a18]/70 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <p className="text-gray-300">Please connect your wallet to view approval requests</p>
        </div>
      </div>
    );
  }

  // Show pending approval message
  if (isApproved === false) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-white mb-6">Document Approval Requests</h1>
        <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-8 text-center">
          <Clock className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-xl font-bold text-yellow-400 mb-2">Pending Admin Approval</h2>
          <p className="text-gray-300 mb-4">
            Your organization registration is awaiting approval from a system administrator.
            You will be able to approve user requests once your organization is approved.
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
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-white mb-6">Document Approval Requests</h1>
        <div className="text-center py-12 text-gray-400">Checking approval status...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Document Approval Requests</h1>

      {/* Approved Banner */}
      <div className={`mb-6 flex items-start gap-3 rounded-xl border p-4 ${isOnChainAuthorized === false
          ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-200"
          : "bg-emerald-500/10 border-emerald-500/30 text-emerald-200"
        }`}>
        <img src="/DHRUVALOGO.jpeg" alt="Dhruva Logo" className="w-5 h-5 shrink-0 mt-0.5 object-contain" />
        <div>
          <p className="font-semibold">
            {isOnChainAuthorized === false
              ? "⚠️ Organization Approved (Partial)"
              : "✓ Organization Approved"}
          </p>
          <p className="text-sm opacity-90 mt-1">
            {isOnChainAuthorized === false
              ? "Your organization is approved in the system, but NOT authorized on the blockchain yet. You cannot issue credentials. Please contact the admin to sync your authorization."
              : "Your organization is approved. Document approvals will be issued on blockchain."}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {["all", "pending", "approved", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${filter === f
                ? "bg-[#5227FF] text-white border border-[#5227FF]/50"
                : "bg-white/5 text-gray-400 border border-white/10 hover:border-white/20"
              }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-[#0f0a18]/70 p-8 text-center">
          <p className="text-gray-400">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#0f0a18]/70 p-8 text-center">
          <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No {filter !== "all" ? filter : ""} approval requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request._id}
              className="rounded-2xl border border-white/10 bg-[#0f0a18]/70 p-6 hover:border-white/20 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-5 h-5 text-[#3DC2EC]" />
                    <h3 className="text-lg font-semibold text-white">{request.documentName}</h3>
                    {getStatusBadge(request.status)}
                  </div>
                  {request.documentType && (
                    <p className="text-sm text-gray-400 mb-2">Type: {request.documentType}</p>
                  )}
                  {request.description && (
                    <p className="text-sm text-gray-300 mb-3">{request.description}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <User className="w-4 h-4" />
                  <span className="font-mono text-xs">{request.requester.slice(0, 10)}...{request.requester.slice(-8)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(request.requestedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {request.fileUrl && (
                <div className="mb-4">
                  <a
                    href={request.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm hover:bg-white/10 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Document
                  </a>
                </div>
              )}

              {request.status === "pending" && (
                <div className="pt-4 border-t border-white/10">
                  {selectedRequest?._id === request._id ? (
                    <div className="space-y-3">
                      <textarea
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                        placeholder="Add a message (optional for approval, required for rejection)"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#5227FF] focus:ring-1 focus:ring-[#5227FF]"
                        rows={2}
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleApprove(request)}
                          disabled={processingId === request._id}
                          className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          {processingId === request._id ? "Approving..." : "Approve & Issue Credential"}
                        </button>
                        <button
                          onClick={() => handleReject(request)}
                          disabled={processingId === request._id}
                          className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          {processingId === request._id ? "Rejecting..." : "Reject"}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRequest(null);
                            setResponseMessage("");
                            setError("");
                          }}
                          className="px-4 py-2.5 rounded-xl bg-white/5 text-gray-400 hover:bg-white/10 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="w-full py-2.5 rounded-xl bg-[#5227FF] text-white font-semibold hover:bg-[#3DC2EC] hover:text-[#0f0a18] transition-all border border-[#5227FF]/50"
                    >
                      Review Request
                    </button>
                  )}
                </div>
              )}

              {request.status !== "pending" && request.responseMessage && (
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-gray-400 mb-1">Response:</p>
                  <p className="text-sm text-gray-300">{request.responseMessage}</p>
                  {request.respondedAt && (
                    <p className="text-xs text-gray-500 mt-2">
                      Responded on {new Date(request.respondedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
