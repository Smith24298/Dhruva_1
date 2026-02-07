import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react";
import { AuthLayout } from "../layouts/AuthLayout";
import { BackButton } from "../components/BackButton";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const ForgotPasswordPage = () => {
    const [username, setUsername] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const navigate = useNavigate();

    const inputClass =
        "w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#5227FF] focus:ring-1 focus:ring-[#5227FF] transition-all";
    const labelClass = "block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2";

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        try {
            setIsLoading(true);
            const response = await axios.post(`${API_URL}/api/users/forgot-password`, {
                username,
                newPassword,
            });

            if (response.data) {
                setSuccess(true);
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to reset password. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="rounded-2xl border border-white/10 bg-[#0f0a18]/80 backdrop-blur-xl p-8 shadow-2xl">
                <div className="mb-6">
                    <BackButton to="/login" />
                </div>
                <div className="text-center mb-8">
                    <div className="mb-4">
                        <img src="/DHRUVALOGO.jpeg" alt="Dhruva Logo" className="h-16 w-16 object-cover rounded-xl mx-auto" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                        Reset Password
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">
                        Enter your username and new password
                    </p>
                </div>

                {success ? (
                    <div className="flex flex-col items-center gap-4 text-center py-8">
                        <div className="rounded-full bg-emerald-500/20 p-4 border border-emerald-500/40">
                            <CheckCircle className="w-12 h-12 text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">Password Reset Successful!</h3>
                            <p className="text-sm text-gray-400">
                                Redirecting to login page...
                            </p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/30 p-3 rounded-xl text-sm">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div>
                            <label className={labelClass}>Username</label>
                            <input
                                type="text"
                                required
                                className={inputClass}
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>New Password</label>
                            <div className="relative">
                                <input
                                    type={showNewPassword ? "text" : "password"}
                                    required
                                    className={inputClass}
                                    placeholder="New Password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                                >
                                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Confirm New Password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    className={inputClass}
                                    placeholder="Confirm New Password"
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

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 rounded-xl bg-[#5227FF] text-white font-semibold hover:bg-[#3DC2EC] hover:text-[#0f0a18] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 border border-[#5227FF]/50"
                        >
                            {isLoading ? (
                                <>
                                    <span className="animate-spin">⏳</span>
                                    Resetting Password...
                                </>
                            ) : (
                                <>
                                    Reset Password
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate("/login")}
                        className="text-sm font-medium text-[#3DC2EC] hover:underline"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </AuthLayout>
    );
};
