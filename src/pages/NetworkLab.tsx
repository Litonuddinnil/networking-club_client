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
  Plus,
  Zap,
  BookOpen,
  Calculator,
  ChevronDown,
  Route as RouteIcon,
  Radio,
  Lock,
  Database,
} from "lucide-react";
import { Button } from "../components/ui/button"; 
import { Input } from "../components/ui/input"; 
import { Label } from "../components/ui/label";  
import { cn } from "../lib/utils"; 

/* ------------------------------------------------------------------ *
 * Lab model (Expanded to fully map all PDF Experiments 1 to 13)        *
 * ------------------------------------------------------------------ */

type DeviceKind = "router" | "switch" | "pc" | "server" | "firewall" | "cloud" | "ap" | "hub";

interface Port {
  id: string; // e.g. "Fa0/1", "Gi0/0"
  label: string;
}

interface RouteEntry {
  network: string; // e.g. "192.168.2.0/24"
  nextHop: string; // e.g. "10.10.10.2" or "directly connected"
  iface: string; // e.g. "Se0/0/0"
}

interface LabDevice {
  id: string;
  kind: DeviceKind;
  name: string;
  x: number; // percent-based canvas positioning
  y: number;
  ip: string; 
  mac: string;
  subnetMask?: string;
  gateway?: string;
  ports: Port[];
  arp: { ip: string; mac: string; iface: string }[];
  routes?: RouteEntry[];
  consoleHistory: string[];
}

interface LabConnection {
  from: string;
  fromPort: string;
  to: string;
  toPort: string;
}

interface Lesson {
  id: string;
  tag: string; // e.g. "Experiment No.01"
  title: string;
  focus: string; // short subtitle
  blurb: string;
  hint: string; // terminal placeholder hint
  devices: LabDevice[];
  connections: LabConnection[];
  concepts: { icon: any; title: string; body: string; tone: string }[];
  codeSnippet?: string; // For C++ routing algorithms (Exp 10 & 11)
}

/* ------------------------------------------------------------------ *
 * Exp 01: Peer-to-Peer Network Configuration                         *
 * ------------------------------------------------------------------ */
const EXP1_DEVICES: LabDevice[] = [
  {
    id: "sw-1", kind: "switch", name: "2960-24TT", x: 50, y: 35, ip: "—", mac: "0011.2233.4455",
    ports: [{ id: "Fa0/1", label: "Fa0/1" }, { id: "Fa0/2", label: "Fa0/2" }, { id: "Fa0/3", label: "Fa0/3" }, { id: "Fa0/4", label: "Fa0/4" }],
    arp: [], consoleHistory: ["Switch# L2 frame forwarding based on MAC table"]
  },
  {
    id: "pc-0", kind: "pc", name: "PC0", x: 20, y: 70, ip: "10.0.0.1", mac: "0060.3E1A.0001", subnetMask: "255.0.0.0",
    ports: [{ id: "Fa0", label: "Fa0" }], arp: [{ ip: "10.0.0.2", mac: "0060.3E1A.0002", iface: "Fa0" }],
    consoleHistory: ["PC0> ipconfig", "IPv4 Address: 10.0.0.1", "PC0>"]
  },
  {
    id: "pc-1", kind: "pc", name: "PC1", x: 40, y: 70, ip: "10.0.0.2", mac: "0060.3E1A.0002", subnetMask: "255.0.0.0",
    ports: [{ id: "Fa0", label: "Fa0" }], arp: [{ ip: "10.0.0.1", mac: "0060.3E1A.0001", iface: "Fa0" }],
    consoleHistory: ["PC1> ping 10.0.0.1", "Reply from 10.0.0.1: bytes=32 time<1ms TTL=128", "PC1>"]
  },
  {
    id: "pc-2", kind: "pc", name: "PC2", x: 60, y: 70, ip: "10.0.0.4", mac: "0060.3E1A.0003", subnetMask: "255.0.0.0",
    ports: [{ id: "Fa0", label: "Fa0" }], arp: [], consoleHistory: ["PC2> ipconfig", "IPv4 Address: 10.0.0.4", "PC2>"]
  },
  {
    id: "pc-3", kind: "pc", name: "PC3", x: 80, y: 70, ip: "10.0.0.3", mac: "0060.3E1A.0004", subnetMask: "255.0.0.0",
    ports: [{ id: "Fa0", label: "Fa0" }], arp: [], consoleHistory: ["PC3> ipconfig", "IPv4 Address: 10.0.0.3", "PC3>"]
  }
];
const EXP1_CONNECTIONS: LabConnection[] = [
  { from: "sw-1", fromPort: "Fa0/1", to: "pc-0", toPort: "Fa0" },
  { from: "sw-1", fromPort: "Fa0/2", to: "pc-1", toPort: "Fa0" },
  { from: "sw-1", fromPort: "Fa0/3", to: "pc-2", toPort: "Fa0" },
  { from: "sw-1", fromPort: "Fa0/4", to: "pc-3", toPort: "Fa0" },
];

/* ------------------------------------------------------------------ *
 * Exp 02: LAN Design Using Switch (Switch vs Hub Performance)        *
 * ------------------------------------------------------------------ */
const EXP2_DEVICES: LabDevice[] = [
  {
    id: "sw-perf", kind: "switch", name: "Switch (L2)", x: 30, y: 30, ip: "—", mac: "BB11.2233.4455",
    ports: [{ id: "Fa0/1", label: "Fa0/1" }, { id: "Fa0/2", label: "Fa0/2" }], arp: [],
    consoleHistory: ["Switch# Dedicated bandwidth per port, full-duplex, no collisions."]
  },
  {
    id: "hub-perf", kind: "hub", name: "Hub (L1)", x: 70, y: 30, ip: "—", mac: "CC11.2233.4455",
    ports: [{ id: "F0/1", label: "F0/1" }, { id: "F0/2", label: "F0/2" }], arp: [],
    consoleHistory: ["Hub# Broadcasts to all ports, shared bandwidth, half-duplex collisions possible."]
  },
  { id: "lap-0", kind: "pc", name: "Laptop0", x: 20, y: 65, ip: "10.0.0.1", mac: "00AA.1101", ports: [{ id: "Fa0", label: "Fa0" }], arp: [], consoleHistory: ["Laptop0> ping 10.0.0.4 (Avg = 4ms via Switch)"] },
  { id: "lap-3", kind: "pc", name: "Laptop3", x: 40, y: 65, ip: "10.0.0.4", mac: "00AA.1104", ports: [{ id: "Fa0", label: "Fa0" }], arp: [], consoleHistory: ["Laptop3> Ready"] },
  { id: "lap-4", kind: "pc", name: "Laptop4", x: 60, y: 65, ip: "10.0.0.5", mac: "00AA.1105", ports: [{ id: "Fa0", label: "Fa0" }], arp: [], consoleHistory: ["Laptop4> ping 10.0.0.8 (Avg = 2ms via Hub)"] },
  { id: "lap-7", kind: "pc", name: "Laptop7", x: 80, y: 65, ip: "10.0.0.8", mac: "00AA.1108", ports: [{ id: "Fa0", label: "Fa0" }], arp: [], consoleHistory: ["Laptop7> Ready"] },
];
const EXP2_CONNECTIONS: LabConnection[] = [
  { from: "sw-perf", fromPort: "Fa0/1", to: "lap-0", toPort: "Fa0" },
  { from: "sw-perf", fromPort: "Fa0/2", to: "lap-3", toPort: "Fa0" },
  { from: "hub-perf", fromPort: "F0/1", to: "lap-4", toPort: "Fa0" },
  { from: "hub-perf", fromPort: "F0/2", to: "lap-7", toPort: "Fa0" },
];

/* ------------------------------------------------------------------ *
 * Exp 03: Star Topology Implementation                               *
 * ------------------------------------------------------------------ */
