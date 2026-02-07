import { Eye, Ban, Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { useWeb3 } from "../../context/Web3Context";
import { backend } from "../../api/backend";
import type { BlockchainCredential } from "../../types";

interface CredentialWithHash extends BlockchainCredential {
  credentialHash: string;
}

export const OrgIssued = () => {
  const { account, getIssuerCredentials, verifyCredential, revokeCredential } = useWeb3();
  const [credentials, setCredentials] = useState<CredentialWithHash[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  useEffect(() => {
    const fetchCredentials = async () => {
      if (!account || !getIssuerCredentials || !verifyCredential) return;

      try {
        setLoading(true);
        
        // Try blockchain first, fallback to backend in hackathon mode
        try {
          const hashes = await getIssuerCredentials(account);
          const list: CredentialWithHash[] = [];

          for (const hash of hashes) {
            const result = await verifyCredential(hash);
            if (result.exists) {
              list.push({ ...result, credentialHash: hash });
            }
          }
          setCredentials(list);
        } catch (blockchainError) {
          console.warn("[HACKATHON MODE] Blockchain unavailable, loading from backend:", blockchainError);
          
          // Load from backend instead
          const backendCreds = await backend.getCredentialsByIssuer(account);
          const list: CredentialWithHash[] = backendCreds.map((cred: any) => ({
            exists: true,
            revoked: false,
            expired: false,
            issuer: cred.issuer,
            holder: cred.holder,
            issuedAt: BigInt(new Date(cred.issuedAt).getTime() / 1000),
            expiryDate: cred.expiresAt ? BigInt(new Date(cred.expiresAt).getTime() / 1000) : BigInt(0),
            name: cred.metadata?.name || cred.credentialName || "Unknown",
            experience: cred.metadata?.experience || cred.description || "",
            credentialHash: cred.credentialHash
          }));
          setCredentials(list);
        }
      } catch (err) {
        console.error("Failed to fetch issued credentials", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCredentials();
  }, [account, getIssuerCredentials, verifyCredential]);

  const handleRevoke = async (hash: string) => {
    if (!confirm("Are you sure you want to revoke this credential? This action cannot be undone.")) return;
    try {
      await revokeCredential(hash);
      // Refresh list
      const updated = credentials.map(c =>
        c.credentialHash === hash ? { ...c, revoked: true } : c
      );
      setCredentials(updated);
    } catch (err) {
      alert("Failed to revoke credential");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Issued credentials</h1>

      <div className="rounded-2xl border border-white/10 bg-[#0f0a18]/70 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#5227FF] border-t-transparent mx-auto" />
            <p className="mt-4 text-sm text-gray-400">Loading issued credentials…</p>
          </div>
        ) : credentials.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No credentials issued yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Credential name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Recipient</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Issued date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {credentials.map((cred) => (
                  <tr key={cred.credentialHash} className="hover:bg-white/5">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{cred.name || "Untitled"}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 font-mono" title={cred.credentialHash}>ID: {cred.credentialHash.substring(0, 8)}…</span>
                        <button onClick={() => handleCopy(cred.credentialHash)} className="text-gray-400 hover:text-[#3DC2EC] transition-colors" title="Copy full hash">
                          {copiedHash === cred.credentialHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{cred.holder.substring(0, 10)}…{cred.holder.substring(38)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(Number(cred.issuedAt) * 1000).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {cred.revoked ? (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">Revoked</span>
                      ) : Number(cred.expiryDate) * 1000 < Date.now() ? (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">Expired</span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Active</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={async () => {
                          try {
                            const backendData = await backend.getCredentialByHash(cred.credentialHash);
                            if (backendData && (backendData as { fileUrl?: string }).fileUrl) window.open((backendData as { fileUrl: string }).fileUrl, "_blank");
                            else alert("No document file associated with this credential.");
                          } catch {
                            alert("Failed to fetch credential details from backend.");
                          }
                        }}
                        className="text-[#3DC2EC] hover:text-white mr-3 transition-colors"
                        title="View document"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {!cred.revoked && (
                        <button onClick={() => handleRevoke(cred.credentialHash)} className="text-red-400 hover:text-red-300 transition-colors" title="Revoke credential">
                          <Ban className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
