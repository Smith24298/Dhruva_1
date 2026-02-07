import { useState, useEffect, useCallback } from "react";
import { QrCode as QrIcon, Copy, Check, Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useWeb3 } from "../../context/Web3Context";
import { backend } from "../../api/backend";
import QRCode from "qrcode";
import { BackButton } from "../../components/BackButton";

export const UserShare = () => {
  const [searchParams] = useSearchParams();
  const preSelectedHash = searchParams.get("hash") || "";
  const { account, isActive } = useWeb3();
  const [credentials, setCredentials] = useState<any[]>([]);
  const [selectedHash, setSelectedHash] = useState(preSelectedHash);
  const [loading, setLoading] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const loadCredentials = useCallback(async () => {
    if (!account) return;
    setLoading(true);
    try {
      const data = await backend.getCredentialsByHolder(account);
      setCredentials(data);
    } catch (err) {
      console.error("Failed to load credentials", err);
    } finally {
      setLoading(false);
    }
  }, [account]);

  useEffect(() => {
    if (isActive && account) loadCredentials();
  }, [isActive, account, loadCredentials]);

  useEffect(() => {
    if (selectedHash) {
      const baseUrl = window.location.origin;
      const verificationUrl = `${baseUrl}/verify?hash=${encodeURIComponent(selectedHash)}`;
      QRCode.toDataURL(verificationUrl, { width: 300, margin: 2 })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("QR generation failed", err));
    } else {
      setQrDataUrl("");
    }
  }, [selectedHash]);

  const handleCopy = () => {
    if (!selectedHash) return;
    const baseUrl = window.location.origin;
    const verificationUrl = `${baseUrl}/verify?hash=${encodeURIComponent(selectedHash)}`;
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedCred = credentials.find((c) => c.hash === selectedHash);

  return (
    <div className="max-w-2xl mx-auto pb-20">
      <div className="mb-6">
        <BackButton to="/dashboard" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-1">Share identity</h1>
      <p className="text-sm text-gray-400 mb-8">Generate secure verification assets</p>

      <div className="rounded-2xl border border-white/10 bg-[#0f0a18]/70 backdrop-blur-sm p-8">
        <div className="mb-8">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Target credential
          </label>
          {loading ? (
            <div className="flex items-center gap-2 text-[#3DC2EC] py-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-medium">Loading vault…</span>
            </div>
          ) : (
            <select
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white focus:outline-none focus:border-[#5227FF] font-medium"
              value={selectedHash}
              onChange={(e) => setSelectedHash(e.target.value)}
            >
              <option value="">— Select from vault —</option>
              {credentials.map((c) => (
                <option key={c.hash} value={c.hash}>
                  {c.credentialName} ({c.hash.slice(0, 10)}…)
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedHash && (
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col items-center mb-8 text-center">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 mb-6">
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="Verification QR" className="w-64 h-64 rounded-xl" />
                ) : (
                  <div className="w-64 h-64 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
                  </div>
                )}
              </div>
              <h3 className="text-lg font-bold text-white">{selectedCred?.credentialName}</h3>
              <p className="text-xs text-gray-500 mt-1">Instant verification</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Direct verification link
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-400 truncate">
                    {typeof window !== "undefined" && window.location.origin}/verify?hash={selectedHash}
                  </div>
                  <button
                    onClick={handleCopy}
                    className="px-5 py-3 rounded-xl bg-[#5227FF] text-white font-medium hover:bg-[#3DC2EC] hover:text-[#0f0a18] transition-all border border-[#5227FF]/50 flex items-center gap-2 shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
              <div className="rounded-xl bg-[#3DC2EC]/10 border border-[#3DC2EC]/30 p-4">
                <p className="text-xs text-gray-300 leading-relaxed">
                  Sharing this link/QR allows anyone with it to verify the authenticity of this document against the blockchain.
                </p>
              </div>
            </div>
          </div>
        )}

        {!selectedHash && !loading && (
          <div className="py-12 text-center border-2 border-dashed border-white/10 rounded-xl">
            <QrIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Select a credential to generate QR and link</p>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-[#5227FF]/10 p-6">
          <h4 className="font-bold text-white text-sm mb-2">Proof of existence</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            The hash is your unique cryptographic proof. Copy it to verify anywhere on the network.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#3DC2EC]/10 p-6">
          <h4 className="font-bold text-white text-sm mb-2">Privacy check</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Always verify the identity of the person you share credentials with.
          </p>
        </div>
      </div>
    </div>
  );
};
