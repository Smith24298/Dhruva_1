import React from "react";
import { Navbar } from "../components/Navbar";
import Silk from "../components/Silk";

export const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0f0a18]">
      <div className="fixed inset-0 z-0">
        <Silk
          speed={5}
          scale={1}
          color="#28243d"
          noiseIntensity={1.5}
          rotation={0}
        />
      </div>
      <Navbar />
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 pt-24">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
};
