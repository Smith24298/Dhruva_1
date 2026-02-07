import { useAuth } from "../../context/AuthContext";
import { BackButton } from "../../components/BackButton";

export const UserProfile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <BackButton to="/dashboard" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>
      <div className="rounded-2xl border border-white/10 bg-[#0f0a18]/70 backdrop-blur-sm p-8">
        <div className="flex items-center mb-8">
          <div className="h-20 w-20 rounded-2xl bg-[#5227FF]/20 border border-[#5227FF]/40 text-[#3DC2EC] flex items-center justify-center text-3xl font-bold mr-6">
            {user?.name?.[0] || "U"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <p className="text-gray-400">{user?.email}</p>
            <span className="inline-block mt-2 text-xs font-semibold text-[#3DC2EC] bg-[#3DC2EC]/10 px-3 py-1 rounded-lg border border-[#3DC2EC]/30 capitalize">
              {user?.role}
            </span>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Full name</label>
            <input
              type="text"
              readOnly
              value={user?.name || ""}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Email</label>
            <input
              type="email"
              readOnly
              value={user?.email || ""}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1.5">DID (Decentralized ID)</label>
            <input
              type="text"
              readOnly
              value="did:dhurva:123456789abcdef"
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-mono text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
