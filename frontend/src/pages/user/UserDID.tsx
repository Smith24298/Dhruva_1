import { useState } from "react";
import { useWeb3 } from "../../context/Web3Context";
import { Fingerprint, CheckCircle, AlertCircle } from "lucide-react";
import { BackButton } from "../../components/BackButton";

export const UserDID = () => {
  const { account, registerDID, isActive } = useWeb3();
  const [didInput, setDidInput] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isActive) {
      setError("Please connect your wallet first");
      return;
    }
    setIsRegistering(true);
    setError("");
    try {
      await registerDID(didInput);
      setSuccess(true);
      setDidInput("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to register DID");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="mb-6">
        <BackButton to="/dashboard" />
      </div>
      <h1 className="text-2xl font-bold text-white">DID registration</h1>
      <p className="text-sm text-gray-400">Register your decentralized identity</p>

      {!success ? (
        <div className="rounded-2xl border border-white/10 bg-[#0f0a18]/70 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="text-center mb-8">
              <div className="inline-flex rounded-xl bg-[#5227FF]/20 p-4 border border-[#5227FF]/40 mb-4">
                <Fingerprint className="w-8 h-8 text-[#3DC2EC]" />
              </div>
              <h2 className="text-xl font-bold text-white">Register your DID</h2>
              <p className="text-sm text-gray-400 mt-1">Link your wallet to your decentralized identity</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Wallet address
              </label>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 font-mono text-sm text-gray-400">
                {account || "Not connected"}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                DID string
              </label>
              <input
                type="text"
                required
                value={didInput}
                onChange={(e) => setDidInput(e.target.value)}
                className="w-full p-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-[#5227FF] focus:ring-1 focus:ring-[#5227FF]"
                placeholder="did:ethr:0x..."
              />
              <p className="text-xs text-gray-500 mt-1">e.g. did:ethr:0x...</p>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}
            <button
              type="submit"
              disabled={isRegistering || !isActive}
              className="w-full py-3.5 rounded-xl bg-[#5227FF] text-white font-semibold hover:bg-[#3DC2EC] hover:text-[#0f0a18] disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-[#5227FF]/50"
            >
              {isRegistering ? "Registering…" : "Register DID"}
            </button>
          </form>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-emerald-300 mb-2">DID registered successfully</h3>
          <p className="text-gray-400 mb-8">Your decentralized identity has been registered on the blockchain.</p>
          <button
            onClick={() => setSuccess(false)}
            className="px-6 py-2.5 rounded-xl bg-[#5227FF] text-white font-semibold hover:bg-[#3DC2EC] hover:text-[#0f0a18] transition-all border border-[#5227FF]/50"
          >
            Register another DID
          </button>
        </div>
      )}
    </div>
  );
};
