import { useNavigate, useLocation } from "react-router-dom";
import { Lock, LogOut, ScanLine } from "lucide-react";
import { useWeb3 } from "../context/Web3Context";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { disconnect } = useWeb3();
  const { isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    disconnect();
    logout();
    navigate("/");
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();

    // If not on landing page, navigate to it first
    if (location.pathname !== "/") {
      navigate("/");
      // Wait for navigation then scroll
      setTimeout(() => {
        const element = document.getElementById(targetId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else {
      // Already on landing page, just scroll
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const navLinkStyle =
    "relative text-xs font-semibold uppercase tracking-wider text-white/80 hover:text-white transition-colors cursor-pointer";

  // Determine if we're on the landing page for transparent navbar
  const isLandingPage = location.pathname === "/";
  const navbarBg = isLandingPage && !isScrolled
    ? "bg-transparent"
    : "bg-[#0f0a18]/95 backdrop-blur-xl";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] h-16 border-b border-white/10 ${navbarBg} transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => navigate("/")}
          >
            <img src="/DHRUVALOGO.jpeg" alt="Dhruva Logo" className="h-8 w-8 object-cover rounded-lg" />
            <span className="ml-3 text-xl font-bold text-white tracking-tight" style={{ fontFamily: 'Arimo, sans-serif', fontWeight: 700 }}>
              DHRUVA
            </span>
          </div>


          <div className="hidden md:flex items-center gap-8">
            <a
              href="#three-roles"
              onClick={(e) => handleNavClick(e, "three-roles")}
              className={navLinkStyle}
            >
              Three Roles
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleNavClick(e, "how-it-works")}
              className={navLinkStyle}
            >
              How It Works
            </a>
            <a
              href="#about-us"
              onClick={(e) => handleNavClick(e, "about-us")}
              className={navLinkStyle}
            >
              About Us
            </a>
          </div>


          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/verify")}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <ScanLine className="w-3.5 h-3.5" />
                  Verify
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  <Lock className="w-3.5 h-3.5" />
                  Login
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-white bg-[#5227FF] hover:bg-[#3DC2EC] hover:text-[#0f0a18] rounded-lg transition-all border border-[#5227FF]/50"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
