import { Github } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="about-us" className="relative border-t border-white/10 bg-[#0f0a18]/90 backdrop-blur-sm text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center mb-5">
              <img src="/DHRUVALOGO.jpeg" alt="Dhruva Logo" className="h-7 w-7 object-cover rounded-lg" />
              <span className="ml-3 text-lg font-bold tracking-tight" style={{ fontFamily: 'Arimo, sans-serif', fontWeight: 700 }}>DHRUVA</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              The definitive protocol for decentralized identity and immutable credential verification.
              Built on global W3C standards.
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com/jenin8806/DHRUVA"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-[#5227FF]/20 hover:border-[#5227FF]/40 transition-all"
              >
                <Github size={16} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-[#3DC2EC] font-bold uppercase tracking-wider text-xs mb-5">
              Architecture
            </h4>
            <nav className="space-y-2">
              <a href="#how-it-works" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Verification Engine
              </a>
              <a href="#features" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Smart Contracts
              </a>
              <a href="#" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Security Audit
              </a>
              <a href="#" className="block text-gray-400 hover:text-white text-sm transition-colors">
                API Documentation
              </a>
            </nav>
          </div>

          <div>
            <h4 className="text-[#3DC2EC] font-bold uppercase tracking-wider text-xs mb-5">
              Ecosystem
            </h4>
            <nav className="space-y-2">
              <a href="#" className="block text-gray-400 hover:text-white text-sm transition-colors">
                University Partners
              </a>
              <a href="#" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Enterprise Solutions
              </a>
              <a href="#" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Government Portal
              </a>
              <a href="#" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Developer Hub
              </a>
            </nav>
          </div>

          <div>
            <h4 className="text-[#3DC2EC] font-bold uppercase tracking-wider text-xs mb-5">
              System Status
            </h4>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                  All Nodes Operational
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-mono">_BLOCK_HEIGHT: 8,421,902</p>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">
            © {currentYear} DHURVA PROTOCOL
          </p>
          <div className="flex gap-6 text-[11px] font-medium text-gray-500 uppercase tracking-wider">
            <a href="#" className="hover:text-[#3DC2EC] transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-[#3DC2EC] transition-colors">
              Terms of Service
            </a>
            <a href="#" className="hover:text-[#3DC2EC] transition-colors">
              SOC2 Compliance
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
