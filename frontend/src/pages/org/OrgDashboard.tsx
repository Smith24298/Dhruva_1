import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileCheck,
  Upload,
  ScanLine,
  FileText,
  Building2,
  ChevronRight,

} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useWeb3 } from "../../context/Web3Context";

export const OrgDashboard = () => {
  const { user } = useAuth();
  const { account, getIssuerCredentials, isActive } = useWeb3();
  const navigate = useNavigate();
  const [totalIssued, setTotalIssued] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const organisationName = user?.name ?? "Organisation";

  useEffect(() => {
    const fetchStats = async () => {
      if (!isActive || !account) {
        setLoading(false);
        return;
      }
      try {
        const hashes = await getIssuerCredentials(account);
        setTotalIssued(hashes?.length ?? 0);
      } catch {
        setTotalIssued(0);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [account, isActive, getIssuerCredentials]);

  const actions = [
    {
      title: "Issue asset",
      description: "Issue a new credential to a destination address. Add document type, recipient details, and upload the file.",
      icon: Upload,
      path: "/org/issue",
      accent: "#5227FF",
    },
    {
      title: "Verify credential",
      description: "Verify credentials by pasting hash or unique ID from user's QR code.",
      icon: ScanLine,
      path: "/org/verify",
      accent: "#3DC2EC",
    },
    {
      title: "Registry",
      description: "View all credentials issued by your organisation.",
      icon: FileText,
      path: "/org/issued",
      accent: "#8B5CF6",
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Command center</h1>
          <p className="text-sm text-gray-400 mt-1">Organisation operational overview</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Building2 className="w-5 h-5 text-[#3DC2EC]" />
          <span className="font-medium text-white">{organisationName}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#0f0a18]/70 p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Total credentials issued
            </p>
            <h3 className="text-3xl font-bold text-white">{loading ? "—" : totalIssued}</h3>
          </div>
          <div className="rounded-xl bg-[#5227FF]/20 p-3 border border-[#5227FF]/40">
            <FileCheck className="w-6 h-6 text-[#3DC2EC]" />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0f0a18]/70 p-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Status</p>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <img src="/DHRUVALOGO.jpeg" alt="Dhruva Logo" className="w-5 h-5 object-contain" />
              {isActive ? "Connected" : "Connect wallet"}
            </h3>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-white mb-4">Quick actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="rounded-2xl border border-white/10 bg-[#0f0a18]/70 p-6 text-left hover:border-white/20 hover:shadow-lg hover:shadow-[#5227FF]/5 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="rounded-xl p-3 border"
                    style={{ backgroundColor: `${action.accent}20`, borderColor: `${action.accent}40` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: action.accent }} />
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-[#3DC2EC] group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{action.title}</h3>
                <p className="text-sm text-gray-400">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0f0a18]/70 p-6">
        <h3 className="text-sm font-bold text-[#3DC2EC] uppercase tracking-wider mb-3">How it works</h3>
        <ul className="text-sm text-gray-400 space-y-2">
          <li>
            <strong className="text-white">Issue asset</strong> — Destination address, document type, recipient name, details, and file upload. Document is sent to the receiver&apos;s address.
          </li>
          <li>
            <strong className="text-white">Verify</strong> — Paste credential hash or unique ID from a user&apos;s QR code to verify authenticity on-chain.
          </li>
          <li>
            <strong className="text-white">Registry</strong> — View and manage all credentials issued by your organisation.
          </li>
        </ul>
      </div>
    </div>
  );
};