const EXP3_DEVICES: LabDevice[] = [
  { id: "star-sw", kind: "switch", name: "Central Switch", x: 50, y: 40, ip: "—", mac: "DD11.2233.4455", ports: [{ id: "Fa0/1", label: "Fa0/1" }, { id: "Fa0/2", label: "Fa0/2" }, { id: "Fa0/3", label: "Fa0/3" }, { id: "Fa0/4", label: "Fa0/4" }], arp: [], consoleHistory: ["Switch# Star Topology Hub Active."] },
  { id: "st-l8", kind: "pc", name: "Laptop8", x: 20, y: 25, ip: "192.168.1.1", mac: "EE11.0001", ports: [{ id: "Fa0", label: "Fa0" }], arp: [], consoleHistory: ["Laptop8> ipconfig"] },
  { id: "st-pc4", kind: "pc", name: "PC4", x: 80, y: 25, ip: "192.168.1.2", mac: "EE11.0002", ports: [{ id: "Fa0", label: "Fa0" }], arp: [], consoleHistory: ["PC4> ipconfig"] },
  { id: "st-srv", kind: "server", name: "Server1", x: 50, y: 80, ip: "192.168.1.5", mac: "EE11.0005", ports: [{ id: "Gi0", label: "Gi0" }], arp: [], consoleHistory: ["Server1# Central repository active"] },
];
const EXP3_CONNECTIONS: LabConnection[] = [
  { from: "star-sw", fromPort: "Fa0/1", to: "st-l8", toPort: "Fa0" },
  { from: "star-sw", fromPort: "Fa0/2", to: "st-pc4", toPort: "Fa0" },
  { from: "star-sw", fromPort: "Fa0/3", to: "st-srv", toPort: "Gi0" },
];

/* ------------------------------------------------------------------ *
 * Exp 04: DHCP Server Configuration                                  *
 * ------------------------------------------------------------------ */
const EXP4_DEVICES: LabDevice[] = [
  { id: "dhcp-srv2", kind: "server", name: "Server2 (DHCP)", x: 50, y: 15, ip: "10.0.0.1", mac: "AA22.0001", subnetMask: "255.0.0.0", ports: [{ id: "Gi0", label: "Gi0" }], arp: [], consoleHistory: ["Server2# DHCP Pool Active (10.0.0.10 - 10.0.0.50)"] },
  { id: "dhcp-sw", kind: "switch", name: "Switch3", x: 50, y: 45, ip: "—", mac: "BB22.0001", ports: [{ id: "Fa0/1", label: "Fa0/1" }, { id: "Fa0/2", label: "Fa0/2" }, { id: "Fa0/3", label: "Fa0/3" }], arp: [], consoleHistory: ["Switch3# L2 Forwarding"] },
  { id: "pc-6", kind: "pc", name: "PC6", x: 20, y: 75, ip: "0.0.0.0", mac: "CC22.0006", ports: [{ id: "Fa0", label: "Fa0" }], arp: [], consoleHistory: ["PC6> ipconfig /renew (Unassigned -> requests DORA)"] },
  { id: "pc-7", kind: "pc", name: "PC7", x: 50, y: 75, ip: "0.0.0.0", mac: "CC22.0007", ports: [{ id: "Fa0", label: "Fa0" }], arp: [], consoleHistory: ["PC7> ipconfig /renew"] },
  { id: "lap-11", kind: "pc", name: "Laptop11", x: 80, y: 75, ip: "0.0.0.0", mac: "CC22.0011", ports: [{ id: "Fa0", label: "Fa0" }], arp: [], consoleHistory: ["Laptop11> ipconfig /renew"] },
];
const EXP4_CONNECTIONS: LabConnection[] = [
  { from: "dhcp-sw", fromPort: "Fa0/1", to: "dhcp-srv2", toPort: "Gi0" },
  { from: "dhcp-sw", fromPort: "Fa0/2", to: "pc-6", toPort: "Fa0" },
  { from: "dhcp-sw", fromPort: "Fa0/3", to: "pc-7", toPort: "Fa0" },
  { from: "dhcp-sw", fromPort: "Fa0/4", to: "lap-11", toPort: "Fa0" },
];

/* ------------------------------------------------------------------ *
 * Exp 05: Integrated Network Setup (Router + Switch + Server)        *
 * ------------------------------------------------------------------ */
const EXP5_DEVICES: LabDevice[] = [
  { id: "r-1841", kind: "router", name: "Router1841", x: 50, y: 30, ip: "10.0.0.1", mac: "1111.2222.3333", subnetMask: "255.0.0.0", ports: [{ id: "Fa0/0", label: "Fa0/0 (LAN)" }, { id: "Fa0/1", label: "Fa0/1 (Server)" }], arp: [], routes: [{ network: "20.0.0.0/8", nextHop: "directly connected", iface: "Fa0/1" }], consoleHistory: ["Router1841# Routing between 10.0.0.0/8 and 20.0.0.0/8"] },
  { id: "sw-int", kind: "switch", name: "Switch4", x: 30, y: 65, ip: "—", mac: "2222.3333.4444", ports: [{ id: "Fa0/1", label: "Fa0/1" }], arp: [], consoleHistory: ["Switch4# Local LAN segment"] },
  { id: "pc-8", kind: "pc", name: "PC8", x: 15, y: 85, ip: "10.0.0.2", mac: "3333.4444.5558", subnetMask: "255.0.0.0", gateway: "10.0.0.1", ports: [{ id: "Fa0", label: "Fa0" }], arp: [], consoleHistory: ["PC8> ping 20.0.0.2 (via gateway 10.0.0.1)"] },
  { id: "srv-3", kind: "server", name: "Server3", x: 75, y: 65, ip: "20.0.0.2", mac: "4444.5556.6663", subnetMask: "255.0.0.0", gateway: "20.0.0.1", ports: [{ id: "Fa0", label: "Fa0" }], arp: [], consoleHistory: ["Server3# Central Enterprise Server Active"] },
];
const EXP5_CONNECTIONS: LabConnection[] = [
  { from: "r-1841", fromPort: "Fa0/0", to: "sw-int", toPort: "Fa0/1" },
  { from: "sw-int", fromPort: "Fa0/2", to: "pc-8", toPort: "Fa0" },
  { from: "r-1841", fromPort: "Fa0/1", to: "srv-3", toPort: "Fa0" },
];

/* ------------------------------------------------------------------ *
 * Exp 06: Basic Static Routing (Single Router)                       *
 * ------------------------------------------------------------------ */
const EXP6_DEVICES: LabDevice[] = [
  { id: "r-single", kind: "router", name: "Router0", x: 50, y: 30, ip: "192.168.1.1", mac: "AAAA.0000.0001", subnetMask: "255.255.255.0", ports: [{ id: "Fa0/0", label: "Fa0/0" }, { id: "Fa0/1", label: "Fa0/1" }], arp: [], routes: [{ network: "192.168.2.0/24", nextHop: "directly connected", iface: "Fa0/1" }], consoleHistory: ["Router0# ip route 192.168.2.0 255.255.255.0 Fa0/1"] },
  { id: "sw-7", kind: "switch", name: "Switch7", x: 25, y: 65, ip: "—", mac: "A111.1111", ports: [{ id: "Fa0/1", label: "Fa0/1" }], arp: [], consoleHistory: ["Switch7# LAN1"] },
  { id: "sw-8", kind: "switch", name: "Switch8", x: 75, y: 65, ip: "—", mac: "A222.2222", ports: [{ id: "Fa0/1", label: "Fa0/1" }], arp: [], consoleHistory: ["Switch8# LAN2"] },
  { id: "pc-13", kind: "pc", name: "PC13", x: 25, y: 88, ip: "192.168.1.10", mac: "B111.0013", subnetMask: "255.255.255.0", gateway: "192.168.1.1", ports: [{ id: "Fa0", label: "Fa0" }], arp: [], consoleHistory: ["PC13> ping 192.168.2.10"] },
  { id: "pc-14", kind: "pc", name: "PC14", x: 75, y: 88, ip: "192.168.2.10", mac: "B222.0014", subnetMask: "255.255.255.0", gateway: "192.168.2.1", ports: [{ id: "Fa0", label: "Fa0" }], arp: [], consoleHistory: ["PC14> Ready"] },
];
const EXP6_CONNECTIONS: LabConnection[] = [
  { from: "r-single", fromPort: "Fa0/0", to: "sw-7", toPort: "Fa0/1" },
  { from: "sw-7", fromPort: "Fa0/2", to: "pc-13", toPort: "Fa0" },
  { from: "r-single", fromPort: "Fa0/1", to: "sw-8", toPort: "Fa0/1" },
  { from: "sw-8", fromPort: "Fa0/2", to: "pc-14", toPort: "Fa0" },
];

/* ------------------------------------------------------------------ *
 * Exp 07: Static Routing Between Two LANs (Two Routers)              *
 * ------------------------------------------------------------------ */
