import { useState, type FormEvent } from "react";
import { Scan, Search, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useWeb3 } from "../../context/Web3Context";
import type { BlockchainCredential } from "../../types/index";

export const OrgVerify = () => {
  const { verifyCredential, isActive } = useWeb3();
  const [input, setInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [results, setResults] = useState<{ hash: string; result: BlockchainCredential }[]>([]);
  const [error, setError] = useState("");

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();

    if (!isActive) {
      setError("Please connect your wallet first");
      return;
    }

    const raw = input.trim();
    if (!raw) {
      setError("Enter a credential hash or unique ID (paste from user's QR)");
      return;
    }

    setVerifying(true);
    setResults([]);
    setError("");

    try {
      const hashes = raw.split(",").map((h) => h.trim()).filter(Boolean);
      const list: { hash: string; result: BlockchainCredential }[] = [];

      for (const hash of hashes) {
        const verificationResult = await verifyCredential(hash);
        list.push({ hash, result: verificationResult });
      }

      setResults(list);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to verify credential");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Verify credential</h1>

      <div className="rounded-2xl border border-white/10 bg-[#0f0a18]/70 p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-[#5227FF]/20 border border-[#5227FF]/40 flex items-center justify-center mx-auto mb-4">
            <Scan className="w-8 h-8 text-[#3DC2EC]" />
          </div>
          <h2 className="text-lg font-semibold text-white">Scan QR or paste unique ID</h2>
          <p className="text-gray-400 text-sm mt-1">Paste a credential hash (0x…) or unique ID from the user&apos;s QR (comma-separated for multiple)</p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-[#5227FF] focus:ring-1 focus:ring-[#5227FF]"
              placeholder="0x... or paste unique ID (comma-separated for multiple)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={verifying} className="w-full py-3.5 rounded-xl bg-[#5227FF] text-white font-semibold hover:bg-[#3DC2EC] hover:text-[#0f0a18] disabled:opacity-50 transition-all border border-[#5227FF]/50">
            {verifying ? "Verifying…" : "Verify"}
          </button>
        </form>

        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-8 space-y-4">
            {results.map(({ hash, result }, idx) => (
              <div
                key={hash}
                className={`p-6 rounded-xl border ${
                  result.exists && !result.revoked && !result.expired ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"
                }`}
              >
                <div className="flex items-center mb-4">
                  {result.exists && !result.revoked && !result.expired ? (
                    <CheckCircle className="w-8 h-8 text-emerald-400 mr-3 shrink-0" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-400 mr-3 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <h3 className={`text-lg font-bold ${result.exists && !result.revoked && !result.expired ? "text-emerald-300" : "text-red-300"}`}>
                      {result.exists && !result.revoked && !result.expired ? "Credential verified" : "Invalid credential"}
                      {results.length > 1 ? ` (#${idx + 1})` : ""}
                    </h3>
                    <p className={`text-sm ${result.exists && !result.revoked && !result.expired ? "text-emerald-400/90" : "text-red-400/90"}`}>
                      {result.exists && !result.revoked && !result.expired ? "Authentic and not tampered with." : result.revoked ? "Revoked." : result.expired ? "Expired." : "Could not be verified."}
                    </p>
                  </div>
                </div>
                {result.exists && (
                  <div className="space-y-2 border-t border-white/10 pt-4">
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Issuer</span><span className="font-medium text-white font-mono text-xs break-all">{result.issuer}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Holder</span><span className="font-medium text-white font-mono text-xs break-all">{result.holder}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Issued</span><span className="font-medium text-white">{new Date(Number(result.issuedAt) * 1000).toLocaleDateString()}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-400">Expiry</span><span className="font-medium text-white">{new Date(Number(result.expiryDate) * 1000).toLocaleDateString()}</span></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
