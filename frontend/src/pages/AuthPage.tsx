import { useState, type FormEvent } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, AlertCircle, User, Mail, Wallet, Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "../layouts/AuthLayout";
import { BackButton } from "../components/BackButton";
import { useWeb3 } from "../context/Web3Context";

export const AuthPage = () => {
  const location = useLocation();
  const isSignup = location.pathname === "/signup";
  const searchParams = new URLSearchParams(location.search);
  const roleParam = searchParams.get("role");
  const initialRole = roleParam === "org" ? "org" : roleParam === "verifier" ? "verifier" : "user";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"user" | "org" | "verifier" | "admin">(initialRole as "user" | "org" | "verifier" | "admin");
  const [error, setError] = useState("");
  const [isSigning, setIsSigning] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { loginWithPassword, signup } = useAuth();
  const { account, isActive, connect, signMessage } = useWeb3();
  const navigate = useNavigate();

  const inputClass =
    "w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#5227FF] focus:ring-1 focus:ring-[#5227FF] transition-all";
  const labelClass = "block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2";

  const handleConnectWallet = async () => {
    try {
      setError("");
      // Skip backend validation during signup/login - validation happens during auth
      await connect(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet. Please make sure MetaMask is installed and unlocked.");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate password match for signup
    if (isSignup && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Require wallet connection for signup/login
    if (!isActive || !account) {
      setError("Please connect your MetaMask wallet first");
      return;
    }

    try {
      setIsSigning(true);

      // Request signature from wallet to verify ownership
      const message = isSignup
        ? `Sign this message to verify wallet ownership for ${username} on DHRUVA`
        : `Sign this message to verify wallet ownership for ${username} on DHRUVA`;

      let signature: string;
      try {
        signature = await signMessage(message);
      } catch (signError: unknown) {
        setIsSigning(false);
        if (signError instanceof Error && signError.message.includes("User rejected")) {
          setError("Signature request was rejected. Please sign the message to continue.");
        } else {
          setError(signError instanceof Error ? signError.message : "Failed to sign message. Please try again.");
        }
        return;
      }

      if (isSignup) {
        await signup(name, email, role, username, password, account, signature);
        const destination =
          role === "org" ? "/org/dashboard" :
            role === "verifier" ? "/verifier/dashboard" :
              role === "admin" ? "/admin/dashboard" :
                "/dashboard";
        navigate(destination);
      } else {
        const user = await loginWithPassword(username.trim(), password, account, signature);
        if (!user) {
          setError("Invalid username or password");
          setIsSigning(false);
          return;
        }
        const destination =
          user.role === "org" ? "/org/dashboard" :
            user.role === "verifier" ? "/verifier/dashboard" :
              user.role === "admin" ? "/admin/dashboard" :
                "/dashboard";
        navigate(destination);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsSigning(false);
    }
  };

  return (
    <AuthLayout>
      <div className="rounded-2xl border border-white/10 bg-[#0f0a18]/80 backdrop-blur-xl p-8 shadow-2xl">
        <div className="mb-6">
          <BackButton to="/" />
        </div>
        <div className="text-center mb-8">
          <div className="mb-4">
            <img src="/DHRUVALOGO.jpeg" alt="Dhruva Logo" className="h-16 w-16 object-cover rounded-xl mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isSignup ? "Sign up" : "Log in"}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {isSignup ? "Create your account" : "Enter your credentials"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isSignup && (
            <>
              <div>
                <label className={labelClass}>Full name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    className={inputClass}
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    className={inputClass}
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Role</label>
                <select
                  className={inputClass}
                  style={{ color: 'white' }}
                  value={role}
                  onChange={(e) => setRole(e.target.value as "user" | "org" | "verifier" | "admin")}
                >
                  <option value="user" style={{ color: 'white', backgroundColor: '#402E7A' }}>Holder (Student / Professional)</option>
                  <option value="org" style={{ color: 'white', backgroundColor: '#402E7A' }}>Issuer (University / Employer)</option>
                  <option value="verifier" style={{ color: 'white', backgroundColor: '#402E7A' }}>Verifier (Employer / Bank)</option>
                  <option value="admin" style={{ color: 'white', backgroundColor: '#402E7A' }}>Admin (System Administrator)</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className={labelClass}>Username</label>
            <input
              type="text"
              required
              autoComplete="username"
              className={inputClass}
              placeholder="Enter Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className={labelClass}>Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                className={inputClass}
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {isSignup && (
            <div>
              <label className={labelClass}>Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  className={inputClass}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
          {!isSignup && (
            <div className="text-right">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-xs text-[#3DC2EC] hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* MetaMask Wallet Connection - Required */}
          <div className="rounded-xl border border-white/20 bg-white/5 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#3DC2EC]" />
                <span className="text-sm font-semibold text-white">MetaMask Wallet</span>
              </div>
              {isActive && account && (
                <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  Connected
                </span>
              )}
            </div>

            {isActive && account ? (
              <div className="text-xs font-mono text-gray-400 bg-white/5 p-2 rounded border border-white/10">
                {account.slice(0, 6)}...{account.slice(-4)}
              </div>
            ) : (
              <>
                <p className="text-xs text-gray-400 mb-3">
                  {isSignup
                    ? "Connect your wallet to register. This wallet will be linked to your account."
                    : "Connect your registered wallet to login. Must match your signup wallet."}
                </p>
                <button
                  type="button"
                  onClick={handleConnectWallet}
                  className="w-full py-2 rounded-lg bg-amber-500/20 text-amber-300 text-sm font-medium border border-amber-500/40 hover:bg-amber-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Wallet className="w-4 h-4" />
                  Connect MetaMask
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Don't have MetaMask? <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer" className="text-[#3DC2EC] hover:underline">Install it here</a>
                </p>
              </>
            )}
          </div>

          <button
            type="submit"
            disabled={!isActive || !account || isSigning}
            className="w-full py-3.5 rounded-xl bg-[#5227FF] text-white font-semibold hover:bg-[#3DC2EC] hover:text-[#0f0a18] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 border border-[#5227FF]/50"
          >
            {isSigning ? (
              <>
                <span className="animate-spin">⏳</span>
                {isSignup ? "Signing message..." : "Signing message..."}
              </>
            ) : (
              <>
                {isSignup ? "Create account" : "Sign in"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(isSignup ? "/login" : "/signup")}
            className="text-sm font-medium text-[#3DC2EC] hover:underline"
          >
            {isSignup ? "Already have an account? Log in" : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </AuthLayout>
  );
};