const EXP7_DEVICES: LabDevice[] = [
  { id: "r1-two", kind: "router", name: "Router1", x: 35, y: 30, ip: "10.0.0.1", mac: "R111.0001", ports: [{ id: "Fa0/0", label: "Fa0/0" }, { id: "Fa0/1", label: "Fa0/1 (Serial 30.0.0.1)" }], arp: [], routes: [{ network: "20.0.0.0/8", nextHop: "30.0.0.2", iface: "Fa0/1" }], consoleHistory: ["Router1# ip route 20.0.0.0 255.0.0.0 30.0.0.2"] },
  { id: "r2-two", kind: "router", name: "Router2", x: 65, y: 30, ip: "20.0.0.1", mac: "R222.0001", ports: [{ id: "Fa0/0", label: "Fa0/0" }, { id: "Fa0/1", label: "Fa0/1 (Serial 30.0.0.2)" }], arp: [], routes: [{ network: "10.0.0.0/8", nextHop: "30.0.0.1", iface: "Fa0/1" }], consoleHistory: ["Router2# ip route 10.0.0.0 255.0.0.0 30.0.0.1"] },
  { id: "pc-9", kind: "pc", name: "PC9", x: 15, y: 75, ip: "10.0.0.2", mac: "P090.0001", subnetMask: "255.0.0.0", gateway: "10.0.0.1", ports: [{ id: "Fa0", label: "Fa0" }], arp: [], consoleHistory: ["PC9> ping 20.0.0.2"] },
  { id: "pc-12", kind: "pc", name: "PC12", x: 85, y: 75, ip: "20.0.0.2", mac: "P120.0002", subnetMask: "255.0.0.0", gateway: "20.0.0.1", ports: [{ id: "Fa0", label: "Fa0" }], arp: [], consoleHistory: ["PC12> Ready"] },
];
const EXP7_CONNECTIONS: LabConnection[] = [
  { from: "r1-two", fromPort: "Fa0/1", to: "r2-two", toPort: "Fa0/1" }, 
  { from: "r1-two", fromPort: "Fa0/0", to: "pc-9", toPort: "Fa0" },
  { from: "r2-two", fromPort: "Fa0/0", to: "pc-12", toPort: "Fa0" },
];

/* ------------------------------------------------------------------ *
 * Exp 08: Multi-Router Static Routing (Three Routers)                *
 * ------------------------------------------------------------------ */
const EXP8_DEVICES: LabDevice[] = [
  { id: "r4", kind: "router", name: "Router4", x: 20, y: 30, ip: "10.0.0.1", mac: "4444.1111", ports: [{ id: "Se0/1/0", label: "Se0/1/0" }], arp: [], routes: [{ network: "20.0.0.0/8", nextHop: "40.0.0.2", iface: "Se0/1/0" }, { network: "30.0.0.0/8", nextHop: "40.0.0.2", iface: "Se0/1/0" }], consoleHistory: ["Router4# Multi-router WAN table ready"] },
  { id: "r5", kind: "router", name: "Router5", x: 50, y: 30, ip: "20.0.0.1", mac: "5555.2222", ports: [{ id: "Se0/1/0", label: "Se0/1/0" }, { id: "Se0/1/1", label: "Se0/1/1" }], arp: [], routes: [{ network: "10.0.0.0/8", nextHop: "40.0.0.1", iface: "Se0/1/0" }, { network: "30.0.0.0/8", nextHop: "50.0.0.2", iface: "Se0/1/1" }], consoleHistory: ["Router5# Core Hub Router"] },
  { id: "r6", kind: "router", name: "Router6", x: 80, y: 30, ip: "30.0.0.1", mac: "6666.3333", ports: [{ id: "Se0/1/0", label: "Se0/1/0" }], arp: [], routes: [{ network: "10.0.0.0/8", nextHop: "50.0.0.1", iface: "Se0/1/0" }, { network: "20.0.0.0/8", nextHop: "50.0.0.1", iface: "Se0/1/0" }], consoleHistory: ["Router6# Branch Router"] },
  { id: "pc-15", kind: "pc", name: "PC15", x: 20, y: 75, ip: "10.0.0.2", mac: "PC15.0001", gateway: "10.0.0.1", ports: [{ id: "Fa0", label: "Fa0" }], arp: [], consoleHistory: ["PC15> ping 30.0.0.2 (Crosses 3 routers)"] },
  { id: "pc-20", kind: "pc", name: "PC20", x: 80, y: 75, ip: "30.0.0.2", mac: "PC20.0002", gateway: "30.0.0.1", ports: [{ id: "Fa0", label: "Fa0" }], arp: [], consoleHistory: ["PC20> Ready"] },
];
const EXP8_CONNECTIONS: LabConnection[] = [
  { from: "r4", fromPort: "Se0/1/0", to: "r5", toPort: "Se0/1/0" }, 
  { from: "r5", fromPort: "Se0/1/1", to: "r6", toPort: "Se0/1/0" }, 
  { from: "r4", fromPort: "Fa0", to: "pc-15", toPort: "Fa0" },
  { from: "r6", fromPort: "Fa0", to: "pc-20", toPort: "Fa0" },
];

/* ------------------------------------------------------------------ *
 * Exp 09: Dynamic Routing - RIP and OSPF                             *
 * ------------------------------------------------------------------ */
const EXP9_DEVICES: LabDevice[] = [
  { id: "r-rip", kind: "router", name: "Router7 (RIP)", x: 30, y: 30, ip: "10.0.0.1", mac: "RIP1.0001", ports: [{ id: "Se0", label: "Se0" }], arp: [], routes: [{ network: "192.168.5.0/24", nextHop: "dynamic", iface: "Se0" }], consoleHistory: ["Router7# router rip", "Router7# network 10.0.0.0", "Router7# updates every 30s"] },
  { id: "r-ospf", kind: "router", name: "Router8 (OSPF)", x: 70, y: 30, ip: "20.0.0.1", mac: "OSPF.0001", ports: [{ id: "Se0", label: "Se0" }], arp: [], routes: [{ network: "192.168.5.0/24", nextHop: "dynamic", iface: "Se0" }], consoleHistory: ["Router8# router ospf 1", "Router8# network 20.0.0.0 0.0.0.255 area 0", "Router8# Dijkstra LSDB converged"] },
  { id: "pc-24", kind: "pc", name: "PC24 (RIP net)", x: 30, y: 75, ip: "10.0.0.10", mac: "PC24.MAC", gateway: "10.0.0.1", ports: [{ id: "Fa0", label: "Fa0" }], arp: [], consoleHistory: ["PC24> traceroute 20.0.0.10"] },
  { id: "pc-36", kind: "pc", name: "PC36 (OSPF net)", x: 70, y: 75, ip: "20.0.0.10", mac: "PC36.MAC", gateway: "20.0.0.1", ports: [{ id: "Fa0", label: "Fa0" }], arp: [], consoleHistory: ["PC36> Ready"] },
];
const EXP9_CONNECTIONS: LabConnection[] = [
  { from: "r-rip", fromPort: "Se0", to: "r-ospf", toPort: "Se0" },
  { from: "r-rip", fromPort: "Fa0", to: "pc-24", toPort: "Fa0" },
  { from: "r-ospf", fromPort: "Fa0", to: "pc-36", toPort: "Fa0" },
];

/* ------------------------------------------------------------------ *
 * Exp 10: Distance Vector Routing Algorithm using C++                *
 * ------------------------------------------------------------------ */
