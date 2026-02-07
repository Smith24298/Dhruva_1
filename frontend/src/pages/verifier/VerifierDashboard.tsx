import { useState, type FormEvent, type ChangeEvent } from "react";
import { ScanLine, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Upload } from "lucide-react";
import { useWeb3 } from "../../context/Web3Context";
import { backend } from "../../api/backend";
import type { BlockchainCredential } from "../../types";

type VerifyResult = {
  hash: string;
  found: boolean;
  credential: unknown;
  blockchain?: BlockchainCredential;
  status: "verified" | "revoked" | "expired" | "not_found" | "pending";
};

export const VerifierDashboard = () => {
  const { verifyCredential, isActive } = useWeb3();
  const [mode, setMode] = useState<"single" | "batch">("single");
  const [inputHash, setInputHash] = useState("");
  const [csvText, setCsvText] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [results, setResults] = useState<VerifyResult[]>([]);
  const [error, setError] = useState("");

  const handleSingleVerify = async (e: FormEvent) => {
    e.preventDefault();
    const hash = inputHash.trim();
    if (!hash) return;
    setVerifying(true);
    setError("");
    setResults([]);
    try {
      const hashes = hash.split(",").map((h) => h.trim()).filter(Boolean);
      const list: VerifyResult[] = [];
      for (const h of hashes) {
        let status: VerifyResult["status"] = "pending";
        let blockchain: BlockchainCredential | undefined;
        let credential: unknown = null;
        let found = false;
        try {
          const chain = await verifyCredential(h);
          blockchain = chain;
          found = chain.exists;
          if (!found) status = "not_found";
          else if (chain.revoked) status = "revoked";
          else if (chain.expired) status = "expired";
          else status = "verified";
          try {
            const offChain = await backend.getCredentialByHash(h);
            credential = offChain;
          } catch {
            credential = null;
          }
        } catch {
          status = "not_found";
        }
        list.push({ hash: h, found, credential, blockchain, status });
      }
      setResults(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleBatchVerify = async (e: FormEvent) => {
    e.preventDefault();
    const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const hashes = lines.flatMap((l) => l.split(",").map((h) => h.trim()).filter(Boolean));
    if (hashes.length === 0) {
      setError("Enter at least one credential hash");
      return;
    }
    setVerifying(true);
    setError("");
    setResults([]);
    try {
      const list: VerifyResult[] = [];
      for (const h of hashes) {
        let status: VerifyResult["status"] = "pending";
        let blockchain: BlockchainCredential | undefined;
        let credential: unknown = null;
        let found = false;
        try {
          const chain = await verifyCredential(h);
          blockchain = chain;
          found = chain.exists;
          if (!found) status = "not_found";
          else if (chain.revoked) status = "revoked";
          else if (chain.expired) status = "expired";
          else status = "verified";
          try {
            const offChain = await backend.getCredentialByHash(h);
            credential = offChain;
          } catch {
            credential = null;
          }
        } catch {
          status = "not_found";
        }
        list.push({ hash: h, found, credential, blockchain, status });
      }
      setResults(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Batch verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCsvText(String(reader.result));
    reader.readAsText(file);
  };

  const getStatusBadge = (r: VerifyResult) => {
    switch (r.status) {
      case "verified":
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-fit">
            <CheckCircle className="w-3 h-3" /> Verified
          </span>
        );
      case "revoked":
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1 w-fit">
            <XCircle className="w-3 h-3" /> Revoked
          </span>
        );
      case "expired":
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 w-fit">
            <AlertCircle className="w-3 h-3" /> Expired
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-white/10 text-gray-400 border border-white/10 flex items-center gap-1 w-fit">
            <XCircle className="w-3 h-3" /> Not Found
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white">Verifier dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Verify credentials via QR scan, paste, or CSV batch upload</p>
      </div>

      {!isActive && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm">
          Connect your wallet to verify on-chain. Read-only verification may work for cached data.
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("single")}
          className={`px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all ${mode === "single" ? "bg-[#5227FF] text-white border border-[#5227FF]/50" : "bg-white/5 text-gray-400 hover:text-white border border-white/10 hover:border-white/20"}`}
        >
          <ScanLine className="w-4 h-4" /> Single / QR
        </button>
        <button
          type="button"
          onClick={() => setMode("batch")}
          className={`px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all ${mode === "batch" ? "bg-[#5227FF] text-white border border-[#5227FF]/50" : "bg-white/5 text-gray-400 hover:text-white border border-white/10 hover:border-white/20"}`}
        >
          <FileSpreadsheet className="w-4 h-4" /> Batch (CSV)
        </button>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0f0a18]/70 p-6">
        {mode === "single" ? (
          <form onSubmit={handleSingleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Credential hash or Unique ID</label>
              <input
                type="text"
                value={inputHash}
                onChange={(e) => setInputHash(e.target.value)}
                placeholder="Paste hash, or comma-separated hashes from QR"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white font-mono text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#5227FF] focus:ring-1 focus:ring-[#5227FF]"
              />
            </div>
            <button type="submit" disabled={verifying} className="px-6 py-2.5 rounded-xl bg-[#5227FF] text-white font-semibold hover:bg-[#3DC2EC] hover:text-[#0f0a18] disabled:opacity-50 transition-all border border-[#5227FF]/50">
              {verifying ? "Verifying…" : "Verify"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleBatchVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Upload CSV or paste credential hashes</label>
              <p className="text-xs text-gray-500 mb-2">One hash per line, or comma-separated. Supports mass hiring verification.</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 cursor-pointer hover:bg-white/10 text-sm text-gray-300 hover:text-white transition-colors">
                <Upload className="w-4 h-4" /> Upload CSV
                <input type="file" accept=".csv,.txt" className="hidden" onChange={handleFileUpload} />
              </label>
              <textarea
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                rows={8}
                placeholder="0xabc123...&#10;0xdef456...&#10;or paste comma-separated hashes"
                className="w-full mt-2 px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white font-mono text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#5227FF] focus:ring-1 focus:ring-[#5227FF]"
              />
            </div>
            <button type="submit" disabled={verifying} className="px-6 py-2.5 rounded-xl bg-[#5227FF] text-white font-semibold hover:bg-[#3DC2EC] hover:text-[#0f0a18] disabled:opacity-50 transition-all border border-[#5227FF]/50">
              {verifying ? "Verifying…" : "Batch verify"}
            </button>
          </form>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {results.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#0f0a18]/70 overflow-hidden">
          <h3 className="p-4 border-b border-white/10 font-bold text-white">Results</h3>
          <div className="divide-y divide-white/10 max-h-96 overflow-y-auto">
            {results.map((r, i) => (
              <div key={i} className="p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-gray-500 break-all">{r.hash}</p>
                  {r.credential && typeof r.credential === "object" && "credentialName" in r.credential && (
                    <p className="text-sm font-medium text-white mt-1">{String((r.credential as { credentialName?: string }).credentialName)}</p>
                  )}
                </div>
                {getStatusBadge(r)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
