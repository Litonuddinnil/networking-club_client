import React, { useState } from "react";
import { CreditCard, Upload, CheckCircle2, ArrowLeft } from "lucide-react";

interface PaymentViewProps {
  memberName: string;
  memberId: string;
  onBack: () => void;
  onSubmitPayment: (month: string, method: string, amount: number, trxId: string, proof: string) => void;
}

export default function PaymentView({ memberName, memberId, onBack, onSubmitPayment }: PaymentViewProps) {
  const [selectedMonth, setSelectedMonth] = useState("July 2026");
  const [method, setMethod] = useState("bKash");
  const [amount, setAmount] = useState(300);
  const [trxId, setTrxId] = useState("");
  const [proof, setProof] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const months = [
    "January 2026", "February 2026", "March 2026", "April 2026",
    "May 2026", "June 2026", "July 2026", "August 2026",
    "September 2026", "October 2026", "November 2026", "December 2026"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trxId) return;
    onSubmitPayment(selectedMonth, method, amount, trxId, proof);
    setIsSubmitted(true);
  };

  return (
    <div className="p-6 lg:p-10 max-w-3xl mx-auto space-y-6 animate-fade-in text-slate-300 font-sans">
      <div className="flex items-center space-x-3 pb-4 border-b border-white/5">
        <button 
          onClick={onBack}
          className="p-2 bg-slate-900 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-display font-extrabold text-white tracking-wide">
            Subscription & Dues Gateway
          </h1>
          <p className="text-xs text-slate-500">Secure digital ledger verification for JSTU Networking Club</p>
        </div>
      </div>

      {isSubmitted ? (
        <div className="bg-[#03070E] border border-emerald-500/20 rounded-3xl p-10 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">Payment Proof Submitted Successfully!</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Your transaction ID <span className="text-orange-400 font-mono">{trxId}</span> for <span className="text-white">{selectedMonth}</span> has been broadcast to the cluster ledger. Pending auditor validation.
          </p>
          <button
            onClick={onBack}
            className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/20 transition-all"
          >
            Return to Dashboard Node
          </button>
        </div>
      ) : (
        <div className="bg-[#03070E] border border-white/10 rounded-3xl p-8 space-y-6 shadow-xl relative overflow-hidden backdrop-blur-md">
          <div className="absolute inset-0 bg-linear-to-b from-orange-500/5 to-transparent pointer-events-none" />

          <div className="bg-black/40 border border-white/5 rounded-2xl p-4 flex justify-between items-center text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">ACCOUNT HOLDER</span>
              <span className="font-bold text-white">{memberName}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block text-[10px]">NODE IDENTIFIER</span>
              <span className="font-bold text-orange-400">{memberId}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Target Subscription Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none font-mono"
              >
                {months.map((m) => (
                  <option key={m} value={m} className="bg-[#03070E]">{m}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Gateway Provider</label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none font-mono"
                >
                  <option value="bKash" className="bg-[#03070E]">bKash (Merchant / Send Money)</option>
                  <option value="Nagad" className="bg-[#03070E]">Nagad</option>
                  <option value="Rocket" className="bg-[#03070E]">Rocket</option>
                  <option value="Bank Transfer" className="bg-[#03070E]">University Bank Transfer</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Amount (BDT)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white outline-none font-mono"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Transaction ID (TrxID)</label>
              <div className="relative flex items-center bg-black/40 border border-white/10 rounded-xl px-3 py-2.5">
                <CreditCard className="w-4.5 h-4.5 text-slate-500 mr-2.5" />
                <input
                  type="text"
                  required
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  placeholder="e.g. 9H74X28K1L"
                  className="bg-transparent text-xs text-white placeholder-slate-600 outline-none w-full font-mono uppercase"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Proof Screenshot URL (Optional)</label>
              <div className="relative flex items-center bg-black/40 border border-white/10 rounded-xl px-3 py-2.5">
                <Upload className="w-4.5 h-4.5 text-slate-500 mr-2.5" />
                <input
                  type="text"
                  value={proof}
                  onChange={(e) => setProof(e.target.value)}
                  placeholder="https://ibb.co/... or image link"
                  className="bg-transparent text-xs text-white placeholder-slate-600 outline-none w-full font-mono"
                />
              </div>
            </div>

            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-[11px] font-mono text-orange-300 space-y-1">
              <p className="font-bold">Payment Instructions:</p>
              <p>Send ৳{amount} to Club Official {method} Number: <span className="text-white font-bold">01700000000</span> (Personal/Merchant) and put your TrxID above.</p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-orange-600/20"
            >
              <CreditCard className="w-4 h-4" />
              <span>Broadcast Payment Ledger Shard</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}