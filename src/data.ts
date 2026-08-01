import { ClubMember, EventItem, NoticeItem, TrainingCourse, NetworkNode, Connection } from "./types";

export const initialMembers: ClubMember[] = [
  {
    id: "JNC-2026-0125",
    name: "Md. Ariful Islam",
    role: "Lead Network Engineer",
    xp: 1450,
    avatar: "ariful",
    status: "Active",
    joinedDate: "15 Jan 2026",
    department: "CSE",
    batch: "2022-23",
    attendance: 85,
    paidMonths: ["January 2026", "February 2026", "March 2026", "April 2026", "May 2026", "June 2026"],
    totalPaid: 1800,
    email: "mdlitonuddin440@gmail.com"
  },
  {
    id: "JNC-2026-0045",
    name: "Sazzad Hossain",
    role: "CCNA Facilitator",
    xp: 1850,
    avatar: "sazzad",
    status: "Active",
    joinedDate: "10 Jan 2026",
    department: "CSE",
    batch: "2021-22",
    attendance: 92,
    paidMonths: ["January 2026", "February 2026", "March 2026", "April 2026", "May 2026", "June 2026"],
    totalPaid: 1800,
    email: "sazzad@jstu.edu"
  },
  {
    id: "JNC-2026-0112",
    name: "Nusrat Jahan",
    role: "Graphics Lead",
    xp: 920,
    avatar: "nusrat",
    status: "Active",
    joinedDate: "20 Jan 2026",
    department: "CSE",
    batch: "2022-23",
    attendance: 78,
    paidMonths: ["January 2026", "February 2026", "March 2026", "April 2026", "May 2026"],
    totalPaid: 1500,
    email: "nusrat@jstu.edu"
  },
  {
    id: "JNC-2026-0089",
    name: "Fahim Ahmed",
    role: "Core Member",
    xp: 500,
    avatar: "fahim",
    status: "Inactive",
    joinedDate: "05 Feb 2026",
    department: "EEE",
    batch: "2022-23",
    attendance: 65,
    paidMonths: ["January 2026", "February 2026"],
    totalPaid: 600,
    email: "fahim@jstu.edu"
  },
  {
    id: "JNC-2026-0142",
    name: "Raihan Kabir",
    role: "Wireless Specialist",
    xp: 1100,
    avatar: "raihan",
    status: "Active",
    joinedDate: "18 Jan 2026",
    department: "CSE",
    batch: "2022-23",
    attendance: 88,
    paidMonths: ["January 2026", "February 2026", "March 2026", "April 2026", "May 2026", "June 2026"],
    totalPaid: 1800,
    email: "raihan@jstu.edu"
  }
];

export const initialEvents: EventItem[] = [
  {
    id: "EVT-001",
    title: "Introduction to Cisco Networking",
    type: "Webinar",
    date: "24 May 2026",
    time: "07:00 PM",
    location: "Online (Google Meet)",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80",
    isRegistered: true
  },
  {
    id: "EVT-002",
    title: "MikroTik Router Configuration",
    type: "Workshop",
    date: "30 May 2026",
    time: "10:00 AM",
    location: "CSE Lab, JSTU",
    image: "https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&w=400&q=80",
    isRegistered: false
  },
  {
    id: "EVT-003",
    title: "Future of Networking & IPv6",
    type: "Seminar",
    date: "05 Jun 2026",
    time: "03:00 PM",
    location: "Seminar Hall, JSTU",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80",
    isRegistered: false
  }
];

export const initialNotices: NoticeItem[] = [
  {
    id: "NTC-001",
    title: "Annual Picnic 2026 Registration is Open!",
    date: "May 18, 2026",
    category: "General"
  },
  {
    id: "NTC-002",
    title: "Next Webinar on \"Network Security Basics\"",
    date: "May 16, 2026",
    category: "Webinar"
  },
  {
    id: "NTC-003",
    title: "Monthly Club Meeting on 20 May 2026",
    date: "May 14, 2026",
    category: "General"
  },
  {
    id: "NTC-004",
    title: "Physical ID Card Distribution on 25 May 2026",
    date: "May 12, 2026",
    category: "Academic"
  },
  {
    id: "NTC-005",
    title: "CCNA Bootcamp Batch 3 Registration Open",
    date: "May 10, 2026",
    category: "Training"
  }
];

