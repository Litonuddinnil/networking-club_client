import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Router as RouterIcon,
  Monitor,
  Server,
  Cloud,
  Shield,
  Cpu,
  Network,
  Wifi,
  HardDrive,
  Play,
  RotateCcw,
  Trash2,
  Send,
  Terminal,
  X,
  Plus,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ *
 * Lab model                                                            *
 * ------------------------------------------------------------------ */

type DeviceKind = "router" | "switch" | "pc" | "server" | "firewall" | "cloud" | "ap" | "hub";

interface Port {
  id: string; // e.g. "Fa0/1"
  label: string;
}

interface LabDevice {
  id: string;
  kind: DeviceKind;
  name: string;
  /** icon position in the canvas (percent-based) */
  x: number;
  y: number;
  ip: string;
  mac: string;
  ports: Port[];
  arp: { ip: string; mac: string; iface: string }[];
  consoleHistory: string[];
}

// A canonical starting topology mirroring the screenshot:
// Cisco 2911 router at the center, four PCs around it.
const INITIAL_DEVICES: LabDevice[] = [
  {
    id: "router-0",
    kind: "router",
    name: "2911",
    x: 50,
    y: 22,
    ip: "10.0.0.10",
    mac: "0001.4201.0001",
    ports: [
      { id: "Fa0/1", label: "Fa0/1" },
      { id: "Fa0/2", label: "Fa0/2" },
      { id: "Fa0/3", label: "Fa0/3" },
      { id: "Fa0/4", label: "Fa0/4" },
    ],
    arp: [
      { ip: "10.0.0.4", mac: "0005.5E1A.0001", iface: "Fa0/1" },
      { ip: "10.0.0.1", mac: "0060.3E1A.0002", iface: "Fa0/3" },
      { ip: "10.0.0.2", mac: "000A.41B2.0003", iface: "Fa0/2" },
    ],
    consoleHistory: [
      "Router> enable",
      "Router# show ip arp",
      "Protocol  Address      Age (min)  Hardware Addr   Type   Interface",
      "Internet  10.0.0.4          0   0005.5E1A.0001  ARPA   FastEthernet0/1",
      "Internet  10.0.0.1          0   0060.3E1A.0002  ARPA   FastEthernet0/3",
      "Internet  10.0.0.2          0   000A.41B2.0003  ARPA   FastEthernet0/2",
      "Router#",
    ],
  },
  {
    id: "pc-42",
    kind: "pc",
    name: "PC42",
    x: 14,
    y: 42,
    ip: "10.0.0.4",
    mac: "0005.5E1A.0001",
    ports: [{ id: "Fa0", label: "Fa0" }],
    arp: [
      { ip: "10.0.0.10", mac: "0001.4201.0001", iface: "FastEth0" },
      { ip: "10.0.0.1", mac: "0060.3E1A.0002", iface: "FastEth0" },
    ],
    consoleHistory: [
      "PC42> ping 10.0.0.1",
      "Pinging 10.0.0.1 with 32 bytes of data:",
      "Reply from 10.0.0.1: bytes=32 time=12ms TTL=255",
      "Reply from 10.0.0.1: bytes=32 time=10ms TTL=255",
      "Reply from 10.0.0.1: bytes=32 time=11ms TTL=255",
      "Reply from 10.0.0.1: bytes=32 time=12ms TTL=255",
      "PC42>",
    ],
  },
  {
    id: "pc-44",
    kind: "pc",
    name: "PC44",
    x: 16,
    y: 78,
    ip: "10.0.0.2",
    mac: "000A.41B2.0003",
    ports: [{ id: "Fa0", label: "Fa0" }],
    arp: [
      { ip: "10.0.0.10", mac: "0001.4201.0001", iface: "FastEth0" },
    ],
    consoleHistory: [
      "PC44> arp -a",
      "Interface: 10.0.0.2 --- 0x2",
      "  Internet Address      Physical Address      Type",
      "  10.0.0.10             00-01-42-01-00-01     dynamic",
      "PC44>",
    ],
  },
  {
    id: "pc-45",
    kind: "pc",
    name: "PC45",
    x: 70,
    y: 78,
    ip: "10.0.0.1",
    mac: "0060.3E1A.0002",
    ports: [{ id: "Fa0", label: "Fa0" }],
    arp: [
      { ip: "10.0.0.10", mac: "0001.4201.0001", iface: "FastEth0" },
      { ip: "10.0.0.2", mac: "000A.41B2.0003", iface: "FastEth0" },
    ],
    consoleHistory: [
      "PC45> ping 10.0.0.4",
      "Pinging 10.0.0.4 with 32 bytes of data:",
      "Reply from 10.0.0.4: bytes=32 time=14ms TTL=255",
      "Reply from 10.0.0.4: bytes=32 time=13ms TTL=255",
      "Reply from 10.0.0.4: bytes=32 time=14ms TTL=255",
      "Reply from 10.0.0.4: bytes=32 time=15ms TTL=255",
      "PC45>",
    ],
  },
  {
    id: "pc-pt",
    kind: "pc",
    name: "PC-PT",
    x: 70,
    y: 42,
    ip: "10.0.0.5",
    mac: "00D0.5811.A002",
    ports: [{ id: "Fa0", label: "Fa0" }],
    arp: [],
    consoleHistory: [
      "PC-PT> arp -a",
      "No ARP Entries Found",
      "PC-PT>",
    ],
  },
];

