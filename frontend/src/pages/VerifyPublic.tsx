import { useState, useEffect, useCallback, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { ScanLine, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { backend } from "../api/backend";
import Silk from "../components/Silk";
import { Navbar } from "../components/Navbar";

export const VerifyPublic = () => {
  const [searchParams] = useSearchParams();
  const hashFromUrl = searchParams.get("hash") || "";
  const { verifyCredential, isActive } = useWeb3();
  const [input, setInput] = useState(hashFromUrl);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<{
    exists: boolean;
    revoked: boolean;
    expired: boolean;
    issuer?: string;
    holder?: string;
    name?: string;
    experience?: string;
  } | null>(null);
  const [offChain, setOffChain] = useState<unknown>(null);
  const [error, setError] = useState("");

  const doVerify = useCallback(async (hash: string) => {
    setVerifying(true);
    setResult(null);
    setOffChain(null);
    setError("");
    try {
      const chain = await verifyCredential(hash);
      setResult({
        exists: chain.exists,
        revoked: chain.revoked,
        expired: chain.expired,
        issuer: chain.issuer,
        holder: chain.holder,
        name: chain.name,
        experience: chain.experience,
      });
      try {
        const c = await backend.getCredentialByHash(hash);
        setOffChain(c);
      } catch {
        setOffChain(null);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setVerifying(false);
    }
  }, [verifyCredential]);

  useEffect(() => {
    setInput(hashFromUrl);
    if (hashFromUrl) {
      doVerify(hashFromUrl);
    }
  }, [hashFromUrl, doVerify]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    let h = input.trim();
    if (h.includes("hash=")) {
      try {
        const url = new URL(h.startsWith("http") ? h : `http://x.com/${h}`);
        const extracted = url.searchParams.get("hash");
        if (extracted) h = extracted;
      } catch { }
    }
    const hashRegex = /0x[a-fA-F0-9]{64}/;
    const match = h.match(hashRegex);
    if (match) h = match[0];
    if (h) doVerify(h);
  };

  const valid = result?.exists && !result?.revoked && !result?.expired;

  return (
    <div className="min-h-screen flex flex-col bg-[#0f0a18]">
      <div className="fixed inset-0 z-0">
        <Silk
          speed={5}
          scale={1}
          color="#28243d"
          noiseIntensity={1.5}
          rotation={0}
        />
      </div>
      <Navbar />
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0f0a18]/80 backdrop-blur-xl shadow-2xl overflow-hidden">
          <div className="p-8 text-center border-b border-white/10">
            <div className="inline-flex rounded-xl bg-[#5227FF]/20 p-4 border border-[#5227FF]/40 mb-4">
              <ScanLine className="w-10 h-10 text-[#3DC2EC]" />
            </div>
            <h1 className="text-2xl font-bold text-white">Verify credential</h1>
            <p className="text-gray-400 text-sm mt-1">Scan QR or paste hash. No login required.</p>
          </div>
          <form onSubmit={handleSubmit} className="p-8">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste credential hash or unique ID"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-500 font-mono text-sm mb-4 focus:outline-none focus:border-[#5227FF] focus:ring-1 focus:ring-[#5227FF]"
            />
            <button
              type="submit"
              disabled={verifying}
              className="w-full py-3.5 rounded-xl bg-[#5227FF] text-white font-semibold hover:bg-[#3DC2EC] hover:text-[#0f0a18] disabled:opacity-50 transition-all border border-[#5227FF]/50"
            >
              {verifying ? "Verifying…" : "Verify"}
            </button>
          </form>

          {!isActive && (
            <div className="px-8 pb-6">
              <p className="text-xs text-amber-400/90 bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl">
                Connect wallet for on-chain verification. Basic checks may work without.
              </p>
            </div>
          )}

          {error && (
            <div className="mx-8 mb-6 flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {result && (
            <div
              className={`mx-8 mb-8 p-6 rounded-xl border ${valid ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"
                }`}
            >
              <div className="flex items-center gap-3 mb-4">
                {valid ? (
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                ) : (
                  <XCircle className="w-10 h-10 text-red-400" />
                )}
                <div className="text-left">
                  <h3 className={`text-lg font-bold ${valid ? "text-emerald-300" : "text-red-300"}`}>
                    {valid ? "Credential verified" : result.revoked ? "Revoked" : result.expired ? "Expired" : "Not found"}
                  </h3>
                  <p className="text-sm text-gray-400">
                    {valid ? "Authentic and not tampered with." : "This credential cannot be verified."}
                  </p>
                </div>
              </div>
              {result.exists && (
                <div className="space-y-2 text-sm border-t border-white/10 pt-4">
                  {(offChain as { credentialName?: string })?.credentialName && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Document name</span>
                      <span className="font-medium text-[#3DC2EC]">{(offChain as { credentialName: string }).credentialName}</span>
                    </div>
                  )}
                  {result.name && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Recipient (on-chain)</span>
                      <span className="font-medium text-white">{result.name}</span>
                    </div>
                  )}
                  {(offChain as { metadata?: { recipientName?: string } })?.metadata?.recipientName &&
                    (offChain as { metadata: { recipientName: string } }).metadata.recipientName !== result.name && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Recipient (off-chain)</span>
                        <span className="font-medium text-white">{(offChain as { metadata: { recipientName: string } }).metadata.recipientName}</span>
                      </div>
                    )}
                  {result.experience && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Details</span>
                      <span className="font-medium text-white">{result.experience}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-400">Issuer</span>
                    <span className="font-semibold text-white">
                      {(offChain as { fromOrganisation?: string })?.fromOrganisation || result.issuer}
                    </span>
                  </div>
                  {result.issuer && (
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-gray-400 shrink-0">Issuer address</span>
                      <span className="font-mono text-[10px] break-all text-gray-500">{result.issuer}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