const EXP10_DEVICES: LabDevice[] = [
  { id: "dv-node0", kind: "router", name: "Node 0 (Bellman)", x: 30, y: 40, ip: "127.0.0.1", mac: "DV00.0000", ports: [{ id: "Eth0", label: "Eth0" }], arp: [], consoleHistory: ["Node 0# Executing Bellman-Ford algorithm...", "D(x,y) = min( C(x,v) + D(v,y) )", "Routing table updated across neighbors."] },
  { id: "dv-node1", kind: "router", name: "Node 1 (Neighbor)", x: 70, y: 40, ip: "127.0.0.2", mac: "DV01.0001", ports: [{ id: "Eth0", label: "Eth0" }], arp: [], consoleHistory: ["Node 1# Distance vector table received."] },
];
const EXP10_CONNECTIONS: LabConnection[] = [
  { from: "dv-node0", fromPort: "Eth0", to: "dv-node1", toPort: "Eth0" }
];
const EXP10_CODE = `#include <iostream>
using namespace std;
int main() {
    int n;
    cout << "Enter number of nodes: ";
    cin >> n;
    int cost[10][10], dist[10][10];
    cout << "Enter cost matrix:\\n";
    for(int i = 0; i < n; i++) {
        for(int j = 0; j < n; j++) {
            cin >> cost[i][j];
            dist[i][j] = cost[i][j];
        }
    }
    // Distance Vector Bellman-Ford Algorithm
    for(int k = 0; k < n; k++) {
        for(int i = 0; i < n; i++) {
            for(int j = 0; j < n; j++) {
                if(dist[i][j] > dist[i][k] + dist[k][j]) {
                    dist[i][j] = dist[i][k] + dist[k][j];
                }
            }
        }
    }
    cout << "\\nShortest Distance Matrix:\\n";
    for(int i = 0; i < n; i++) {
        for(int j = 0; j < n; j++) {
            cout << dist[i][j] << "\\t";
        }
        cout << endl;
    }
    return 0;
}`;

/* ------------------------------------------------------------------ *
 * Exp 11: Link State Routing Algorithm using C++                     *
 * ------------------------------------------------------------------ */
const EXP11_DEVICES: LabDevice[] = [
  { id: "ls-node0", kind: "router", name: "Source Node 0", x: 30, y: 40, ip: "192.168.10.1", mac: "LS00.0000", ports: [{ id: "Gi0", label: "Gi0" }], arp: [], consoleHistory: ["Source Node 0# Running Dijkstra's Shortest Path Algorithm...", "Topology Database (LSDB) fully synchronized."] },
  { id: "ls-node1", kind: "router", name: "Target Node 1", x: 70, y: 40, ip: "192.168.10.2", mac: "LS01.0001", ports: [{ id: "Gi0", label: "Gi0" }], arp: [], consoleHistory: ["Target Node 1# Cost computed via min-heap priority queue."] },
];
const EXP11_CONNECTIONS: LabConnection[] = [
  { from: "ls-node0", fromPort: "Gi0", to: "ls-node1", toPort: "Gi0" }
];
const EXP11_CODE = `#include <iostream>
using namespace std;
#define MAX 10
#define INF 9999
int main() {
    int n, cost[MAX][MAX], dist[MAX], visited[MAX] = {0};
    cout << "Enter number of nodes: ";
    cin >> n;
    cout << "Enter cost matrix:\\n";
    for(int i = 0; i < n; i++) {
        for(int j = 0; j < n; j++) {
            cin >> cost[i][j];
        }
    }
    for(int i = 0; i < n; i++) {
        dist[i] = cost[0][i];
    }
    visited[0] = 1;
    // Dijkstra Algorithm Loop
    for(int count = 1; count < n; count++) {
        int min = INF, u;
        for(int i = 0; i < n; i++) {
            if(!visited[i] && dist[i] < min) {
                min = dist[i];
                u = i;
            }
        }
        visited[u] = 1;
        for(int v = 0; v < n; v++) {
            if(!visited[v] && (dist[u] + cost[u][v] < dist[v])) {
                dist[v] = dist[u] + cost[u][v];
            }
        }
    }
    cout << "\\nShortest distances from node 0:\\n";
    for(int i = 0; i < n; i++) {
        cout << "To node " << i << " = " << dist[i] << endl;
    }
    return 0;
}`;

/* ------------------------------------------------------------------ *
 * Exp 12: ARP (Address Resolution Protocol)                          *
 * ------------------------------------------------------------------ */
const EXP12_DEVICES: LabDevice[] = [
  {
    id: "router-0", kind: "router", name: "2911 Router", x: 50, y: 22, ip: "10.0.0.10", mac: "0001.4201.0001", subnetMask: "255.255.255.0",
    ports: [{ id: "Fa0/1", label: "Fa0/1" }, { id: "Fa0/2", label: "Fa0/2" }, { id: "Fa0/3", label: "Fa0/3" }],
    arp: [
      { ip: "10.0.0.4", mac: "0005.5E1A.0001", iface: "Fa0/1" },
      { ip: "10.0.0.1", mac: "0060.3E1A.0002", iface: "Fa0/3" },
      { ip: "10.0.0.2", mac: "000A.41B2.0003", iface: "Fa0/2" }
    ],
    consoleHistory: ["Router# show ip arp", "Internet 10.0.0.4 0005.5E1A.0001 ARPA FastEthernet0/1"]
  },
  {
    id: "pc-42", kind: "pc", name: "PC42", x: 14, y: 55, ip: "10.0.0.4", mac: "0005.5E1A.0001", subnetMask: "255.255.255.0", gateway: "10.0.0.10",
    ports: [{ id: "Fa0", label: "Fa0" }], arp: [{ ip: "10.0.0.10", mac: "0001.4201.0001", iface: "FastEth0" }],
    consoleHistory: ["PC42> ping 10.0.0.1", "Reply from 10.0.0.1: bytes=32 time=12ms TTL=255"]
  },
  {
    id: "pc-45", kind: "pc", name: "PC45", x: 86, y: 55, ip: "10.0.0.1", mac: "0060.3E1A.0002", subnetMask: "255.255.255.0", gateway: "10.0.0.10",
    ports: [{ id: "Fa0", label: "Fa0" }], arp: [{ ip: "10.0.0.4", mac: "0005.5E1A.0001", iface: "FastEth0" }],
    consoleHistory: ["PC45> arp -a", "10.0.0.4 00-05-5E-1A-00-01 dynamic"]
  },
];
const EXP12_CONNECTIONS: LabConnection[] = [
  { from: "router-0", fromPort: "Fa0/1", to: "pc-42", toPort: "Fa0" },
  { from: "router-0", fromPort: "Fa0/3", to: "pc-45", toPort: "Fa0" },
];

/* ------------------------------------------------------------------ *
 * Exp 13: Virtual Private Network (VPN)                              *
 * ------------------------------------------------------------------ */
const EXP13_DEVICES: LabDevice[] = [
  { id: "vpn-r0", kind: "router", name: "Router0 (HQ)", x: 25, y: 35, ip: "10.0.0.1", mac: "VPN0.0001", ports: [{ id: "Se0", label: "Se0 (Encrypted Tunnel)" }], arp: [], consoleHistory: ["Router0# IPsec tunnel active to Branch Office."] },
  { id: "vpn-r3", kind: "router", name: "Router3 (Branch)", x: 75, y: 35, ip: "20.0.0.1", mac: "VPN3.0003", ports: [{ id: "Se0", label: "Se0 (Encrypted Tunnel)" }], arp: [], consoleHistory: ["Router3# Encapsulated ESP packets decrypted successfully."] },
  { id: "pc-vpn0", kind: "pc", name: "PC0 (HQ)", x: 15, y: 75, ip: "10.0.0.1", mac: "PC00.0001", gateway: "10.0.0.1", ports: [{ id: "Fa0", label: "Fa0" }], arp: [], consoleHistory: ["PC0> Secure communication channel active over public internet."] },
  { id: "pc-vpn5", kind: "pc", name: "PC5 (Remote)", x: 85, y: 75, ip: "20.0.0.2", mac: "PC05.0005", gateway: "20.0.0.1", ports: [{ id: "Fa0", label: "Fa0" }], arp: [], consoleHistory: ["PC5> Connected via Virtual Private Network."] },
];
const EXP13_CONNECTIONS: LabConnection[] = [
  { from: "vpn-r0", fromPort: "Se0", to: "vpn-r3", toPort: "Se0" }, 
  { from: "vpn-r0", fromPort: "Fa0", to: "pc-vpn0", toPort: "Fa0" },
  { from: "vpn-r3", fromPort: "Fa0", to: "pc-vpn5", toPort: "Fa0" },
];

/* ------------------------------------------------------------------ *
 * Complete Registry for All 13 Experiments                           *
 * ------------------------------------------------------------------ */