const CONNECTIONS: { from: string; fromPort: string; to: string; toPort: string }[] = [
  { from: "router-0", fromPort: "Fa0/1", to: "pc-42", toPort: "Fa0" },
  { from: "router-0", fromPort: "Fa0/2", to: "pc-44", toPort: "Fa0" },
  { from: "router-0", fromPort: "Fa0/3", to: "pc-45", toPort: "Fa0" },
  { from: "router-0", fromPort: "Fa0/4", to: "pc-pt", toPort: "Fa0" },
];

const PALETTE = {
  router: { stroke: "#7c3aed", glow: "#7c3aed", label: "Router" },
  switch: { stroke: "#3b82f6", glow: "#3b82f6", label: "Switch" },
  pc: { stroke: "#06b6d4", glow: "#06b6d4", label: "PC" },
  server: { stroke: "#22d3ee", glow: "#22d3ee", label: "Server" },
  firewall: { stroke: "#ec4899", glow: "#ec4899", label: "Firewall" },
  cloud: { stroke: "#a78bfa", glow: "#a78bfa", label: "Cloud" },
  ap: { stroke: "#39ff88", glow: "#39ff88", label: "AP" },
  hub: { stroke: "#facc15", glow: "#facc15", label: "Hub" },
};

/* ------------------------------------------------------------------ *
 * Tiny device vector icon (used inside the canvas)                     *
 * ------------------------------------------------------------------ */

