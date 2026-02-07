import { useState, type ElementType, type FC } from "react";
import { useAuth } from "../context/AuthContext";
import { useWeb3 } from "../context/Web3Context";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {

  LayoutDashboard,
  FileText,
  Upload,
  Share2,
  User,
  LogOut,
  Menu,
  PlusCircle,
  CheckSquare,
  Wallet,
  Clock,
  Send,
  Lock,
} from "lucide-react";
import { clsx } from "clsx";

interface SidebarItem {
  name: string;
  icon: ElementType;
  path: string;
}

export const DashboardLayout: FC = () => {
  const { user, logout } = useAuth();
  const { isActive, connect, disconnect, account } = useWeb3();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const userItems: SidebarItem[] = [
    { name: "Terminal", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Vault", icon: FileText, path: "/dashboard/credentials" },
    { name: "Upload", icon: Upload, path: "/dashboard/upload" },
    { name: "Request Approval", icon: Send, path: "/dashboard/request-approval" },
    { name: "Approval Status", icon: Clock, path: "/dashboard/approval-status" },
    { name: "Share", icon: Share2, path: "/dashboard/share" },
    { name: "Identity", icon: User, path: "/dashboard/profile" },
  ];

  const orgItems: SidebarItem[] = [
    { name: "Command Center", icon: LayoutDashboard, path: "/org/dashboard" },
    { name: "Issue Asset", icon: PlusCircle, path: "/org/issue" },
    { name: "Registry", icon: FileText, path: "/org/issued" },
    { name: "Approval Requests", icon: Clock, path: "/org/approval" },
    { name: "Validator", icon: CheckSquare, path: "/org/verify" },
    { name: "Authorization", icon: Lock, path: "/org/issuer-auth" },
    { name: "Config", icon: User, path: "/org/profile" },
  ];

  const verifierItems: SidebarItem[] = [
    { name: "Verify Credentials", icon: CheckSquare, path: "/verifier/dashboard" },
  ];

  const adminItems: SidebarItem[] = [
    { name: "Org Approvals", icon: Lock, path: "/admin/dashboard" },
  ];

  const items: SidebarItem[] =
    user?.role === "org" ? orgItems :
      user?.role === "verifier" ? verifierItems :
        user?.role === "admin" ? adminItems :
          userItems;

  const handleLogout = () => {
    disconnect();
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#0f0a18] flex font-sans w-full">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={clsx(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#0f0a18]/90 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-in-out flex flex-col text-white",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <img src="/DHRUVALOGO.jpeg" alt="Dhruva Logo" className="h-7 w-7 object-cover rounded-lg" />
          <span className="ml-3 text-lg font-bold text-white tracking-tight" style={{ fontFamily: 'Arimo, sans-serif', fontWeight: 700 }}>DHRUVA</span>
        </div>

        <div className="px-3 py-4 flex-1">
          <div className="text-[10px] font-semibold text-[#3DC2EC] uppercase tracking-wider mb-3 px-3 opacity-70">
            Navigation
          </div>
          <nav className="space-y-0.5">
            {items.map((item: SidebarItem) => {
              const Icon = item.icon as React.ComponentType<{ className?: string }>;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsSidebarOpen(false);
                  }}
                  className={clsx(
                    "w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    location.pathname === item.path
                      ? "bg-[#5227FF]/20 text-white border border-[#5227FF]/40"
                      : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent",
                  )}
                >
                  <Icon
                    className={clsx(
                      "w-5 h-5 mr-3",
                      location.pathname === item.path ? "text-[#3DC2EC]" : "text-gray-500 group-hover:text-[#3DC2EC]",
                    )}
                  />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all border border-transparent hover:border-red-500/30"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-white/10 bg-[#0f0a18]/80 backdrop-blur-xl flex items-center justify-between px-4 lg:px-8">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="hidden md:flex items-center gap-4 px-4 py-2 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-[#3DC2EC]">
            <span className="w-2 h-2 bg-emerald-400 animate-pulse rounded-full" />
            <span>SECURE_NODE</span>
            <span className="text-white/50">|</span>
            <span>Lat: 22ms</span>
          </div>

          <div className="flex items-center gap-4">
            {isActive && account && (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 font-mono text-xs text-[#3DC2EC]">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                {account.slice(0, 6)}...{account.slice(-4)}
              </div>
            )}

            <div className="flex items-center gap-3 pl-4 border-l border-white/10">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-white">{user?.name}</p>
                <p className="text-xs text-[#3DC2EC] capitalize">{user?.role}</p>
              </div>
              <div className="h-9 w-9 rounded-xl bg-[#5227FF]/20 border border-[#5227FF]/40 text-[#3DC2EC] flex items-center justify-center font-bold">
                {user?.name?.[0] || "U"}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {!isActive ? (
            <div className="max-w-md mx-auto">
              <div className="rounded-2xl border border-white/10 bg-[#0f0a18]/80 backdrop-blur-xl p-8 text-center">
                <Wallet className="w-14 h-14 text-[#3DC2EC] mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Connect your wallet</h2>
                <p className="text-sm text-gray-400 mb-6">
                  Connect MetaMask (or compatible wallet) to use the dashboard and sign transactions.
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await connect();
                    } catch (error: any) {
                      alert(error.message || "Failed to connect wallet");
                    }
                  }}
                  className="px-6 py-3 rounded-xl bg-[#5227FF] text-white font-semibold hover:bg-[#3DC2EC] hover:text-[#0f0a18] transition-all border border-[#5227FF]/50"
                >
                  Connect wallet
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom duration-300">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
