import { CheckCircle2, XCircle, Clock, Building2, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useWeb3 } from "../../context/Web3Context";
import { authorizeIssuer, getContractOwner, isAuthorizedIssuer } from "../../services/contractService";

interface OrgApprovalRequest {
  _id: string;
  username: string;
  organizationName: string;
  website?: string;
  description?: string;
  walletAddress: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

const RequestCard = ({ request, onApprove, onReject, onSyncAuth }: {
  request: OrgApprovalRequest;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onSyncAuth: (request: OrgApprovalRequest) => void;
}) => {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const handleReject = () => {
    if (rejectionReason.trim()) {
      onReject(request._id, rejectionReason);
      setShowRejectModal(false);
      setRejectionReason("");
    }
  };

  const statusColors = {
    pending: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    approved: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    rejected: "text-red-400 bg-red-500/10 border-red-500/20"
  };

  const statusIcons = {
    pending: <Clock className="w-4 h-4" />,
    approved: <CheckCircle2 className="w-4 h-4" />,
    rejected: <XCircle className="w-4 h-4" />
  };

  return (
    <>
      <div className="rounded-2xl border border-white/10 bg-[#0f0a18]/70 backdrop-blur-sm p-6 hover:border-white/20 transition-all">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#5227FF]/20 border border-[#5227FF]/40 flex items-center justify-center text-[#3DC2EC]">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{request.organizationName}</h3>
              <p className="text-sm text-gray-400">@{request.username}</p>
            </div>
          </div>
          <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${statusColors[request.status]}`}>
            {statusIcons[request.status]}
            {request.status.toUpperCase()}
          </span>
        </div>

        {request.website && (
          <div className="mb-2">
            <span className="text-xs text-gray-500">Website:</span>
            <a href={request.website} target="_blank" rel="noopener noreferrer" className="ml-2 text-sm text-[#3DC2EC] hover:underline">
              {request.website}
            </a>
          </div>
        )}

        {request.description && (
          <p className="text-sm text-gray-300 mb-4">{request.description}</p>
        )}

        <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
          <p className="text-xs text-gray-500 mb-1">Wallet Address:</p>
          <p className="text-xs font-mono text-gray-400 break-all">{request.walletAddress}</p>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-white/10">
          <span className="text-xs text-gray-500">
            Submitted: {new Date(request.createdAt).toLocaleDateString()}
          </span>

          {request.status === "pending" && (
            <div className="flex gap-2">
              <button
                onClick={() => onApprove(request._id)}
                className="px-4 py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-sm font-semibold border border-emerald-500/40 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-semibold border border-red-500/40 transition-all flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
            </div>
          )}

          {request.status !== "pending" && request.reviewedBy && (
            <div className="flex items-center gap-4">
              <div className="text-xs text-gray-500">
                {request.status === "approved" ? "Approved" : "Rejected"} by {request.reviewedBy}
              </div>
              {request.status === "approved" && (
                <button
                  onClick={() => onSyncAuth(request)}
                  className="px-3 py-1.5 rounded-lg bg-[#5227FF]/10 hover:bg-[#5227FF]/20 text-[#3DC2EC] text-xs font-semibold border border-[#5227FF]/30 transition-all flex items-center gap-1.5"
                  title="Check and fix blockchain authorization"
                >
                  <img src="/DHRUVALOGO.jpeg" alt="Dhruva Logo" className="w-3 h-3 object-cover rounded" />
                  Sync Auth
                </button>
              )}
            </div>
          )}
        </div>

        {request.status === "rejected" && request.rejectionReason && (
          <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-gray-500 mb-1">Rejection Reason:</p>
            <p className="text-sm text-red-400">{request.rejectionReason}</p>
          </div>
        )}
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0f0a18] border border-white/20 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Reject Organization</h3>
            <p className="text-sm text-gray-400 mb-4">
              Please provide a reason for rejecting {request.organizationName}
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#5227FF] focus:ring-1 focus:ring-[#5227FF] transition-all resize-none h-24"
              placeholder="Enter rejection reason..."
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm font-semibold border border-white/20 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className="flex-1 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-semibold border border-red-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { account, isActive, getSigner } = useWeb3();
  const [requests, setRequests] = useState<OrgApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/api/admin/org-requests");
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch org requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      // Find the request to get the wallet address
      const request = requests.find(r => r._id === requestId);
      if (!request) {
        alert("Request not found");
        setProcessingId(null);
        return;
      }

      // Validate wallet address exists
      if (!request.walletAddress || request.walletAddress.trim() === "") {
        alert("This organization request is missing a wallet address. The organization must connect their wallet first.");
        setProcessingId(null);
        return;
      }

      // Check if admin wallet is connected
      if (!isActive || !account) {
        alert("Please connect your MetaMask wallet to approve organizations. Admin must be connected to authorize on blockchain.");
        setProcessingId(null);
        return;
      }

      // Step 1: Approve in database
      const response = await fetch(`http://localhost:5000/api/admin/org-requests/${requestId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminUsername: user?.username }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "Failed to approve organization");
        setProcessingId(null);
        return;
      }

      // Step 2: Check if issuer is already authorized
      try {
        const provider = await getSigner().then(s => s.provider);
        if (provider) {
          const normalizedWallet = request.walletAddress.toLowerCase();
          const alreadyAuthorized = await isAuthorizedIssuer(normalizedWallet, provider as any);

          if (alreadyAuthorized) {
            alert(`✅ Success! ${request.organizationName} has been approved. They are already authorized on blockchain.`);
            await fetchRequests();
            setProcessingId(null);
            return;
          }
        }
      } catch (checkError) {
        console.warn("Could not check authorization status:", checkError);
      }

      // Step 3: Attempt to authorize on blockchain
      try {
        const signer = await getSigner();
        const provider = signer.provider;

        // Check if admin is contract owner or authorized issuer
        if (provider) {
          const contractOwner = await getContractOwner(provider as any);
          const adminIsOwner = account.toLowerCase() === contractOwner.toLowerCase();
          const adminIsAuthorized = await isAuthorizedIssuer(account, provider as any);

          if (!adminIsOwner && !adminIsAuthorized) {
            alert(
              `⚠️ Database approval successful!\n\n` +
              `However, you are not the contract owner or an authorized issuer, so blockchain authorization cannot be completed automatically.\n\n` +
              `The organization is approved in the database. They will need to:\n` +
              `1. Use the "Authorization" page in their dashboard to authorize themselves, OR\n` +
              `2. Contact the contract owner (${contractOwner.slice(0, 6)}...${contractOwner.slice(-4)}) to authorize them.`
            );
            await fetchRequests();
            setProcessingId(null);
            return;
          }
        }

        // Try to authorize
        const normalizedWallet = request.walletAddress.toLowerCase();
        await authorizeIssuer(normalizedWallet, signer);
        alert(`✅ Success! ${request.organizationName} has been approved and authorized on blockchain.`);
      } catch (blockchainError: any) {
        console.error("Blockchain authorization error:", blockchainError);

        // Check if it's an authorization error
        const errorMessage = blockchainError.reason || blockchainError.message || "Unknown error";
        if (errorMessage.includes("Only owner") || errorMessage.includes("Only owner or authorized issuer") || blockchainError.code === "CALL_EXCEPTION") {
          alert(
            `⚠️ Database approval successful, but blockchain authorization failed.\n\n` +
            `Error: ${errorMessage}\n\n` +
            `The organization is approved in the database, but you need to be the contract owner or an authorized issuer to authorize them on blockchain.\n\n` +
            `The organization can try to authorize themselves via the "Authorization" page in their dashboard, or contact the contract owner.`
          );
        } else {
          alert(
            `⚠️ Database approval successful, but blockchain authorization failed:\n\n${errorMessage}\n\n` +
            `The organization can try to authorize themselves via the "Authorization" page in their dashboard.`
          );
        }
      }

      await fetchRequests();
      setProcessingId(null);
    } catch (error: any) {
      console.error("Failed to approve:", error);
      alert("Failed to approve organization: " + (error.message || "Unknown error"));
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string, reason: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/org-requests/${requestId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminUsername: user?.username, reason }),
      });

      if (response.ok) {
        await fetchRequests();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to reject organization");
      }
    } catch (error) {
      console.error("Failed to reject:", error);
      alert("Failed to reject organization");
    }
  };

  const handleSyncAuth = async (request: OrgApprovalRequest) => {
    setProcessingId(request._id);
    try {
      if (!isActive || !account) {
        alert("Please connect your MetaMask wallet to sync authorization.");
        setProcessingId(null);
        return;
      }

      if (!request.walletAddress) {
        alert("Request missing wallet address");
        setProcessingId(null);
        return;
      }

      const signer = await getSigner();
      const provider = signer.provider;
      const normalizedWallet = request.walletAddress.toLowerCase();

      // Check if already authorized
      const alreadyAuthorized = await isAuthorizedIssuer(normalizedWallet, provider as any);

      if (alreadyAuthorized) {
        alert(`✅ ${request.organizationName} is already authorized on the blockchain.`);
        setProcessingId(null);
        return;
      }

      // Try to authorize
      await authorizeIssuer(normalizedWallet, signer);
      alert(`✅ Success! ${request.organizationName} has been authorized on blockchain.`);

    } catch (error: any) {
      console.error("Sync Auth Error:", error);
      const errorMessage = error.reason || error.message || "Unknown error";

      if (errorMessage.includes("Only owner") || errorMessage.includes("Only owner or authorized issuer")) {
        alert(`⚠️ Authorization failed. You must be the contract owner or an authorized issuer to authorize others.\n\nError: ${errorMessage}`);
      } else {
        alert(`❌ Failed to authorize: ${errorMessage}`);
      }
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = requests.filter((req) =>
    filter === "all" ? true : req.status === filter
  );

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0614] via-[#1a0b2e] to-[#0a0614] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#5227FF] to-[#3DC2EC] flex items-center justify-center p-2">
            <img src="/DHRUVALOGO.jpeg" alt="Dhruva Logo" className="w-7 h-7 object-cover rounded-lg" />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase bg-gradient-to-r from-[#3DC2EC] via-[#5227FF] to-[#3DC2EC] bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 text-sm mt-1">Manage organization approval requests</p>
          </div>
        </div>

        {/* Wallet Connection Warning */}
        {(!isActive || !account) && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 p-4 text-yellow-200">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-200">⚠️ Wallet Not Connected</p>
              <p className="text-sm text-yellow-200/90 mt-1">
                You need to connect your MetaMask wallet to approve organizations. Approving orgs requires blockchain authorization (only contract owner can authorize issuers).
              </p>
            </div>
          </div>
        )}

        {isActive && account && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-200">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-200">✅ Wallet Connected</p>
              <p className="text-sm text-emerald-200/90 mt-1">
                Connected: {account.slice(0, 6)}...{account.slice(-4)} - You can now approve organizations.
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Requests</p>
            <p className="text-2xl font-bold text-white">{stats.total}</p>
          </div>
          <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <p className="text-xs text-yellow-400 uppercase tracking-wider mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-xs text-emerald-400 uppercase tracking-wider mb-1">Approved</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.approved}</p>
          </div>
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-red-400 uppercase tracking-wider mb-1">Rejected</p>
            <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {(["all", "pending", "approved", "rejected"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${filter === status
                ? "bg-[#5227FF] text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading requests...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12">
            <img src="/DHRUVALOGO.jpeg" alt="Dhruva Logo" className="w-16 h-16 mx-auto mb-4 object-cover rounded-xl" />
            <p className="text-gray-400 text-lg">No {filter !== "all" ? filter : ""} requests found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredRequests.map((request) => (
              <RequestCard
                key={request._id}
                request={request}
                onApprove={handleApprove}
                onReject={handleReject}
                onSyncAuth={handleSyncAuth}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
