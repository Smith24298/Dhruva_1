import { FileText, Share2, Plus, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWeb3 } from "../../context/Web3Context";
import { backend } from "../../api/backend";
import { BackButton } from "../../components/BackButton";

const CredentialCard = ({ title, issuer, date, hash, onShare, fileUrl }: any) => {
  const [copied, setCopied] = useState(false);

  const handleCopyHash = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="rounded-2xl border border-white/10 bg-[#0f0a18]/70 backdrop-blur-sm p-6 hover:border-white/20 hover:shadow-lg hover:shadow-[#5227FF]/5 transition-all cursor-pointer group"
      onClick={() => fileUrl && window.open(fileUrl, "_blank")}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="w-10 h-10 rounded-xl bg-[#5227FF]/20 border border-[#5227FF]/40 flex items-center justify-center text-[#3DC2EC]">
          <FileText className="w-5 h-5" />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleCopyHash}
            className="p-2 rounded-lg text-gray-400 hover:text-[#3DC2EC] bg-white/5 hover:bg-white/10 transition-colors"
            title="Copy hash"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onShare(); }}
            className="p-2 rounded-lg text-gray-400 hover:text-[#3DC2EC] bg-white/5 hover:bg-white/10 transition-colors"
            title="Share"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <h3 className="text-lg font-bold text-white uppercase mb-1 line-clamp-1">{title}</h3>
      <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Issued: {date}</p>
      <div className="mb-4">
        <p className="text-[10px] font-mono text-gray-500 break-all bg-white/5 p-2 rounded-lg border border-white/10">
          {hash}
        </p>
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-white/10">
        <span className="text-xs font-medium text-[#3DC2EC] truncate max-w-[150px]">{issuer}</span>
        <span className="text-[10px] font-semibold text-emerald-400/90 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">
          Verified
        </span>
      </div>
    </div>
  );
};

export const UserDashboard = () => {
  const { account } = useWeb3();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (account) {
      setLoading(true);
      backend.getCredentialsByHolder(account)
        .then((data) => {
          setCredentials(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch credentials", err);
          setLoading(false);
        });
    }
  }, [account]);

  const handleShare = (hash: string) => {
    navigate(`/dashboard/share?hash=${hash}`);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div>
          <BackButton to="/" />
          <h1 className="text-2xl font-bold text-white mt-4">Identity Vault</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your verified credentials</p>
        </div>
        <Link
          to="/dashboard/upload"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5227FF] text-white font-semibold hover:bg-[#3DC2EC] hover:text-[#0f0a18] transition-all border border-[#5227FF]/50"
        >
          <Plus className="w-4 h-4" /> Add document
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading credentials…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {credentials.length === 0 ? (
            <p className="col-span-full text-center text-gray-500 py-12">No credentials found.</p>
          ) : (
            credentials.map((cred, idx) => (
              <CredentialCard
                key={idx}
                title={cred.credentialName}
                issuer={cred.fromOrganisation || cred.issuer}
                date={new Date(cred.issuedAt).toLocaleDateString()}
                hash={cred.hash}
                onShare={() => handleShare(cred.hash)}
                fileUrl={cred.fileUrl}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};