const LESSONS: Lesson[] = [
  {
    id: "exp1", tag: "Experiment No.01", title: "Peer-to-Peer Network Configuration",
    focus: "Decentralized network architecture & static IPs",
    blurb: "Configure 4 PCs via a 2960 switch in a shared network class (10.0.0.0/8) and perform an ICMP Echo ping test.",
    hint: "ping 10.0.0.1 / ipconfig", devices: EXP1_DEVICES, connections: EXP1_CONNECTIONS,
    concepts: [
      { icon: Network, title: "P2P Architecture", body: "Every node acts as both client and server with equal status sharing resources directly.", tone: "from-blue-500/40 to-cyan-500/30" },
      { icon: Zap, title: "Static Addressing", body: "Manual configuration of IP addresses eliminates reliance on a central bootstrap daemon.", tone: "from-purple-500/40 to-fuchsia-500/30" },
      { icon: Monitor, title: "Ping Test", body: "Verifies round-trip latency and physical link integrity using ICMP Echo Request/Reply.", tone: "from-emerald-500/40 to-teal-500/30" }
    ]
  },
  {
    id: "exp2", tag: "Experiment No.02", title: "LAN Design (Switch vs Hub Performance)",
    focus: "Layer 2 Intelligent Switching vs Layer 1 Broadcasting",
    blurb: "Compare performance and collision behaviors between a modern 2960 Switch and an unmanaged Layer 1 Hub.",
    hint: "ping 10.0.0.4", devices: EXP2_DEVICES, connections: EXP2_CONNECTIONS,
    concepts: [
      { icon: Cpu, title: "Switch (Layer 2)", body: "Forwards frames selectively based on MAC address tables, providing dedicated bandwidth.", tone: "from-cyan-500/40 to-blue-500/30" },
      { icon: Radio, title: "Hub (Layer 1)", body: "Repeats signals to all ports indiscriminately, multiplying collision probabilities.", tone: "from-amber-500/40 to-orange-500/30" },
      { icon: Zap, title: "Bandwidth Sharing", body: "Switches enable full-duplex transmission while hubs operate strictly in half-duplex mode.", tone: "from-purple-500/40 to-pink-500/30" }
    ]
  },
  {
    id: "exp3", tag: "Experiment No.03", title: "Star Topology Implementation",
    focus: "Centralized connection layout and fault isolation",
    blurb: "Connect five distinct devices (Laptops, PCs, Server) to a single central 2960 switch hub.",
    hint: "ipconfig", devices: EXP3_DEVICES, connections: EXP3_CONNECTIONS,
    concepts: [
      { icon: Network, title: "Fault Isolation", body: "A severed cable affects only the attached node, leaving the rest of the star operational.", tone: "from-blue-500/40 to-indigo-500/30" },
      { icon: Server, title: "Centralized Resources", body: "Allows seamless scaling and direct client access to centralized enterprise servers.", tone: "from-purple-500/40 to-violet-500/30" },
      { icon: Monitor, title: "Easy Expansion", body: "Adding new nodes only requires an available physical port on the central switch.", tone: "from-cyan-500/40 to-teal-500/30" }
    ]
  },
  {
    id: "exp4", tag: "Experiment No.04", title: "DHCP Server Configuration",
    focus: "Automated IP lease allocation via DORA handshake",
    blurb: "Observe Server2 lease dynamic IPs automatically to client PCs using the Discover, Offer, Request, Acknowledge protocol.",
    hint: "ipconfig /renew", devices: EXP4_DEVICES, connections: EXP4_CONNECTIONS,
    concepts: [
      { icon: Radio, title: "DORA Process", body: "Discover (broadcast), Offer, Request, and Acknowledge complete automatic client lease setup.", tone: "from-emerald-500/40 to-cyan-500/30" },
      { icon: Server, title: "IP Pools", body: "Servers maintain restricted address blocks to prevent manual misconfiguration and overlapping IPs.", tone: "from-blue-500/40 to-purple-500/30" },
      { icon: Zap, title: "Plug-and-Play", body: "Essential for modern networks where manual IP administration becomes entirely impractical.", tone: "from-pink-500/40 to-rose-500/30" }
    ]
  },
  {
    id: "exp5", tag: "Experiment No.05", title: "Integrated Network Setup",
    focus: "Multi-segment enterprise routing with Routers & Switches",
    blurb: "Bridge two isolated subnet environments (10.0.0.0/8 LAN and 20.0.0.0/8 Server segment) using an 1841 Router.",
    hint: "ping 20.0.0.2", devices: EXP5_DEVICES, connections: EXP5_CONNECTIONS,
    concepts: [
      { icon: RouterIcon, title: "Inter-Network Routing", body: "Routers cross subnet boundaries by stripping Layer 2 headers and evaluating Layer 3 headers.", tone: "from-purple-500/40 to-indigo-500/30" },
      { icon: Shield, title: "Default Gateways", body: "Client nodes rely on router interface addresses as their gateway exit point to reach external subnets.", tone: "from-blue-500/40 to-cyan-500/30" },
      { icon: Server, title: "Segment Isolation", body: "Keeps heavy server traffic isolated from general client collision broadcast domains.", tone: "from-emerald-500/40 to-teal-500/30" }
    ]
  },
  {
    id: "exp6", tag: "Experiment No.06", title: "Basic Static Routing (Single Router)",
    focus: "Manual route definition across two connected LAN segments",
    blurb: "Configure an 1841 router with manual ip route statements to enable communication between PC13 and PC14.",
    hint: "show ip route", devices: EXP6_DEVICES, connections: EXP6_CONNECTIONS,
    concepts: [
      { icon: RouteIcon, title: "Static Routing Syntax", body: "Administrators explicitly declare destination network prefixes, masks, and exit interfaces.", tone: "from-purple-500/40 to-pink-500/30" },
      { icon: Network, title: "Directly Connected", body: "Routes directly tied to physical interfaces are automatically entered into the routing table.", tone: "from-cyan-500/40 to-blue-500/30" },
      { icon: Cpu, title: "Deterministic Paths", body: "Provides predictable routing paths with zero control-plane protocol overhead.", tone: "from-emerald-500/40 to-green-500/30" }
    ]
  },
  {
    id: "exp7", tag: "Experiment No.07", title: "Static Routing Between Two LANs",
    focus: "Inter-router WAN links connecting separate branch offices",
    blurb: "Interconnect Router1 and Router2 via a serial point-to-point link (30.0.0.0 network) with custom static route entries.",
    hint: "ping 20.0.0.2", devices: EXP7_DEVICES, connections: EXP7_CONNECTIONS,
    concepts: [
      { icon: RouterIcon, title: "Next-Hop Forwarding", body: "Packets are forwarded across routers by referencing the next-hop IP interface address.", tone: "from-purple-500/40 to-violet-500/30" },
      { icon: Network, title: "WAN Serial Links", body: "High-speed point-to-point serial connections bridge distant network boundaries.", tone: "from-blue-500/40 to-cyan-500/30" },
      { icon: Shield, title: "Bilateral Configuration", body: "Both routers require reciprocal static entries to guarantee full round-trip connectivity.", tone: "from-fuchsia-500/40 to-pink-500/30" }
    ]
  },
  {
    id: "exp8", tag: "Experiment No.08", title: "Multi-Router Static Routing (Three Routers)",
    focus: "Complex multi-hop WAN topology with sequential serial links",
    blurb: "Configure Router4, Router5, and Router6 across 40.x and 50.x serial networks to achieve end-to-end multi-hop packet delivery.",
    hint: "ping 30.0.0.2", devices: EXP8_DEVICES, connections: EXP8_CONNECTIONS,
    concepts: [
      { icon: RouteIcon, title: "Multi-Hop Traversal", body: "Packets traverse multiple intermediate router nodes, decrementing TTL on every hop.", tone: "from-purple-500/40 to-cyan-500/30" },
      { icon: Network, title: "Scalability Limits", body: "Static routing demands explicit maintenance for every new node added to the topology chain.", tone: "from-amber-500/40 to-orange-500/30" },
      { icon: Cpu, title: "Complete Routing Tables", body: "Every router must possess comprehensive knowledge of all unattached remote subnets.", tone: "from-blue-500/40 to-indigo-500/30" }
    ]
  },
  {
    id: "exp9", tag: "Experiment No.09", title: "Dynamic Routing - RIP and OSPF",
    focus: "Comparing distance-vector (RIP) and link-state (OSPF) protocols",
    blurb: "Examine automatic topology discovery using RIP hop-counts versus OSPF Dijkstra link-state cost metrics.",
    hint: "show ip route", devices: EXP9_DEVICES, connections: EXP9_CONNECTIONS,
    concepts: [
      { icon: Radio, title: "RIP Protocol", body: "Distance-vector protocol using hop counts (max 15) with full periodic updates every 30 seconds.", tone: "from-blue-500/40 to-teal-500/30" },
      { icon: Zap, title: "OSPF Protocol", body: "Link-state protocol leveraging Dijkstra's algorithm for fast convergence and bandwidth metrics.", tone: "from-purple-500/40 to-fuchsia-500/30" },
      { icon: Cpu, title: "Area Architecture", body: "OSPF uses wildcard masks and area groupings (e.g., Area 0 backbone) to scale large networks.", tone: "from-emerald-500/40 to-cyan-500/30" }
    ]
  },
  {
    id: "exp10", tag: "Experiment No.10", title: "Distance Vector Routing Algorithm (C++)",
    focus: "Bellman-Ford iterative shortest path calculation",
    blurb: "Analyze C++ implementation modeling distributed routing table updates using matrix cost lookups and Bellman-Ford equations.",
    hint: "Run C++ algorithm simulation", devices: EXP10_DEVICES, connections: EXP10_CONNECTIONS, codeSnippet: EXP10_CODE,
    concepts: [
      { icon: BookOpen, title: "Bellman-Ford Principle", body: "D(x,y) = min( C(x,v) + D(v,y) ); iteratively updates distances through neighbors.", tone: "from-purple-500/40 to-indigo-500/30" },
      { icon: Cpu, title: "Matrix Processing", body: "Takes raw cost matrices as input to compute global pairwise shortest distances.", tone: "from-cyan-500/40 to-blue-500/30" },
      { icon: Shield, title: "Count-to-Infinity", body: "Prone to slow convergence loops when link metrics increase abruptly without dampening.", tone: "from-rose-500/40 to-pink-500/30" }
    ]
  },
  {
    id: "exp11", tag: "Experiment No.11", title: "Link State Routing Algorithm (C++)",
    focus: "Dijkstra's shortest path computation and LSDB flooding",
    blurb: "Examine C++ source implementation of Dijkstra's algorithm building local topology graphs and shortest-path trees.",
    hint: "Run C++ algorithm simulation", devices: EXP11_DEVICES, connections: EXP11_CONNECTIONS, codeSnippet: EXP11_CODE,
    concepts: [
      { icon: BookOpen, title: "Dijkstra's Algorithm", body: "Greedy algorithm computing minimum cost paths from a single source node to all destinations.", tone: "from-emerald-500/40 to-teal-500/30" },
      { icon: Database, title: "Topology Database", body: "Maintains complete network graphs rather than just immediate neighbor summaries.", tone: "from-blue-500/40 to-indigo-500/30" },
      { icon: Zap, title: "Fast Convergence", body: "Eliminates routing loops instantly upon topology changes due to synchronized LSDB states.", tone: "from-purple-500/40 to-fuchsia-500/30" }
    ]
  },
  {
    id: "exp12", tag: "Experiment No.12", title: "ARP (Address Resolution Protocol)",
    focus: "Mapping Layer 3 IP addresses to Layer 2 MAC addresses",
    blurb: "Inspect PC and Router ARP tables after frame delivery to verify dynamic hardware address binding caches.",
    hint: "show ip arp / arp -a", devices: EXP12_DEVICES, connections: EXP12_CONNECTIONS,
    concepts: [
      { icon: Zap, title: "Address Resolution", body: "Translates logical IPv4 addresses into physical 48-bit MAC addresses for local transmission.", tone: "from-purple-500/40 to-fuchsia-500/30" },
      { icon: Radio, title: "ARP Broadcast", body: "Broadcasts 'Who has IP X? Tell me your MAC' across the local segment when cache misses occur.", tone: "from-cyan-500/40 to-blue-500/30" },
      { icon: Monitor, title: "Cache Tables", body: "Stores resolved bindings temporarily to optimize subsequent frame encapsulation speeds.", tone: "from-emerald-500/40 to-teal-500/30" }
    ]
  },
  {
    id: "exp13", tag: "Experiment No.13", title: "Virtual Private Network (VPN)",
    focus: "Encrypted secure tunneling over public unsecured networks",
    blurb: "Study IPsec and secure tunneling architectures enabling branch offices to communicate securely across public internet infrastructure.",
    hint: "ping 20.0.0.2 (Encrypted)", devices: EXP13_DEVICES, connections: EXP13_CONNECTIONS,
    concepts: [
      { icon: Lock, title: "Encrypted Tunnel", body: "Encapsulates entire IP packets inside new outer headers to secure data in transit.", tone: "from-indigo-500/40 to-purple-500/30" },
      { icon: Shield, title: "Data Confidentiality", body: "Protects enterprise resources from interception across unverified public networks.", tone: "from-blue-500/40 to-cyan-500/30" },
      { icon: Network, title: "Remote Access", body: "Enables distributed employees to connect directly to internal private subnets securely.", tone: "from-emerald-500/40 to-teal-500/30" }
    ]
  }
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
 * Device Glyph SVG Renderer                                          *
 * ------------------------------------------------------------------ */
function DeviceGlyph({ kind, x, y, size = 36, selected = false }: { kind: DeviceKind; x: number; y: number; size?: number; selected?: boolean }) {
  const color = PALETTE[kind] || PALETTE.pc;
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
      {kind === "hub" && (
        <>
          <polygon points={`0,${-size * 0.6} ${size * 0.52},${-size * 0.3} ${size * 0.52},${size * 0.3} 0,${size * 0.6} -${size * 0.52},${size * 0.3} -${size * 0.52},${-size * 0.3}`} fill="#11161d" stroke={color.stroke} strokeWidth={1.4} />
          <circle cx={0} cy={0} r={size * 0.18} fill={color.stroke} opacity={0.5} />
        </>
      )}
      {kind !== "router" && kind !== "switch" && kind !== "pc" && kind !== "server" && kind !== "hub" && (
        <circle cx={0} cy={0} r={size * 0.6} fill="#11161d" stroke={color.stroke} strokeWidth={1.4} />
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ *
 * Connection wires + packets animation                               *
 * ------------------------------------------------------------------ */
function LabWire({ from, to, packets }: { from: { x: number; y: number }; to: { x: number; y: number }; packets: { id: string; progress: number; color: string }[] }) {
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
      <path d={path} stroke="rgba(255,255,255,0.12)" strokeWidth={2.2} fill="none" />
      <path d={path} stroke="rgba(124,58,237,0.35)" strokeWidth={1.5} fill="none" strokeDasharray="4 6">
        <animate attributeName="stroke-dashoffset" values="0;-20" dur="1.2s" repeatCount="indefinite" />
      </path>
      {packets.map((p) => {
        const t = Math.max(0, Math.min(1, p.progress));
        const x = (1 - t) * (1 - t) * from.x + 2 * (1 - t) * t * cx + t * t * to.x;
        const y = (1 - t) * (1 - t) * from.y + 2 * (1 - t) * t * cy + t * t * to.y;
        return <circle key={p.id} cx={x} cy={y} r={4.5} fill={p.color} />;
      })}
    </g>
  );
}

/* ------------------------------------------------------------------ *
 * Subnet Calculator Utility Tool                                     *
 * ------------------------------------------------------------------ */
function ipToInt(ip: string) {
  const parts = ip.split(".").map((n) => parseInt(n, 10));
  if (parts.length !== 4 || parts.some((n) => isNaN(n) || n < 0 || n > 255)) return null;
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}
function intToIp(n: number) {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
}
function SubnetCalculator() {
  const [input, setInput] = useState("192.168.1.0/24");
  const result = useMemo(() => {
    const match = input.trim().match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/);
    if (!match) return { error: "Format: 192.168.1.0/24" };
    const ipInt = ipToInt(match[1]);
    const prefix = parseInt(match[2], 10);
    if (ipInt === null || prefix < 0 || prefix > 32) return { error: "Invalid IP or prefix (0-32)" };
    const maskInt = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
    const networkInt = (ipInt & maskInt) >>> 0;
    const broadcastInt = (networkInt | (~maskInt >>> 0)) >>> 0;
    const totalHosts = Math.pow(2, 32 - prefix);
    const usable = prefix >= 31 ? 0 : totalHosts - 2;
    return {
      network: intToIp(networkInt), broadcast: intToIp(broadcastInt),
      mask: intToIp(maskInt), firstHost: usable > 0 ? intToIp(networkInt + 1) : "—",
      lastHost: usable > 0 ? intToIp(broadcastInt - 1) : "—", usable, totalHosts
    };
  }, [input]);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1117]/75 backdrop-blur-xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-500/20 border border-white/10">
          <Calculator className="w-5 h-5 text-cyan-300" />
        </div>
        <div>
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Utility Tool</div>
          <div className="text-lg font-display font-extrabold">Subnet Calculator</div>
        </div>
      </div>
      <Input value={input} onChange={(e) => setInput(e.target.value)} className="bg-black/30 border-white/10 font-mono text-sm" />
      {"error" in result ? (
        <div className="text-xs font-mono text-fuchsia-400">{result.error}</div>
      ) : (
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          {[
            ["Network", result.network], ["Broadcast", result.broadcast],
            ["Subnet mask", result.mask], ["Usable hosts", result.usable.toLocaleString()]
          ].map(([lbl, val]) => (
            <div key={lbl} className="rounded-lg border border-white/10 bg-white/5 p-2">
              <div className="text-muted-foreground text-[10px] uppercase tracking-widest">{lbl}</div>
              <div className="text-cyan-300">{val}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Main Lab Page Component                                            *
 * ------------------------------------------------------------------ */
interface Packet {
  id: string;
  fromId: string;
  toId: string;
  startedAt: number;
  color: string;
}

export default function NetworkLab() {
  const [lessonId, setLessonId] = useState<string>("exp1");
  const lesson = useMemo(() => LESSONS.find((l) => l.id === lessonId)!, [lessonId]);

  const [devices, setDevices] = useState<LabDevice[]>(lesson.devices);
  const [connections, setConnections] = useState<LabConnection[]>(lesson.connections);
  const [selectedId, setSelectedId] = useState<string>(lesson.devices[0].id);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [tick, setTick] = useState(0);
  const [commandInput, setCommandInput] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 1000, h: 600 });
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);

  const loadLesson = (id: string) => {
    const l = LESSONS.find((x) => x.id === id)!;
    setLessonId(id);
    setDevices(l.devices.map((d) => ({ ...d, arp: [...d.arp], routes: d.routes ? [...d.routes] : undefined })));
    setConnections(l.connections);
    setSelectedId(l.devices[0].id);
    setPackets([]);
    
    // Force immediate sizing recalculation on tab change
    setTimeout(() => {
      if (containerRef.current) {
        setContainerSize({
          w: containerRef.current.clientWidth || 1000,
          h: containerRef.current.clientHeight || 600,
        });
      }
    }, 50);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      setContainerSize({
        w: el.clientWidth || 1000,
        h: el.clientHeight || 600,
      });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [lessonId]);

  useEffect(() => {
    let raf: number;
    const loop = () => {
      setTick((t) => t + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    setPackets((prev) => prev.filter((p) => tick - p.startedAt < 200));
  }, [tick]);

  const onPointerDown = (e: React.PointerEvent, id: string) => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dev = devices.find((d) => d.id === id);
    if (!dev) return;
    dragRef.current = { id, offsetX: e.clientX - r.left - (dev.x / 100) * r.width, offsetY: e.clientY - r.top - (dev.y / 100) * r.height };
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
    setDevices((devs) => devs.map((d) => (d.id === dragRef.current!.id ? { ...d, x: Math.max(5, Math.min(95, newX)), y: Math.max(5, Math.min(95, newY)) } : d)));
  };

  const onPointerUp = () => { dragRef.current = null; };

  const getDevice = (id: string) => devices.find((d) => d.id === id)!;

  const findPath = (fromId: string, toId: string): string[] | null => {
    if (fromId === toId) return [fromId];
    const adj = new Map<string, string[]>();
    connections.forEach((c) => {
      if (!adj.has(c.from)) adj.set(c.from, []);
      if (!adj.has(c.to)) adj.set(c.to, []);
      adj.get(c.from)!.push(c.to);
      adj.get(c.to)!.push(c.from);
    });
    const visited = new Set([fromId]);
    const queue: string[][] = [[fromId]];
    while (queue.length) {
      const path = queue.shift()!;
      const last = path[path.length - 1];
      if (last === toId) return path;
      for (const nb of adj.get(last) || []) {
        if (!visited.has(nb)) { visited.add(nb); queue.push([...path, nb]); }
      }
    }
    return null;
  };

  const HOP_DURATION = 65;
  const sendPacket = (fromId: string, toId: string, color: string, startTick?: number) => {
    setPackets((p) => [...p, { id: Math.random().toString(36).slice(2), fromId, toId, startedAt: startTick ?? tick, color }]);
  };

  const sendMultiHop = (path: string[], color: string) => {
    path.slice(0, -1).forEach((id, i) => {
      sendPacket(id, path[i + 1], color, tick + i * HOP_DURATION);
    });
  };

  const pushConsole = (devId: string, line: string) => {
    setDevices((devs) => devs.map((d) => (d.id === devId ? { ...d, consoleHistory: [...d.consoleHistory, line].slice(-50) } : d)));
  };

  const fireCommand = (cmd: string) => {
    const dev = getDevice(selectedId);
    const trimmed = cmd.trim();
    if (!trimmed) return;
    pushConsole(dev.id, `${dev.name}> ${trimmed}`);

    if (trimmed.startsWith("ping")) {
      const target = trimmed.split(/\s+/)[1];
      const targetDev = devices.find((d) => d.ip === target);
      if (!target || !targetDev) {
        pushConsole(dev.id, `Ping request could not find host ${target ?? ""}`);
      } else {
        const path = findPath(dev.id, targetDev.id);
        if (!path) {
          pushConsole(dev.id, "Destination host unreachable.");
        } else {
          sendMultiHop(path, "rgba(6,182,212,0.95)");
          setTimeout(() => {
            pushConsole(dev.id, `Reply from ${target}: bytes=32 time=4ms TTL=128`);
          }, path.length * HOP_DURATION * 16.6);
        }
      }
    } else if (trimmed.includes("ipconfig")) {
      if (lessonId === "exp4" && dev.kind === "pc" && dev.ip === "0.0.0.0") {
        pushConsole(dev.id, "DHCP: DISCOVER -> OFFER (10.0.0.50) -> REQUEST -> ACK");
        setDevices((devs) => devs.map((d) => (d.id === dev.id ? { ...d, ip: "10.0.0.50", subnetMask: "255.0.0.0", gateway: "10.0.0.1" } : d)));
      } else {
        pushConsole(dev.id, `IPv4 Address: ${dev.ip}\nSubnet Mask: ${dev.subnetMask || "255.0.0.0"}\nGateway: ${dev.gateway || "—"}`);
      }
    } else if (trimmed.includes("route")) {
      if (dev.routes) {
        pushConsole(dev.id, "Destination     Gateway         Genmask         Iface");
        dev.routes.forEach((r) => pushConsole(dev.id, `${r.network.padEnd(15)} ${r.nextHop.padEnd(15)} 255.255.255.0  ${r.iface}`));
      } else {
        pushConsole(dev.id, "No routing table entries.");
      }
    } else {
      pushConsole(dev.id, "% Command executed successfully.");
    }
    setCommandInput("");
  };

  const selectedDevice = useMemo(() => getDevice(selectedId), [devices, selectedId]);

  const wiresWithPackets = connections.map((c) => {
    const fromDev = getDevice(c.from);
    const toDev = getDevice(c.to);
    const from = { x: (fromDev.x / 100) * containerSize.w, y: (fromDev.y / 100) * containerSize.h };
    const to = { x: (toDev.x / 100) * containerSize.w, y: (toDev.y / 100) * containerSize.h };
    const packetsOnWire = packets
      .filter((p) => (p.fromId === c.from && p.toId === c.to) || (p.fromId === c.to && p.toId === c.from))
      .map((p) => {
        const progress = (tick - p.startedAt) / HOP_DURATION;
        const dir = p.fromId === c.from ? 1 : -1;
        return { id: p.id, color: p.color, progress: dir === 1 ? progress : 1 - progress };
      })
      .filter((p) => p.progress >= 0 && p.progress <= 1);
    return { from, to, packets: packetsOnWire };
  });

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden">
      {/* Header */}
      <section className="pt-20 pb-6 px-4 sm:px-6 border-b border-white/10 bg-[#0d1117]/50 backdrop-blur-md">
        <div className="sh-container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="eyebrow">▸ Comprehensive Computer Networks Lab (13 Experiments)</span>
              <h1 className="mt-2 font-display text-2xl sm:text-4xl font-extrabold tracking-tight">
                <span className="text-gradient-static">{lesson.tag}: {lesson.title}</span>
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">{lesson.blurb}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => loadLesson(lessonId)} variant="outline" className="rounded-full gap-2 border-white/15 bg-white/5 hover:bg-white/10">
                <RotateCcw className="w-4 h-4" /> Reset Experiment
              </Button>
            </div>
          </div>

          {/* Experiment Navigation Tabs (1 to 13) */}
          <div className="mt-6 flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 border border-white/10 rounded-xl bg-black/40">
            {LESSONS.map((l) => (
              <button
                key={l.id}
                onClick={() => loadLesson(l.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-mono transition",
                  lessonId === l.id
                    ? "bg-gradient-to-r from-purple-500/40 to-cyan-500/30 border border-cyan-400/50 text-foreground font-bold shadow-md"
                    : "border border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                {l.tag.replace("Experiment No.", "Exp")}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Lab Interactive Workspace */}
      <section className="px-4 sm:px-6 py-8">
        <div className="sh-container grid lg:grid-cols-[1fr_440px] gap-6">
          {/* Canvas Topology Window */}
          <motion.div
            key={lessonId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative min-h-[580px] sm:min-h-[700px] rounded-2xl border border-white/10 bg-[#0d1117]/70 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div aria-hidden className="absolute inset-0 pointer-events-none cyber-grid opacity-30" />

            {/* Canvas Header Bar */}
            <div className="relative z-20 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0d1117]/80">
              <span className="text-xs font-mono text-cyan-300 font-semibold uppercase tracking-wider">
                Topology Graph · {lesson.focus}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                Drag nodes to reposition topology
              </span>
            </div>

            {/* SVG Interactive Canvas */}
            <div ref={containerRef} className="relative flex-1 w-full h-[540px]" onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
              <svg viewBox={`0 0 ${containerSize.w} ${containerSize.h}`} className="absolute inset-0 h-full w-full">
                {wiresWithPackets.map((w, i) => (
                  <LabWire key={i} from={w.from} to={w.to} packets={w.packets} />
                ))}

                {devices.map((d) => {
                  const cx = (d.x / 100) * containerSize.w;
                  const cy = (d.y / 100) * containerSize.h;
                  return (
                    <g key={d.id} onPointerDown={(e) => onPointerDown(e, d.id)} onClick={() => setSelectedId(d.id)} style={{ cursor: "grab" }}>
                      <DeviceGlyph kind={d.kind} x={cx} y={cy} selected={selectedId === d.id} />
                      <g transform={`translate(${cx}, ${cy + 36})`}>
                        <rect x={-52} y={0} width={104} height={30} rx={5} fill="#0d1117" stroke={selectedId === d.id ? PALETTE[d.kind]?.stroke || "#06b6d4" : "rgba(255,255,255,0.15)"} strokeWidth={1.2} />
                        <text x={0} y={11} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={10} fill="#f3f4f6" fontWeight="bold">{d.name}</text>
                        <text x={0} y={23} textAnchor="middle" fontFamily="JetBrains Mono, monospace" fontSize={9} fill="#9ca3af">{d.ip}</text>
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* C++ Code Viewer Box (Specifically for Exp 10 & 11) */}
            {lesson.codeSnippet && (
              <div className="border-t border-white/10 bg-black/60 p-4 max-h-52 overflow-y-auto">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">C++ Algorithm Source Code Implementation</span>
                  <span className="text-[10px] font-mono text-muted-foreground">Experiment Code Output</span>
                </div>
                <pre className="text-[11px] font-mono text-muted-foreground bg-black/40 p-3 rounded-lg border border-white/5 overflow-x-auto leading-relaxed">
                  {lesson.codeSnippet}
                </pre>
              </div>
            )}
          </motion.div>

          {/* Right Panel: Device Inspector & Terminal CLI */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-white/10 bg-[#0d1117]/75 backdrop-blur-xl p-4 sm:p-5 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="grid place-items-center w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 border border-white/10">
                  <RouterIcon className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{selectedDevice.kind}</div>
                  <div className="text-lg font-display font-extrabold">{selectedDevice.name}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-[10px] font-mono text-muted-foreground">IP ADDRESS</div>
                  <div className="text-xs font-mono text-cyan-300 font-bold">{selectedDevice.ip}</div>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                  <div className="text-muted-foreground font-mono text-[9px] uppercase tracking-widest">MAC Address</div>
                  <div className="font-mono text-foreground text-[11px]">{selectedDevice.mac}</div>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                  <div className="text-muted-foreground font-mono text-[9px] uppercase tracking-widest">Default Gateway</div>
                  <div className="font-mono text-foreground text-[11px]">{selectedDevice.gateway || "—"}</div>
                </div>
              </div>

              {/* Routing Table Display */}
              {selectedDevice.routes && (
                <div className="rounded-xl border border-white/10 bg-black/40 overflow-hidden">
                  <div className="px-3 py-1.5 border-b border-white/10 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Routing Table</div>
                  <table className="w-full text-[11px] font-mono">
                    <thead className="bg-white/5 text-muted-foreground">
                      <tr><th className="px-2 py-1 text-left">Network</th><th className="px-2 py-1 text-left">Next Hop</th><th className="px-2 py-1 text-left">Iface</th></tr>
                    </thead>
                    <tbody>
                      {selectedDevice.routes.map((r, i) => (
                        <tr key={i} className="border-t border-white/5">
                          <td className="px-2 py-1 text-cyan-300">{r.network}</td>
                          <td className="px-2 py-1">{r.nextHop}</td>
                          <td className="px-2 py-1 text-muted-foreground">{r.iface}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Interactive Terminal CLI */}
              <div className="rounded-xl border border-white/10 bg-black/50 overflow-hidden flex flex-col h-56">
                <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/[0.02]">
                  <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" /> CLI Terminal ({selectedDevice.name})
                  </div>
                  <button onClick={() => setDevices(devs => devs.map(d => d.id === selectedId ? { ...d, consoleHistory: [] } : d))} className="text-[10px] font-mono text-muted-foreground hover:text-foreground">clear</button>
                </div>
                <div className="flex-1 p-3 overflow-y-auto text-[11px] font-mono text-muted-foreground space-y-1">
                  {selectedDevice.consoleHistory.map((line, i) => (
                    <div key={i} className={line.startsWith(selectedDevice.name) ? "text-foreground font-bold" : ""}>{line}</div>
                  ))}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); fireCommand(commandInput); }} className="flex items-center gap-2 px-3 py-2 border-t border-white/10 bg-black/40">
                  <span className="text-fuchsia-400 font-mono text-sm">{">"}</span>
                  <Input value={commandInput} onChange={(e) => setCommandInput(e.target.value)} placeholder={lesson.hint} className="flex-1 bg-transparent border-none shadow-none outline-none text-foreground text-xs font-mono" />
                  <Button type="submit" size="sm" className="rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white border-0 h-7 w-7 p-0 grid place-items-center">
                    <Play className="w-3 h-3" />
                  </Button>
                </form>
              </div>
            </div>

            <div className="text-[10px] font-mono text-muted-foreground pt-2 border-t border-white/10">
              <span className="text-cyan-300">Tip:</span> Click any node on the canvas to inspect its custom CLI terminal or routing tables.
            </div>
          </motion.div>
        </div>
      </section>

      {/* Subnet Calculator & Experiment Concepts Section */}
      <section className="px-4 sm:px-6 pb-16">
        <div className="sh-container grid md:grid-cols-2 gap-6">
          <SubnetCalculator />
          <div className="rounded-2xl border border-white/10 bg-[#0d1117]/75 backdrop-blur-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="grid place-items-center w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-fuchsia-500/20 border border-white/10">
                <BookOpen className="w-5 h-5 text-purple-300" />
              </div>
              <div>
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Theory & Concepts</div>
                <div className="text-lg font-display font-extrabold">{lesson.title}</div>
              </div>
            </div>
            <div className="space-y-3">
              {lesson.concepts.map((c, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02]">
                  <div className={cn("w-8 h-8 rounded-lg grid place-items-center shrink-0 bg-gradient-to-br", c.tone)}>
                    <c.icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-foreground">{c.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{c.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}