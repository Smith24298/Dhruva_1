import { useState, useEffect } from "react";
import { useWeb3 } from "../../context/Web3Context";
import { getContractOwner, isAuthorizedIssuer } from "../../services/contractService";
import { CheckCircle, AlertCircle, XCircle, Lock } from "lucide-react";

export const OrgIssuerAuth = () => {
  const { isActive, account, provider } = useWeb3();
  const [issuerAddress, setIssuerAddress] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [canManage, setCanManage] = useState<boolean | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isAlreadyAuthorized, setIsAlreadyAuthorized] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!provider || !account) {
      setCanManage(null);
      setIsOwner(false);
      setIsAlreadyAuthorized(false);
      return;
    }
    Promise.all([
      getContractOwner(provider),
      isAuthorizedIssuer(account, provider),
    ])
      .then(([owner, isAuthorized]) => {
        if (cancelled) return;
        const ownerCheck = owner.toLowerCase() === account.toLowerCase();
        setIsOwner(ownerCheck);
        setIsAlreadyAuthorized(isAuthorized);
        setCanManage(ownerCheck || isAuthorized);
      })
      .catch(() => {
        if (!cancelled) {
          setCanManage(null);
          setIsOwner(false);
          setIsAlreadyAuthorized(false);
        }
      });
    return () => { cancelled = true; };
  }, [provider, account]);

  const handleAuthorize = async () => {
    if (!isActive || !canManage) {
      setError("Please connect your wallet first");
      return;
    }
    setIsProcessing(true);
    setError("");
    setSuccess("");
    try {
      const { authorizeIssuer } = await import("../../services/contractService");
      const signer = await (await import("ethers")).BrowserProvider;
      const prov = new signer(window.ethereum);
      const s = await prov.getSigner();
      await authorizeIssuer(issuerAddress, s);
      setSuccess(`Issuer ${issuerAddress} has been authorized successfully`);
      setIssuerAddress("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to authorize issuer");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelfAuthorize = async () => {
    if (!isActive || !account) {
      setError("Please connect your wallet first");
      return;
    }
    setIsProcessing(true);
    setError("");
    setSuccess("");
    try {
      const { authorizeIssuer } = await import("../../services/contractService");
      const signer = await (await import("ethers")).BrowserProvider;
      const prov = new signer(window.ethereum);
      const s = await prov.getSigner();
      await authorizeIssuer(account, s);
      setSuccess("You have been successfully authorized as an issuer!");
      setIsAlreadyAuthorized(true);
      // Refresh the authorization status
      if (provider) {
        const isAuth = await isAuthorizedIssuer(account, provider);
        setIsAlreadyAuthorized(isAuth);
        setCanManage(isOwner || isAuth);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to authorize yourself");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevoke = async () => {
    if (!isActive || !canManage) {
      setError("Please connect your wallet first");
      return;
    }
    setIsProcessing(true);
    setError("");
    setSuccess("");
    try {
      const { revokeIssuer } = await import("../../services/contractService");
      const signer = await (await import("ethers")).BrowserProvider;
      const prov = new signer(window.ethereum);
      const s = await prov.getSigner();
      await revokeIssuer(issuerAddress, s);
      setSuccess(`Issuer ${issuerAddress} has been revoked successfully`);
      setIssuerAddress("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to revoke issuer");
    } finally {
      setIsProcessing(false);
    }
  };

  const cannotManage = canManage === false;

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Issuer authorization</h1>
        <p className="text-sm text-gray-400 mt-1">Manage authorized credential issuers</p>
      </div>

      {/* Hackathon Mode Banner */}
      <div className="flex items-start gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-200">
        <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-emerald-200">🚀 Hackathon Mode Active</p>
          <p className="text-sm text-emerald-200/90 mt-1">
            Blockchain authorization is bypassed! Credentials are saved to database only. Manual authorization is not required for demos.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0f0a18]/70 p-8">
        <div className="text-center mb-8">
          <div className="mb-4">
            <img src="/DHRUVALOGO.jpeg" alt="Dhruva Logo" className="h-14 w-14 object-cover rounded-xl mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-white">Manage authorized issuers</h2>
          <p className="text-sm text-gray-400 mt-1">Authorize or revoke credential issuers (contract owner only)</p>
        </div>

        {/* Self-Authorization Section for Contract Owner */}
        {isOwner && !isAlreadyAuthorized && (
          <div className="mb-8 rounded-xl bg-amber-500/10 border border-amber-500/30 p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-amber-200 mb-1">You need to authorize yourself first</h3>
                <p className="text-sm text-amber-200/90">
                  As the contract owner, you can authorize your own wallet to issue credentials. Click the button below to authorize yourself.
                </p>
              </div>
            </div>
            <button
              onClick={handleSelfAuthorize}
              disabled={isProcessing || !isActive}
              className="w-full py-3.5 rounded-xl bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isProcessing ? "Processing…" : (
                <>
                  <img src="/DHRUVALOGO.jpeg" alt="Dhruva Logo" className="w-5 h-5 object-contain" />
                  Authorize Myself as Issuer
                </>
              )}
            </button>
          </div>
        )}

        {/* Success Badge for Already Authorized */}
        {isAlreadyAuthorized && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-emerald-200">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-200">You are authorized as an issuer!</p>
              <p className="text-sm text-emerald-200/90 mt-1">You can now issue credentials and manage other issuers.</p>
            </div>
          </div>
        )}

        {cannotManage && (
          <div className="mb-6 flex items-start gap-3 rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 text-amber-200">
            <Lock className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-200">You need to be an authorized issuer to manage issuers.</p>
              <p className="text-sm text-amber-200/90 mt-1">Your connected wallet must be an authorized issuer (or contract owner). Ask the contract owner or an existing issuer to authorize your organization first.</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Issuer wallet address</label>
            <input
              type="text"
              required
              value={issuerAddress}
              onChange={(e) => setIssuerAddress(e.target.value)}
              disabled={canManage !== true}
              className="w-full p-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:border-[#5227FF] focus:ring-1 focus:ring-[#5227FF] disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="0x..."
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span className="text-sm font-medium">{success}</span>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={handleAuthorize}
              disabled={isProcessing || !isActive || canManage !== true}
              className="flex-1 py-3.5 rounded-xl bg-[#5227FF] text-white font-semibold hover:bg-[#3DC2EC] hover:text-[#0f0a18] disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-[#5227FF]/50"
            >
              {isProcessing ? "Processing…" : "Authorize"}
            </button>
            <button
              onClick={handleRevoke}
              disabled={isProcessing || !isActive || canManage !== true}
              className="flex-1 py-3.5 rounded-xl bg-red-500/20 text-red-400 font-semibold border border-red-500/40 hover:bg-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isProcessing ? "Processing…" : "Revoke"}
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0f0a18]/70 p-6">
        <h3 className="text-lg font-bold text-white mb-4">Authorization guidelines</h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <span>Only authorized issuers can issue credentials on the platform</span>
          </li>
          <li className="flex items-start gap-2">
            <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
            <span>Revoked issuers will immediately lose their issuing privileges</span>
          </li>
          <li className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <span>All authorization changes are permanently recorded on the blockchain</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
