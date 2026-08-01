import React, { useRef } from "react";
import { Award, Download, Printer, ShieldCheck } from "lucide-react";

interface CertificateProps {
  studentName: string;
  courseName: string;
  completionDate: string;
}

export default function CertificatePDF({ studentName, courseName, completionDate }: CertificateProps) {
  const certificateRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Printable Certificate Box */}
      <div 
        ref={certificateRef}
        className="bg-slate-950 border-4 border-amber-500/40 rounded-3xl p-10 text-center space-y-6 relative overflow-hidden shadow-2xl shadow-amber-500/10 font-sans"
      >
        <div className="absolute inset-0 bg-radial from-amber-500/5 via-transparent to-black pointer-events-none" />

        <div className="flex justify-between items-center relative z-10 border-b border-white/10 pb-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <span className="font-display font-extrabold text-white text-xs tracking-wider uppercase font-mono">JSTU Networking Club</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">CERT-ID: JNC-2026-VERIFIED</span>
        </div>

        <div className="space-y-3 relative z-10 py-6">
          <p className="text-xs uppercase font-mono tracking-widest text-amber-400 font-bold">Certificate of Merit & Completion</p>
          <h2 className="text-xl text-slate-400 font-serif italic">This is proudly presented to</h2>
          <h1 className="text-3xl font-display font-extrabold text-white tracking-wide border-b border-amber-500/30 pb-3 inline-block px-8">
            {studentName}
          </h1>
          <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed pt-2">
            for successfully completing the rigorous engineering bootcamp on <span className="text-white font-bold">{courseName}</span> conducted by the JSTU Networking Club laboratory.
          </p>
        </div>

        <div className="flex justify-between items-end relative z-10 pt-8 border-t border-white/10 text-xs font-mono">
          <div className="text-left">
            <p className="text-white font-bold">Dr. Md. Auditor</p>
            <p className="text-[9px] text-slate-500">Head of Network Engineering</p>
          </div>
          <div className="w-12 h-12 rounded-full border border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-amber-400 font-bold text-xs">
            JNC
          </div>
          <div className="text-right">
            <p className="text-slate-300">{completionDate}</p>
            <p className="text-[9px] text-slate-500">Date of Validation</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handlePrint}
          className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl border border-white/10 flex items-center justify-center space-x-2 transition-all shadow-lg"
        >
          <Printer className="w-4 h-4 text-orange-400" />
          <span>Print / Save as PDF</span>
        </button>
      </div>
    </div>
  );
}