function DeviceGlyph({
  kind,
  x,
  y,
  size = 36,
  selected = false,
  packetAnimKey,
}: {
  kind: DeviceKind;
  x: number;
  y: number;
  size?: number;
  selected?: boolean;
  packetAnimKey?: number;
}) {
  const color = PALETTE[kind];
  const glow = selected ? `drop-shadow(0 0 12px ${color.glow})` : `drop-shadow(0 0 6px ${color.glow}66)`;

  return (
    <g transform={`translate(${x}, ${y})`} style={{ filter: glow }}>
      {kind === "router" && (
        <>
          <rect x={-size} y={-size * 0.45} width={size * 2} height={size * 0.9} rx={4} fill="#11161d" stroke={color.stroke} strokeWidth={1.4} />
          <line x1={-size * 0.5} y1={-size * 0.45} x2={-size * 0.5} y2={-size * 0.9} stroke={color.stroke} strokeWidth={1.2} />
          <line x1={size * 0.5} y1={-size * 0.45} x2={size * 0.5} y2={-size * 0.9} stroke={color.stroke} strokeWidth={1.2} />
          {[-0.6, -0.3, 0, 0.3, 0.6].map((dx, i) => (
            <rect key={i} x={-size * 0.7 + dx * size} y={-size * 0.15} width={size * 0.12} height={size * 0.3} fill={color.stroke} opacity={0.7} />
          ))}
          <circle cx={size * 0.6} cy={-size * 0.18} r={2.8} fill={color.stroke}>
            <animate attributeName="opacity" values="0.4;1;0.4" dur="1.6s" repeatCount="indefinite" />
          </circle>
        </>
      )}
      {kind === "switch" && (
        <>
          <rect x={-size * 1.1} y={-size * 0.35} width={size * 2.2} height={size * 0.7} rx={4} fill="#11161d" stroke={color.stroke} strokeWidth={1.4} />
          {Array.from({ length: 8 }).map((_, i) => (
            <rect key={i} x={-size * 0.9 + i * size * 0.22} y={-size * 0.1} width={size * 0.1} height={size * 0.2} fill={color.stroke} opacity={0.7} />
          ))}
        </>
      )}
      {kind === "pc" && (
        <>
          <rect x={-size * 0.6} y={-size * 0.5} width={size * 1.2} height={size * 0.85} rx={3} fill="#11161d" stroke={color.stroke} strokeWidth={1.4} />
          <rect x={-size * 0.45} y={-size * 0.38} width={size * 0.9} height={size * 0.6} fill={color.stroke} opacity={0.18} />
          <rect x={-size * 0.18} y={size * 0.35} width={size * 0.36} height={size * 0.12} fill={color.stroke} opacity={0.7} />
          <line x1={-size * 0.18} y1={size * 0.47} x2={size * 0.18} y2={size * 0.47} stroke={color.stroke} strokeWidth={1.2} />
        </>
      )}
      {kind === "server" && (
        <>
          <rect x={-size * 0.45} y={-size * 0.85} width={size * 0.9} height={size * 1.7} rx={3} fill="#11161d" stroke={color.stroke} strokeWidth={1.4} />
          {Array.from({ length: 5 }).map((_, i) => (
            <rect key={i} x={-size * 0.35} y={-size * 0.7 + i * size * 0.32} width={size * 0.7} height={size * 0.16} fill={color.stroke} opacity={0.55} />
          ))}
        </>
      )}
      {kind === "firewall" && (
        <>
          <path
            d={`M0 -${size * 0.85} L${size * 0.7} -${size * 0.4} L${size * 0.7} ${size * 0.4} L0 ${size * 0.85} L-${size * 0.7} ${size * 0.4} L-${size * 0.7} -${size * 0.4} Z`}
            fill="#11161d"
            stroke={color.stroke}
            strokeWidth={1.4}
          />
          <circle cx={0} cy={0} r={size * 0.22} fill="none" stroke={color.stroke} strokeWidth={1.2} />
          <line x1={0} y1={-size * 0.22} x2={0} y2={size * 0.22} stroke={color.stroke} strokeWidth={1.2} />
          <line x1={-size * 0.22} y1={0} x2={size * 0.22} y2={0} stroke={color.stroke} strokeWidth={1.2} />
        </>
      )}
      {kind === "cloud" && (
        <>
          <path
            d={`M-${size * 0.6} ${size * 0.2} a${size * 0.4} ${size * 0.4} 0 0 1 0 -${size * 0.5} a${size * 0.5} ${size * 0.5} 0 0 1 ${size * 0.7} -${size * 0.3} a${size * 0.35} ${size * 0.35} 0 0 1 ${size * 0.5} ${size * 0.5} z`}
            fill="#11161d"
            stroke={color.stroke}
            strokeWidth={1.4}
          />
        </>
      )}
      {kind === "ap" && (
        <>
          <ellipse cx={0} cy={0} rx={size * 0.7} ry={size * 0.22} fill="#11161d" stroke={color.stroke} strokeWidth={1.4} />
          <path d={`M-${size * 0.7} -${size * 0.2} q0 -${size * 0.5} ${size * 0.7} -${size * 0.5}`} fill="none" stroke={color.stroke} strokeWidth={1.2} />
          <path d={`M-${size * 0.5} -${size * 0.25} q0 -${size * 0.3} ${size * 0.5} -${size * 0.3}`} fill="none" stroke={color.stroke} strokeWidth={1.2} />
        </>
      )}
      {kind === "hub" && (
        <>
          <polygon
            points={`0,${-size * 0.6} ${size * 0.52},${-size * 0.3} ${size * 0.52},${size * 0.3} 0,${size * 0.6} -${size * 0.52},${size * 0.3} -${size * 0.52},${-size * 0.3}`}
            fill="#11161d"
            stroke={color.stroke}
            strokeWidth={1.4}
          />
          <circle cx={0} cy={0} r={size * 0.18} fill={color.stroke} opacity={0.5} />
        </>
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ *
 * Connection wires + animated packets                                  *
 * ------------------------------------------------------------------ */

function LabWire({
  from,
  to,
  packets,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  packets: { id: string; progress: number; color: string }[];
}) {
  // Use a slight curve via quadratic Bezier (offset midpoint)
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy);
  const curveOffset = Math.min(40, dist * 0.12);
  const cx = midX;
  const cy = midY - curveOffset;

  const path = `M ${from.x} ${from.y} Q ${cx} ${cy} ${to.x} ${to.y}`;

  return (
    <g>
      <path d={path} stroke="rgba(255,255,255,0.10)" strokeWidth={2} fill="none" />
      <path d={path} stroke="rgba(124,58,237,0.32)" strokeWidth={1.4} fill="none" strokeDasharray="4 6">
        <animate attributeName="stroke-dashoffset" values="0;-20" dur="1.2s" repeatCount="indefinite" />
      </path>
      {packets.map((p) => {
        const t = p.progress;
        const x = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * cx + t * t * to.x;
        const y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * cy + t * t * to.y;
        return (
          <circle key={p.id} cx={x} cy={y} r={4} fill={p.color}>
            <animate attributeName="r" values="3;5;3" dur="0.6s" repeatCount="indefinite" />
          </circle>
        );
      })}
    </g>
  );
}

/* ------------------------------------------------------------------ *
 * Main page                                                            *
 * ------------------------------------------------------------------ */

interface Packet {
  id: string;
  fromId: string;
  toId: string;
  startedAt: number;
  color: string;
  kind: "ping" | "arp" | "broadcast";
  sourceIp: string;
  targetIp: string;
}

export default function NetworkLab() {
  const [devices, setDevices] = useState<LabDevice[]>(INITIAL_DEVICES);
  const [selectedId, setSelectedId] = useState<string>("router-0");
  const [packets, setPackets] = useState<Packet[]>([]);
  const [tick, setTick] = useState(0);
  const [commandInput, setCommandInput] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 1000, h: 600 });

  // Drag state
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  // Resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      setContainerSize({ w: r.width, h: r.height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Animation tick (drives packet motion)
  useEffect(() => {
    let raf: number;
    const loop = () => {
      setTick((t) => t + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Prune finished packets
  useEffect(() => {
    setPackets((prev) => prev.filter((p) => tick - p.startedAt < 90));
  }, [tick]);

  // Pointer drag handlers
  const onPointerDown = (e: React.PointerEvent, id: string) => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dev = devices.find((d) => d.id === id);
    if (!dev) return;
    const px = (dev.x / 100) * r.width;
    const py = (dev.y / 100) * r.height;
    dragRef.current = {
      id,
      offsetX: e.clientX - r.left - px,
      offsetY: e.clientY - r.top - py,
    };
    (e.target as Element).setPointerCapture(e.pointerId);
    setSelectedId(id);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const newX = ((e.clientX - r.left - dragRef.current.offsetX) / r.width) * 100;
    const newY = ((e.clientY - r.top - dragRef.current.offsetY) / r.height) * 100;
    setDevices((devs) =>
      devs.map((d) =>
        d.id === dragRef.current!.id
          ? { ...d, x: Math.max(4, Math.min(96, newX)), y: Math.max(4, Math.min(96, newY)) }
          : d
      )
    );
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  const getDevice = (id: string) => devices.find((d) => d.id === id)!;

  const fireCommand = (cmd: string) => {
    const dev = getDevice(selectedId);
    const trimmed = cmd.trim();
    if (!trimmed) return;

    if (dev.kind === "router") {
      if (trimmed.startsWith("ping")) {
        const target = trimmed.split(/\s+/)[1] || "10.0.0.1";
        const targetDev = devices.find((d) => d.ip === target);
        if (targetDev) {
          sendPacket(dev.id, targetDev.id, "ping", dev.ip, target, "rgba(6,182,212,0.95)");
        } else {
          pushConsole(dev.id, `Ping request could not find host ${target}`);
        }
      } else if (trimmed.includes("arp")) {
        pushConsole(dev.id, "show ip arp");
        dev.arp.forEach((entry) => {
          pushConsole(dev.id, `Internet  ${entry.ip.padEnd(14)} ${entry.mac}  ARPA   ${entry.iface}`);
        });
      }
    } else {
      // PC
      if (trimmed.startsWith("ping")) {
        const target = trimmed.split(/\s+/)[1] || "10.0.0.1";
        const targetDev = devices.find((d) => d.ip === target);
        if (targetDev) {
          // Does this PC have an ARP entry? If not, broadcast first.
          const hasEntry = dev.arp.find((a) => a.ip === "10.0.0.10");
          if (!hasEntry) {
            sendPacket(dev.id, "router-0", "broadcast", dev.ip, "10.0.0.10", "rgba(236,72,153,0.95)");
            setTimeout(() => {
              pushConsole(dev.id, `ARP request: who has 10.0.0.10? Tell ${dev.ip}`);
              pushConsole(dev.id, `Reply from 10.0.0.10: MAC=0001.4201.0001`);
              updateArp(dev.id, "10.0.0.10", "0001.4201.0001", "FastEth0");
            }, 800);
          }
          sendPacket(dev.id, targetDev.id, "ping", dev.ip, target, "rgba(6,182,212,0.95)");
        } else {
          pushConsole(dev.id, `Ping request could not find host ${target}`);
        }
      } else if (trimmed.includes("arp")) {
        pushConsole(dev.id, "arp -a");
        if (dev.arp.length === 0) {
          pushConsole(dev.id, "No ARP Entries Found");
        } else {
          dev.arp.forEach((entry) =>
            pushConsole(dev.id, `  ${entry.ip.padEnd(18)} ${entry.mac}     dynamic`)
          );
        }
      }
    }

    pushConsole(dev.id, trimmed);
    setCommandInput("");
  };

  const sendPacket = (
    fromId: string,
    toId: string,
    kind: Packet["kind"],
    sourceIp: string,
    targetIp: string,
    color: string
  ) => {
    setPackets((p) => [
      ...p,
      {
        id: Math.random().toString(36).slice(2),
        fromId,
        toId,
        startedAt: tick,
        kind,
        color,
        sourceIp,
        targetIp,
      },
    ]);
  };

  const updateArp = (devId: string, ip: string, mac: string, iface: string) => {
    setDevices((devs) =>
      devs.map((d) =>
        d.id === devId
          ? {
              ...d,
              arp: d.arp.find((a) => a.ip === ip)
                ? d.arp.map((a) => (a.ip === ip ? { ...a, mac, iface } : a))
                : [...d.arp, { ip, mac, iface }],
            }
          : d
      )
    );
  };

  const pushConsole = (devId: string, line: string) => {
    setDevices((devs) =>
      devs.map((d) =>
        d.id === devId ? { ...d, consoleHistory: [...d.consoleHistory, line].slice(-40) } : d
      )
    );
  };

  const clearArp = () => {
    setDevices((devs) => devs.map((d) => (d.id === selectedId ? { ...d, arp: [] } : d)));
    pushConsole(selectedId, "arp table cleared");
  };

  const clearConsole = () => {
    setDevices((devs) => devs.map((d) => (d.id === selectedId ? { ...d, consoleHistory: [] } : d)));
  };

  const broadcastPing = () => {
    const dev = getDevice(selectedId);
    devices.forEach((d) => {
      if (d.id !== dev.id) {
        sendPacket(dev.id, d.id, "broadcast", dev.ip, "255.255.255.255", "rgba(236,72,153,0.85)");
      }
    });
    pushConsole(dev.id, `broadcast ping from ${dev.ip}`);
  };

  const reset = () => {
    setDevices(INITIAL_DEVICES);
    setPackets([]);
    setSelectedId("router-0");
    setTick(0);
  };

  const selectedDevice = useMemo(() => getDevice(selectedId), [devices, selectedId]);

  // Compute packet motion keyframes per wire
  const wiresWithPackets = CONNECTIONS.map((c) => {
    const fromDev = getDevice(c.from);
    const toDev = getDevice(c.to);
    const from = {
      x: (fromDev.x / 100) * containerSize.w,
      y: (fromDev.y / 100) * containerSize.h,
    };
    const to = {
      x: (toDev.x / 100) * containerSize.w,
      y: (toDev.y / 100) * containerSize.h,
    };
    const packetsOnWire = packets
      .filter((p) => (p.fromId === c.from && p.toId === c.to) || (p.fromId === c.to && p.toId === c.from))
      .map((p) => {
        const elapsed = tick - p.startedAt;
        const progress = Math.min(1, elapsed / 90);
        const dir = p.fromId === c.from ? 1 : -1;
        return {
          id: p.id,
          color: p.color,
          progress: dir === 1 ? progress : 1 - progress,
        };
      });
    return { from, to, packets: packetsOnWire };
  });

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      {/* Header */}
      <section className="relative pt-24 pb-6 px-4 sm:px-6">
        <div className="sh-container">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <span className="eyebrow">▸ Packet Tracer · Lab</span>
              <h1 className="mt-3 font-display text-3xl sm:text-5xl font-extrabold tracking-tight">
                <span className="text-gradient-static">Network Lab</span>
                <span className="text-muted-foreground"> — ARP & Connectivity</span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                Experiment No.12 <span className="text-foreground">(ARP)</span>. Drag any device to
                reposition, click a device to inspect its ARP table and send{" "}
                <span className="text-cyan-400 font-mono">ping</span> packets along the wires.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={broadcastPing} className="rounded-full gap-2 bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white shadow-lg shadow-fuchsia-500/30 hover:scale-105 transition">
                <Send className="w-4 h-4" /> Broadcast Ping
              </Button>
              <Button onClick={reset} variant="outline" className="rounded-full gap-2 border-white/15 bg-white/5 hover:bg-white/10">
                <RotateCcw className="w-4 h-4" /> Reset
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Lab canvas */}
      <section className="px-4 sm:px-6 pb-10">
        <div className="sh-container grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Canvas */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative min-h-[460px] sm:min-h-[580px] rounded-2xl border border-white/10 bg-[#0d1117]/60 backdrop-blur-xl shadow-2xl shadow-purple-500/10 overflow-hidden"
          >
            {/* Aurora wash */}
            <div aria-hidden className="absolute inset-0 pointer-events-none opacity-60 aurora-bg" />
            {/* Grid */}
            <div aria-hidden className="absolute inset-0 pointer-events-none cyber-grid opacity-50" />

            {/* Toolbar */}
            <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-[#0d1117]/70 backdrop-blur-md px-3 py-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mr-2">Topology</span>
              {[
                { kind: "router", label: "Router" },
                { kind: "switch", label: "Switch" },
                { kind: "pc", label: "PC" },
                { kind: "server", label: "Server" },
                { kind: "firewall", label: "Firewall" },
                { kind: "hub", label: "Hub" },
                { kind: "ap", label: "AP" },
                { kind: "cloud", label: "Cloud" },
              ].map((d) => (
                <button
                  key={d.kind}
                  onClick={() => {
                    // Add a new device at a random position
                    const id = `${d.kind}-${Math.random().toString(36).slice(2, 6)}`;
                    const newDev: LabDevice = {
                      id,
                      kind: d.kind as DeviceKind,
                      name: `${d.label.toUpperCase()}-${id.slice(-3).toUpperCase()}`,
                      x: 50 + (Math.random() - 0.5) * 30,
                      y: 50 + (Math.random() - 0.5) * 30,
                      ip: `10.0.0.${100 + Math.floor(Math.random() * 100)}`,
                      mac: `0000.${Math.random().toString(16).slice(2, 6).toUpperCase()}.${Math.random().toString(16).slice(2, 6).toUpperCase()}`,
                      ports: [{ id: "Fa0", label: "Fa0" }],
                      arp: [],
                      consoleHistory: [],
                    };
                    setDevices((devs) => [...devs, newDev]);
                    setSelectedId(id);
                  }}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono uppercase tracking-wider text-muted-foreground hover:bg-white/10 hover:text-foreground transition"
                >
                  <Plus className="w-3 h-3" /> {d.label}
                </button>
              ))}
              <span className="ml-auto text-[10px] font-mono text-muted-foreground">
                Experiment No.12 (ARP) · dev-portfolio
              </span>
            </div>

            {/* Lab */}
            <div
              ref={containerRef}
              className="relative w-full h-[500px] sm:h-[640px]"
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerLeave={onPointerUp}
            >
              <svg
                viewBox={`0 0 ${containerSize.w} ${containerSize.h}`}
                className="absolute inset-0 h-full w-full"
                style={{ minHeight: 0 }}
              >
                {/* Wires */}
                {wiresWithPackets.map((w, i) => (
                  <LabWire key={i} from={w.from} to={w.to} packets={w.packets} />
                ))}

                {/* Devices */}
                {devices.map((d) => {
                  const cx = (d.x / 100) * containerSize.w;
                  const cy = (d.y / 100) * containerSize.h;
                  return (
                    <g
                      key={d.id}
                      onPointerDown={(e) => onPointerDown(e, d.id)}
                      onClick={() => setSelectedId(d.id)}
                      style={{ cursor: "grab" }}
                    >
                      <DeviceGlyph kind={d.kind} x={cx} y={cy} selected={selectedId === d.id} />
                      {/* Label */}
                      <g transform={`translate(${cx}, ${cy + 38})`}>
                        <rect x={-52} y={0} width={104} height={32} rx={6} fill="#0d1117" stroke={selectedId === d.id ? PALETTE[d.kind].stroke : "rgba(255,255,255,0.10)"} strokeWidth={1.2} />
                        <text x={0} y={12} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={10} fill="#f3f4f6">
                          {d.name}
                        </text>
                        <text x={0} y={25} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={9} fill="#9ca3af">
                          {d.ip}
                        </text>
                      </g>
                      {/* Port labels (router only) */}
                      {d.kind === "router" && (
                        <g>
                          {d.ports.map((p, idx) => {
                            const angle = (Math.PI / 5) * (idx + 1); // pseudo positions
                            const ox = cx + Math.cos(angle + Math.PI) * 90;
                            const oy = cy + Math.sin(angle + Math.PI) * 60;
                            return (
                              <g key={p.id} transform={`translate(${ox}, ${oy})`}>
                                <rect x={-16} y={-8} width={32} height={16} rx={3} fill="#0d1117" stroke="rgba(255,255,255,0.20)" strokeWidth={1} />
                                <text x={0} y={3} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={9} fill="#c4b5fd">
                                  {p.label}
                                </text>
                              </g>
                            );
                          })}
                        </g>
                      )}
                      {d.kind === "pc" && (
                        <g transform={`translate(${cx + 24}, ${cy - 24})`}>
                          <rect x={-12} y={-7} width={24} height={14} rx={3} fill="#0d1117" stroke="rgba(255,255,255,0.20)" strokeWidth={1} />
                          <text x={0} y={3} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={8} fill="#67e8f9">
                            {d.ports[0].label}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Floating notebook legend */}
              <div className="absolute bottom-4 left-4 z-20 rounded-xl border border-white/10 bg-[#0d1117]/80 backdrop-blur-md px-3 py-2 text-[10px] font-mono text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.7)]" />
                  <span>ICMP ping</span>
                  <span className="w-2 h-2 rounded-full bg-fuchsia-400 ml-3 shadow-[0_0_8px_rgba(236,72,153,0.7)]" />
                  <span>ARP / broadcast</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right panel: device inspector */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
            className="min-h-0 sm:min-h-[580px] rounded-2xl border border-white/10 bg-[#0d1117]/60 backdrop-blur-xl shadow-2xl shadow-cyan-500/10 p-4 sm:p-5 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="grid place-items-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10">
                {selectedDevice.kind === "router" && <RouterIcon className="w-6 h-6 text-purple-400" />}
                {selectedDevice.kind === "pc" && <Monitor className="w-6 h-6 text-cyan-400" />}
                {selectedDevice.kind === "server" && <Server className="w-6 h-6 text-cyan-400" />}
                {selectedDevice.kind === "firewall" && <Shield className="w-6 h-6 text-fuchsia-400" />}
                {selectedDevice.kind === "cloud" && <Cloud className="w-6 h-6 text-purple-400" />}
                {selectedDevice.kind === "ap" && <Wifi className="w-6 h-6 text-emerald-400" />}
                {selectedDevice.kind === "switch" && <Network className="w-6 h-6 text-blue-400" />}
                {selectedDevice.kind === "hub" && <HardDrive className="w-6 h-6 text-yellow-400" />}
              </div>
              <div>
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
                  {selectedDevice.kind}
                </div>
                <div className="text-xl font-display font-extrabold">{selectedDevice.name}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-xs font-mono text-muted-foreground">IP</div>
                <div className="text-sm font-mono text-cyan-300">{selectedDevice.ip}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                <div className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest">MAC</div>
                <div className="font-mono text-foreground">{selectedDevice.mac}</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                <div className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest">Ports</div>
                <div className="font-mono text-foreground">{selectedDevice.ports.map((p) => p.id).join(", ")}</div>
              </div>
            </div>

            {/* ARP table */}
            <div className="rounded-xl border border-white/10 bg-black/30 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  ARP Table for {selectedDevice.name}
                </div>
                <button
                  onClick={clearArp}
                  className="text-[10px] font-mono text-fuchsia-400 hover:text-fuchsia-300 inline-flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> clear
                </button>
              </div>
              <table className="w-full text-[11px] font-mono">
                <thead className="bg-white/[0.04] text-muted-foreground">
                  <tr>
                    <th className="px-3 py-1.5 text-left">IP Address</th>
                    <th className="px-3 py-1.5 text-left">Hardware Address</th>
                    <th className="px-3 py-1.5 text-left">Interface</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDevice.arp.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-3 py-3 text-muted-foreground text-center italic">
                        No ARP entries found
                      </td>
                    </tr>
                  ) : (
                    selectedDevice.arp.map((a, i) => (
                      <tr key={i} className="border-t border-white/5">
                        <td className="px-3 py-1.5 text-cyan-300">{a.ip}</td>
                        <td className="px-3 py-1.5 text-foreground">{a.mac}</td>
                        <td className="px-3 py-1.5 text-muted-foreground">{a.iface}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Console */}
            <div className="rounded-xl border border-white/10 bg-black/40 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  <Terminal className="w-3 h-3" /> Console
                </div>
                <button
                  onClick={clearConsole}
                  className="text-[10px] font-mono text-muted-foreground hover:text-foreground"
                >
                  clear
                </button>
              </div>
              <div className="px-3 py-2 max-h-40 overflow-y-auto text-[11px] font-mono text-muted-foreground space-y-0.5">
                {selectedDevice.consoleHistory.length === 0 ? (
                  <div className="italic">No console output yet…</div>
                ) : (
                  selectedDevice.consoleHistory.map((line, i) => (
                    <div key={i} className={line.startsWith("Router#") || line.startsWith("PC") ? "text-foreground" : ""}>
                      {line}
                    </div>
                  ))
                )}
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  fireCommand(commandInput);
                }}
                className="flex items-center gap-2 px-3 py-2 border-t border-white/10"
              >
                <span className="text-fuchsia-400 font-mono text-sm">{">"}</span>
                <Input
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  placeholder={
                    selectedDevice.kind === "router"
                      ? "ping 10.0.0.1 / show ip arp"
                      : "ping 10.0.0.1 / arp -a"
                  }
                  className="flex-1 bg-transparent border-none shadow-none outline-none text-foreground placeholder:text-muted-foreground/60 text-sm font-mono"
                />
                <Button type="submit" size="sm" className="rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-0">
                  <Play className="w-3.5 h-3.5" />
                </Button>
              </form>
            </div>

            <div className="text-[10px] font-mono text-muted-foreground">
              <span className="text-cyan-300">tip</span>: click any device on the canvas to inspect.
            </div>
          </motion.div>
        </div>
      </section>

      {/* Beginner's lab notes */}
      <section className="px-4 sm:px-6 pb-24">
        <div className="sh-container grid md:grid-cols-3 gap-4">
          {[
            {
              icon: Zap,
              title: "What is ARP?",
              body: "Address Resolution Protocol maps a Layer-3 IP address to a Layer-2 MAC address on a local network. Watch the ARP table fill as you ping a fresh device.",
              tone: "from-purple-500/40 to-fuchsia-500/30",
            },
            {
              icon: Cpu,
              title: "Ping vs Broadcast",
              body: "Ping is a 1-to-1 ICMP echo. Press Broadcast Ping to fan a packet out to every connected device at once — every wire lights up.",
              tone: "from-cyan-500/40 to-blue-500/30",
            },
            {
              icon: Network,
              title: "Topology Editor",
              body: "Drag any device to reposition it. Add new gear from the topology toolbar above — the new device is added to the same bus so you can ping it from the router.",
              tone: "from-pink-500/40 to-purple-500/30",
            },
          ].map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-5 hover-lift"
            >
              <div className={cn("w-10 h-10 rounded-xl grid place-items-center bg-gradient-to-br", c.tone)}>
                <c.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="mt-3 font-display font-bold text-lg">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
