import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import VantaNet from "../components/VantaNet";
import {
  CheckCircle,
  Building,
  ScanLine,
  User,
  Key,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 },
};
const stagger = { visible: { transition: { staggerChildren: 0.1, delayChildren: 0.06 } } };

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#131313] overflow-hidden">

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        {/* Hero - centered, with VantaNet background */}
        <section className="relative pt-32 pb-36 md:pb-44 text-white min-h-[85vh] flex items-center justify-center">
          {/* VantaNet background - only for hero section */}
          <div className="absolute inset-0 z-0">
            <VantaNet className="w-full h-full" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#131313]/30 via-transparent to-[#131313]/90 pointer-events-none z-10" />
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative z-20">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="flex flex-col items-center"
            >
              <motion.span
                variants={fadeUp}
                className="inline-block bg-[#5227FF]/20 text-[#a78bfa] px-4 py-2 rounded-full font-semibold text-xs uppercase tracking-widest border border-[#5227FF]/40 mb-6"
              >
                Verifiable Credentials · Blockchain-Anchored
              </motion.span>
              <motion.h1
                variants={fadeUp}
                className="text-5xl sm:text-6xl md:text-7xl font-black mb-8 leading-[0.95] tracking-tight"
              >
                TRUST{" "}
                <span className="bg-gradient-to-r from-[#3DC2EC] to-[#5227FF] bg-clip-text text-transparent">
                  PROTOCOL.
                </span>
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="text-lg text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed"
              >
                Self-sovereign identity. Issuers sign credentials. Blockchain anchors hashes.
                Verifiers scan QR — instant verification. No personal data on-chain.
              </motion.p>
              <motion.div
                variants={fadeUp}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <motion.button
                  onClick={() => navigate("/login")}
                  className="px-8 py-4 rounded-xl font-bold bg-[#5227FF] text-white border border-[#5227FF] hover:bg-[#3DC2EC] hover:border-[#3DC2EC] hover:text-[#0f0a18] transition-all duration-300 shadow-lg shadow-[#5227FF]/25"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started
                </motion.button>
                <motion.button
                  onClick={() => navigate("/verify")}
                  className="px-8 py-4 rounded-xl font-bold bg-transparent text-white border-2 border-white/40 hover:border-white hover:bg-white/10 transition-all duration-300"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Verify Credential
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Roles */}
        <section id="three-roles" className="relative py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-black text-white mb-14 text-center"
            >
              Platform Roles
            </motion.h2>
            <motion.div
              className="grid md:grid-cols-2 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={stagger}
            >
              {[
                {
                  icon: Building,
                  title: "Issuer",
                  desc: "University, employer, government. Signs credentials, anchors hash on blockchain.",
                  accent: "#5227FF",
                },
                {
                  icon: User,
                  title: "Holder",
                  desc: "Student, professional. Owns credentials in wallet. Generates QR to share.",
                  accent: "#3DC2EC",
                },
                {
                  icon: ScanLine,
                  title: "Verifier",
                  desc: "Employer, bank. Scans QR, verifies hash on-chain. Instant result.",
                  accent: "#8B5CF6",
                },
                {
                  icon: Shield,
                  title: "Admin",
                  desc: "Governance. Authorizes issuers, manages smart contracts, ensuring system integrity.",
                  accent: "#F43F5E",
                },
              ].map((role, index) => (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="group relative rounded-2xl border border-white/10 bg-[#0f0a18]/70 backdrop-blur-xl p-8 hover:border-white/20 hover:shadow-xl hover:shadow-[#5227FF]/10 transition-all duration-300"
                >
                  <div
                    className="absolute left-0 top-8 bottom-8 w-1 rounded-r-full transition-all duration-300 group-hover:opacity-100"
                    style={{ backgroundColor: role.accent, opacity: 0.8 }}
                  />
                  <role.icon
                    className="w-12 h-12 mb-5 transition-transform duration-300 group-hover:scale-110"
                    style={{ color: role.accent }}
                  />
                  <h3 className="text-xl font-bold text-white mb-2">{role.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{role.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Flow */}
        <section id="how-it-works" className="relative py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              className="text-3xl md:text-4xl font-black text-white mb-14 text-center"
            >
              How It Works
            </motion.h2>
            <motion.div
              className="grid md:grid-cols-3 gap-0 rounded-2xl overflow-hidden border border-white/10 bg-[#0f0a18]/50 backdrop-blur-sm"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              variants={stagger}
            >
              {[
                {
                  icon: Building,
                  title: "01. ISSUE",
                  desc: "Issuer creates credential JSON, signs it, stores hash on blockchain. Full credential stored off-chain.",
                },
                {
                  icon: Key,
                  title: "02. VAULT",
                  desc: "Holder receives credential in wallet. DID-linked. Generates QR with proof for verification.",
                },
                {
                  icon: CheckCircle,
                  title: "03. VERIFY",
                  desc: "Verifier scans QR or pastes hash. Checks blockchain: signature, hash, revocation. Instant result.",
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  variants={fadeUp}
                  whileHover={{ backgroundColor: "rgba(82, 39, 255, 0.15)" }}
                  className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/10 last:border-r-0 group transition-colors duration-50 cursor-default"
                >
                  <step.icon className="w-12 h-12 text-[#5227FF] mb-6 group-hover:text-[#3DC2EC] transition-colors duration-50" />
                  <h3 className="text-lg font-black text-white mb-3 uppercase tracking-wide">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 group-hover:text-gray-300 text-sm leading-relaxed transition-colors duration-50">
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <motion.section
          className="relative py-28"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a18] via-transparent to-transparent pointer-events-none" />
          <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
              Ready to verify?
            </h2>
            <p className="text-gray-400 mb-10">
              Instant credential verification. No manual attestation. DPDP-compliant design.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                onClick={() => navigate("/login")}
                className="px-8 py-4 rounded-xl font-bold bg-white text-[#0f0a18] hover:bg-[#3DC2EC] hover:text-[#0f0a18] transition-colors duration-300"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Login
              </motion.button>
              <motion.button
                onClick={() => navigate("/verify")}
                className="px-8 py-4 rounded-xl font-bold border-2 border-white/50 text-white hover:bg-white hover:text-[#0f0a18] transition-all duration-300"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                Verify Now
              </motion.button>
            </div>
          </div>
        </motion.section>

        <Footer />
      </div>
    </div>
  );
};
