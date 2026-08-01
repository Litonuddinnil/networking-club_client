import React, { useState } from "react";
import { Cpu, Server, Cable, Check, AlertCircle, Info, Settings, Zap } from "lucide-react";
import { showCaseDevices } from "../data";

interface PortState {
  id: string;
  name: string;
  type: "copper" | "fiber" | "console";
  status: "up" | "down" | "disabled";
  ip?: string;
  speed: string;
  vlan?: number;
}

export default function InteractiveDeviceExplorer() {
  const [selectedDeviceIdx, setSelectedDeviceIdx] = useState(0);
  const [activePortId, setActivePortId] = useState<string | null>("port-0");

  const device = showCaseDevices[selectedDeviceIdx];

  // Port templates for devices
  const devicePorts: Record<number, PortState[]> = {
    0: [
      { id: "port-0", name: "GigabitEthernet0/0/0", type: "copper", status: "up", ip: "10.0.1.1", speed: "1000 Mbps", vlan: 1 },
      { id: "port-1", name: "GigabitEthernet0/0/1", type: "copper", status: "down", speed: "Auto Negotiate" },
      { id: "port-2", name: "GigabitEthernet0/0/2", type: "copper", status: "disabled", speed: "1000 Mbps" },
      { id: "port-3", name: "Console", type: "console", status: "up", speed: "9600 baud" }
    ],
    1: [
      { id: "port-0", name: "Ether1 (WAN)", type: "copper", status: "up", ip: "192.168.88.1", speed: "1000 Mbps" },
      { id: "port-1", name: "Ether2 (LAN)", type: "copper", status: "up", ip: "10.0.2.1", speed: "1000 Mbps", vlan: 10 },
      { id: "port-2", name: "Ether3", type: "copper", status: "down", speed: "1000 Mbps" },
      { id: "port-3", name: "SFP+ 1 (Fiber Core)", type: "fiber", status: "up", ip: "10.10.10.2", speed: "10 Gbps" }
    ],
    2: [
      { id: "port-0", name: "GigabitEthernet1/0/1", type: "copper", status: "up", speed: "1000 Mbps", vlan: 10 },
      { id: "port-1", name: "GigabitEthernet1/0/2", type: "copper", status: "up", speed: "1000 Mbps", vlan: 10 },
      { id: "port-2", name: "GigabitEthernet1/0/3", type: "copper", status: "down", speed: "Auto Negotiate", vlan: 10 },
      { id: "port-3", name: "GigabitEthernet1/0/4", type: "copper", status: "up", speed: "1000 Mbps", vlan: 20 },
      { id: "port-4", name: "SFP+ Uplink 1", type: "fiber", status: "up", speed: "10 Gbps", vlan: 1 },
      { id: "port-5", name: "SFP+ Uplink 2", type: "fiber", status: "down", speed: "10 Gbps" }
    ]
  };

  const ports = devicePorts[selectedDeviceIdx] || [];
  const activePort = ports.find((p) => p.id === activePortId) || ports[0];

  return (
    <div className="bg-[#03070E] border border-white/10 rounded-3xl p-6 space-y-6 relative overflow-hidden shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 to-transparent pointer-events-none" />

      {/* Selector and tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/5 relative z-10">
        <div>
          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center">
            <Server className="w-4 h-4 text-orange-500 mr-1.5" />
            Tactile Hardware Explorer & Port Auditor
          </h3>
          <p className="text-[10px] text-slate-500 mt-0.5">Click physical ports to trigger diagnostics</p>
        </div>

        {/* Device selector */}
        <div className="flex space-x-1.5 bg-[#020408] border border-white/5 p-1 rounded-xl">
          {showCaseDevices.map((d, idx) => (
            <button
              key={d.id}
              onClick={() => {
                setSelectedDeviceIdx(idx);
                setActivePortId("port-0");
              }}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                selectedDeviceIdx === idx
                  ? "bg-orange-600/10 border-orange-500/20 text-orange-400"
                  : "bg-transparent border-transparent text-slate-500 hover:text-white"
              }`}
            >
              {d.type.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Visual representation of physical rear panel of router / switch */}
      <div className="bg-black/60 border border-white/10 rounded-2xl p-5 relative z-10">
        <div className="flex justify-between items-center text-[9px] font-mono text-slate-500 mb-3 uppercase tracking-wider">
          <span>{device.name} — Rear Interface Chassis</span>
          <span className="text-orange-500 font-bold">1U RACK SYSTEM</span>
        </div>

        {/* Chassis layout */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center gap-6 relative shadow-inner">
          <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-slate-800 rounded" />
          <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-slate-800 rounded" />

          {/* Cyber fan exhaust details */}
          <div className="flex flex-col space-y-1 opacity-25 shrink-0">
            <div className="w-6 h-1 bg-slate-700 rounded-full" />
            <div className="w-6 h-1 bg-slate-700 rounded-full" />
            <div className="w-6 h-1 bg-slate-700 rounded-full" />
          </div>

          {/* Core chipset brand label */}
          <div className="text-[10px] font-bold text-slate-500 font-mono tracking-widest uppercase shrink-0 border-r border-white/5 pr-4">
            JSTU NODE
          </div>

          {/* PORTS GRID ROW */}
          <div className="flex-1 flex items-center gap-3">
            {ports.map((p) => {
              const isUp = p.status === "up";
              const isDisabled = p.status === "disabled";
              const isActive = p.id === activePortId;

              return (
                <button
                  key={p.id}
                  onClick={() => setActivePortId(p.id)}
                  className={`relative flex flex-col items-center justify-between p-2.5 w-14 h-14 rounded-lg border-2 transition-all ${
                    isActive
                      ? "bg-orange-600/10 border-orange-500"
                      : "bg-[#03070E] border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* Status tiny LED bulb */}
                  <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
                    isDisabled ? "bg-slate-700" : isUp ? "bg-emerald-400 shadow-md shadow-emerald-400/50 animate-pulse" : "bg-red-400"
                  }`} />

                  {/* Icon representations */}
                  <Cable className={`w-4.5 h-4.5 ${
                    isActive ? "text-orange-400" : isDisabled ? "text-slate-700" : isUp ? "text-slate-400" : "text-red-500/60"
                  }`} />

                  {/* Small sub label */}
                  <span className="text-[7.5px] font-mono font-bold tracking-tight text-slate-500 truncate w-full">
                    {p.name.replace("GigabitEthernet", "G").replace("Ether", "E")}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Power inlet detail */}
          <div className="w-8 h-8 rounded bg-[#03070E] border border-slate-800 flex items-center justify-center shrink-0">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Port telemetry metrics & terminal diagnostics layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 relative z-10">
        {/* Port metadata card */}
        <div className="md:col-span-5 bg-slate-900/60 border border-white/5 rounded-2xl p-4 space-y-4">
          <div className="flex justify-between items-center pb-2.5 border-b border-white/5">
            <span className="text-[10px] font-mono font-bold text-slate-500">PORT SPECIFICATIONS</span>
            <span className={`text-[8.5px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
              activePort.status === "up" ? "bg-emerald-500/10 text-emerald-400" : activePort.status === "disabled" ? "bg-slate-800 text-slate-500" : "bg-red-500/10 text-red-400"
            }`}>
              {activePort.status}
            </span>
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">Interface:</span>
              <span className="text-white font-bold">{activePort.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Type:</span>
              <span className="text-orange-400 font-bold uppercase">{activePort.type}</span>
            </div>
            {activePort.ip && (
              <div className="flex justify-between">
                <span className="text-slate-500">IP Binding:</span>
                <span className="text-white font-bold">{activePort.ip}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Speed Rate:</span>
              <span className="text-white font-bold">{activePort.speed}</span>
            </div>
            {activePort.vlan && (
              <div className="flex justify-between">
                <span className="text-slate-500">Access VLAN:</span>
                <span className="text-amber-400 font-bold">{activePort.vlan}</span>
              </div>
            )}
          </div>
        </div>

        {/* Console terminal configuration simulator */}
        <div className="md:col-span-7 bg-slate-950 border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-white/5 text-[9px] font-mono text-slate-500">
              <span>INTERACTIVE IOS CONFIGURATION SHORTCUT</span>
              <span className="text-emerald-500">TERMINAL ATTACHED</span>
            </div>

            <div className="text-[10px] font-mono text-slate-300 mt-3 space-y-1 leading-normal max-h-[120px] overflow-y-auto">
              <p className="text-slate-500"># Configure port bindings:</p>
              <p className="text-orange-400">JSTU-Core-Router(config)# interface {activePort.name}</p>
              {activePort.status === "disabled" ? (
                <p className="text-slate-400">JSTU-Core-Router(config-if)# shutdown</p>
              ) : (
                <p className="text-slate-400">JSTU-Core-Router(config-if)# no shutdown</p>
              )}
              {activePort.ip ? (
                <p className="text-slate-400">JSTU-Core-Router(config-if)# ip address {activePort.ip} 255.255.255.0</p>
              ) : (
                <p className="text-slate-500">JSTU-Core-Router(config-if)# ip address dhcp</p>
              )}
              {activePort.vlan && (
                <p className="text-slate-400">JSTU-Core-Router(config-if)# switchport access vlan {activePort.vlan}</p>
              )}
              <p className="text-slate-500"># Interface state synchronization completed.</p>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-white/5 mt-3">
            <button
              onClick={() => alert(`Synchronized ${activePort.name} parameters with virtual startup configuration successfully.`)}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] rounded-xl border border-white/10 flex items-center space-x-1.5 transition-all"
            >
              <Settings className="w-3.5 h-3.5 text-orange-500 animate-spin [animation-duration:8s]" />
              <span>Apply Config State</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