export const initialCourses: TrainingCourse[] = [
  {
    id: "CRS-01",
    name: "CCNA Basics",
    progress: 75,
    provider: "Cisco",
    instructor: "Engr. Sazzad Hossain"
  },
  {
    id: "CRS-02",
    name: "MikroTik Essentials",
    progress: 60,
    provider: "MikroTik",
    instructor: "Engr. Md. Ariful Islam"
  },
  {
    id: "CRS-03",
    name: "Linux Networking",
    progress: 40,
    provider: "Linux",
    instructor: "Dr. Al Amin"
  }
];

export const initialNodes: NetworkNode[] = [
  { id: "RT-4331", name: "Cisco Gateway Router", type: "router", ip: "10.0.1.1", status: "online", traffic: 412, uptime: 99.98, alertsCount: 0, x: 25, y: 35 },
  { id: "SW-2960X", name: "Core Switch 2960-X", type: "switch", ip: "10.0.1.2", status: "online", traffic: 345, uptime: 99.99, alertsCount: 0, x: 50, y: 55 },
  { id: "SRV-CCNA", name: "CCNA Packet Tracer Server", type: "server", ip: "10.0.1.10", status: "online", traffic: 280, uptime: 99.95, alertsCount: 0, x: 50, y: 20 },
  { id: "DB-JSTU", name: "Club Members Database", type: "database", ip: "10.0.1.20", status: "warning", traffic: 120, uptime: 99.82, alertsCount: 1, x: 75, y: 55 },
  { id: "FW-FORTI", name: "Fortinet Gatekeeper", type: "firewall", ip: "10.0.1.254", status: "online", traffic: 390, uptime: 99.97, alertsCount: 0, x: 65, y: 75 },
  { id: "PC-STUDENT", name: "Lab Student Terminal", type: "workstation", ip: "10.0.2.12", status: "online", traffic: 45, uptime: 100.0, alertsCount: 0, x: 35, y: 75 }
];

export const initialConnections: Connection[] = [
  { from: "RT-4331", to: "SW-2960X" },
  { from: "SW-2960X", to: "SRV-CCNA" },
  { from: "SW-2960X", to: "DB-JSTU" },
  { from: "SW-2960X", to: "FW-FORTI" },
  { from: "SW-2960X", to: "PC-STUDENT" }
];

export const showCaseDevices = [
  {
    id: "dev-01",
    name: "Cisco Router ISR 4331",
    type: "Router",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=400&q=80",
    description: "Enterprise gateway router supplying robust gigabit performance, hardware acceleration, and integrated security for JSTU Core.",
    ports: "3 GE ports, 2 NIM slots, 1 SM slot",
    throughput: "100 Mbps - 300 Mbps",
  },
  {
    id: "dev-02",
    name: "MikroTik RB4011",
    type: "Router / Switch",
    image: "https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&w=400&q=80",
    description: "Powerful 10xGigabit port router with Quad-core 1.4Ghz CPU, SFP+ 10Gbps cage, and a desktop enclosure with rackmount ears.",
    ports: "10 Gigabit Ethernet ports, 1 SFP+ port",
    throughput: "Up to 9.7 Gbps wirespeed",
  },
  {
    id: "dev-03",
    name: "Cisco Switch 2960-X",
    type: "Switch",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=400&q=80",
    description: "Stackable Gigabit Ethernet switch providing enterprise-class access for campus and branch applications with PoE capability.",
    ports: "24/48 Gigabit Ethernet ports, 4 SFP uplinks",
    throughput: "216 Gbps switching capacity",
  }
];

export const sponsors = [
  { name: "MikroTik", logo: "MikroTik", color: "text-[#024093]" },
  { name: "Cisco", logo: "Cisco", color: "text-[#00BCEB]" },
  { name: "Fortinet", logo: "Fortinet", color: "text-[#C8102E]" },
  { name: "Ubiquiti", logo: "Ubiquiti", color: "text-[#0559C9]" },
  { name: "TP-Link", logo: "TP-Link", color: "text-[#3CC2CC]" }
];
