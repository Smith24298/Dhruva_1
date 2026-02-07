import { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle, FileText, AlertCircle, Eye, Calendar } from "lucide-react";
import { useWeb3 } from "../../context/Web3Context";
import { backend } from "../../api/backend";
import { BackButton } from "../../components/BackButton";

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
  issuedCredentialHash?: string;
}

export const UserApprovalStatus = () => {
  const { account, isActive } = useWeb3();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [error, setError] = useState("");

  useEffect(() => {
    if (account && isActive) {
      loadRequests();
    }
  }, [account, isActive, filter]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await backend.getApprovalRequestsByRequester(account!);
      // Filter by status if needed
      const filtered = filter === "all" 
        ? data 
        : data.filter((req: ApprovalRequest) => req.status === filter);
      setRequests(filtered);
    } catch (err) {
      console.error("Error loading approval requests:", err);
      setError("Failed to load approval requests");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-medium">
            <Clock className="w-3 h-3" />
            Pending Review
          </span>
        );
      case "approved":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
            <CheckCircle className="w-3 h-3" />
            Verified
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
        <div className="mb-6">
          <BackButton to="/dashboard" />
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0f0a18]/70 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
          <p className="text-gray-300">Please connect your wallet to view approval requests</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <BackButton to="/dashboard" />
      </div>
      
      <h1 className="text-2xl font-bold text-white mb-2">Document Approval Status</h1>
      <p className="text-sm text-gray-400 mb-6">Track the status of documents you've submitted for verification</p>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {["all", "pending", "approved", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
              filter === f
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
          <p className="text-gray-400">
            {filter === "all" 
              ? "You haven't submitted any documents for verification yet" 
              : `No ${filter} requests found`}
          </p>
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
                  <Calendar className="w-4 h-4" />
                  <span>Submitted: {new Date(request.requestedAt).toLocaleDateString()}</span>
                </div>
                {request.respondedAt && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Responded: {new Date(request.respondedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-400 mb-3">
                <span className="font-semibold">Organization:</span>
                <span className="font-mono ml-2">{request.organization.slice(0, 10)}...{request.organization.slice(-8)}</span>
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
                  <p className="text-sm text-gray-400">
                    ⏳ Waiting for organization to review your document
                  </p>
                </div>
              )}

              {request.status === "approved" && (
                <div className="pt-4 border-t border-white/10 bg-emerald-500/5 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-400 mb-1">
                        Document Verified!
                      </p>
                      <p className="text-sm text-gray-300">
                        {request.responseMessage || "Your document has been verified and is now part of your verified credentials."}
                      </p>
                      {request.issuedCredentialHash && (
                        <p className="text-xs text-gray-500 mt-2 font-mono">
                          Credential: {request.issuedCredentialHash.slice(0, 20)}...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {request.status === "rejected" && request.responseMessage && (
                <div className="pt-4 border-t border-white/10 bg-red-500/5 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-red-400 mb-1">Rejection Reason:</p>
                      <p className="text-sm text-gray-300">{request.responseMessage}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        This document is not part of your verified credentials. You can submit a new request with corrections.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
