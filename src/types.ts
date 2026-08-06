export interface ClubMember {
  _id?: string | { $oid: string };
  id?: string;
  memberId?: string;
  studentId?: string;
  name: string;
  email: string;
  photoURL?: string;
  department: string;
  role: "admin" | "member" | string;
  status: "Active" | "Inactive" | "pending" | "approved" | "active" | "suspended";
  xp: number;
  joinedDate: string;
  lastLogin?: string | null;
  avatar?: string;
  batch?: string;
  attendance?: number;
  paidMonths?: string[];
  totalPaid?: number;
}

export interface NoticeItem {
  _id?: string | { $oid: string };
  id: string;
  title: string;
  date: string;
  category?: string;
}

export interface EventItem {
  _id?: string | { $oid: string };
  id: string;
  title: string;
  type?: string;
  date: string;
  time?: string;
  location: string;
  image?: string;
  isRegistered?: boolean;
}

export interface TrainingCourse {
  _id?: string | { $oid: string };
  id: string;
  title?: string;
  name?: string;
  description: string;
  progress?: number;
  provider?: string;
  instructor?: string;
}

export interface DeviceItem {
  _id?: string | { $oid: string };
  id: string;
  name: string;
  type: string;
  status: string;
  location: string;
  ports?: string;
  throughput?: string;
}

export interface SponsorItem {
  _id?: string | { $oid: string };
  id: string;
  name: string;
  tier: string;
  contribution: string;
}

export interface TopologyMetric {
  _id?: string | { $oid: string };
  id?: string;
  topology: string;
  label?: string;
  latencyMs: number;
  throughputGbps: number;
  uptimePct: number;
  packetHealth: number;
  status?: string;
  nodes?: number;
  source?: string;
  lastUpdated?: string;
}