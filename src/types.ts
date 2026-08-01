export interface ClubMember {
  id?: string;
  memberId?: string;
  name: string;
  role: string;
  xp: number;
  avatar?: string;
  status: "Active" | "Inactive" | "pending" | "approved";
  joinedDate: string;
  department: string;
  batch?: string;
  attendance: number;
  paidMonths: string[];
  totalPaid: number;
  email: string;
  studentId?: string;
  photoURL?: string;
}

export interface NoticeItem {
  id: string;
  title: string;
  date: string;
  category?: string;
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  location: string;
  isRegistered?: boolean;
  description?: string;
  image?: string;
  type?: string;
  time?: string;
}

export interface TrainingCourse {
  id: string;
  title?: string;
  name?: string;
  level?: string;
  duration?: string;
  description?: string;
  instructor?: string;
  thumbnail?: string;
  progress?: number;
  provider?: string;
}

export interface PaymentRecord {
  id: string;
  memberId?: string;
  amount: number;
  month: string;
  date?: string;
  status: "paid" | "pending" | "failed" | "Paid" | "Pending" | "Failed";
  method?: string;
  paymentDate?: string;
  transactionId?: string;
}

export interface NetworkNode {
  id: string;
  name: string;
  type: string;
  status: "online" | "offline" | "warning";
  x: number;
  y: number;
  ip?: string;
  traffic?: number;
  uptime?: number;
  alertsCount?: number;
}

export interface Connection {
  from: string;
  to: string;
  bandwidth?: number;
}

/**
 * Live network topology metric. One record per topology (mesh, hybrid, tree,
 * bus, star, ring). The Resources Hub polls this collection and renders the
 * latency / throughput / uptime / packet-health cards from it instead of
 * simulating values locally.
 */
export interface TopologyMetric {
  _id?: string;
  id?: string;
  topology: "mesh" | "hybrid" | "tree" | "bus" | "star" | "ring" | string;
  label?: string;
  latencyMs: number;
  throughputGbps: number;
  uptimePct: number;
  packetHealth: number;
  status?: "live" | "synthetic" | "degraded" | string;
  nodes?: number;
  source?: string;
  lastUpdated?: string;
}