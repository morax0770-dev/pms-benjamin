// Mock data สำหรับ frontend (ยังไม่เชื่อม backend)
// ─── ROLE / SESSION ───────────────────────────────────────────
export type UserRole = "HQ" | "DEALER";

export type MockSession = {
  name: string;
  role: UserRole;
  dealerName: string;
  scopeAll: boolean; // true = HQ เห็นทุก dealer
};

export const sessions: Record<"hq" | "dealer", MockSession> = {
  hq: {
    name: "วิชัย ประสิทธิ์",
    role: "HQ",
    dealerName: "Benjamin HQ",
    scopeAll: true,
  },
  dealer: {
    name: "สมชาย เชียงใหม่",
    role: "DEALER",
    dealerName: "Benjamin สาขาเชียงใหม่",
    scopeAll: false,
  },
};


// โครงสร้างอ้างอิง prisma/schema.prisma

export const BUILDING_TYPES = [
  "อาคารสำเร็จรูป",
  "อาคารโรงงาน",
  "โกดังสินค้า",
  "อาคารสำนักงาน",
  "อาคารเชิงพาณิชย์",
  "สนามกีฬาในร่ม",
] as const;
export type BuildingType = typeof BUILDING_TYPES[number];

export const BUILDING_TYPE_COLOR: Record<string, string> = {
  "อาคารสำเร็จรูป":   "#003366",
  "อาคารโรงงาน":      "#f59e0b",
  "โกดังสินค้า":      "#22c55e",
  "อาคารสำนักงาน":    "#0d9488",
  "อาคารเชิงพาณิชย์": "#0369a1",
  "สนามกีฬาในร่ม":    "#f04d6a",
};

export type LeadStatus =
  | "NEW"
  | "WAITING"
  | "BULLET"
  | "QUOTED"
  | "PAID"
  | "CANCELLED";

export const leadStatusLabel: Record<LeadStatus, string> = {
  NEW:       "ใหม่",
  WAITING:   "กำลังรอรายละเอียด",
  BULLET:    "เสนอบูเลท",
  QUOTED:    "ออกใบเสนอราคา",
  PAID:      "ชำระเงินแล้ว",
  CANCELLED: "ยกเลิก",
};

export const leadStatusColor: Record<LeadStatus, { bg: string; text: string }> = {
  NEW:       { bg: "#f0f0f5", text: "#6b7280" },
  WAITING:   { bg: "#e0f5fd", text: "#0284c7" },
  BULLET:    { bg: "#fff4eb", text: "#ea6c00" },
  QUOTED:    { bg: "#f0fdf4", text: "#15803d" },
  PAID:      { bg: "#e6faf7", text: "#0f766e" },
  CANCELLED: { bg: "#fdeaed", text: "#f04d6a" },
};

export const kpis = [
  { key: "target", label: "เป้า vs ยอดขาย", value: "68%", delta: 10.4, icon: "target" },
  { key: "pipeline", label: "มูลค่า Pipeline", value: "฿4.2M", delta: 8.6, icon: "trending" },
  { key: "win", label: "Win Rate", value: "35%", delta: 4.2, icon: "award" },
  { key: "projects", label: "โครงการกำลังทำ", value: "5", delta: 16.4, icon: "building" },
] as const;

// ยอดขาย/ลีด รายเดือน (กราฟเส้น)
export const salesByMonth = [
  { month: "ม.ค.", value: 820 },
  { month: "ก.พ.", value: 640 },
  { month: "มี.ค.", value: 980 },
  { month: "เม.ย.", value: 1200 },
  { month: "พ.ค.", value: 760 },
  { month: "มิ.ย.", value: 1080 },
  { month: "ก.ค.", value: 900 },
  { month: "ส.ค.", value: 1320 },
];

// สัดส่วน pipeline ตามสถานะ (โดนัท)
export const pipelineBreakdown = [
  { label: "เสนอราคา", value: 58, color: "var(--color-brand-blue)" },
  { label: "ต่อรอง", value: 24, color: "var(--color-silver)" },
  { label: "อื่นๆ", value: 18, color: "var(--color-steel)" },
];

export const schedule = [
  { title: "นัดลูกค้า — โครงการแม่สอด", time: "10:00 - 11:00", place: "แม่สอด, ตาก", kind: "meet" },
  { title: "นัดลูกค้า — CCS บางใหญ่", time: "13:30 - 14:30", place: "บางใหญ่, นนทบุรี", kind: "meet" },
];

export const upcoming = [
  { title: "ติดตามผล — โครงการ CCS-02", date: "30 มิ.ย. 2026", who: "บจ. ซีซีเอส", kind: "follow_up" },
  { title: "ปิดงาน — โครงการปากน้ำ", date: "3 ก.ค. 2026", who: "คุณสมชาย", kind: "follow_up" },
];

export type LeadRow = {
  id: string;
  numId: number;
  name: string;
  company: string;
  contact: string;
  phone?: string;
  email?: string;
  province: string;
  product: string;
  category: string;
  status: LeadStatus;
  value: string;
  assigned: string;
  source?: string;
  note?: string;
  customerId?: number;
  lostReason?: string;
  createdAt?: string;
};

export const leads: LeadRow[] = [
  { id: "#L-40322", numId: 1, name: "บจ. ไทยสตีล", company: "บจ. ไทยสตีล", contact: "คุณสมชาย ใจดี", phone: "081-234-5678", email: "somchai@thaisteel.co.th", province: "นนทบุรี", product: "โกดังสินค้า", category: "คลังสินค้า", status: "QUOTED", value: "฿1.2M", assigned: "สมชาย", source: "โทรเข้า", note: "สนใจโกดังสินค้าขนาด 1,200 ตร.ม. พร้อมสำนักงาน", customerId: 1 },
  { id: "#L-40323", numId: 2, name: "บจ. ซีซีเอส", company: "บจ. ซีซีเอส", contact: "คุณกาญจนา ม.", phone: "082-345-6789", email: "kanchana@ccs.co.th", province: "เชียงใหม่", product: "อาคารโรงงาน", category: "อาคารอุตสาหกรรม", status: "NEW", value: "฿480K", assigned: "วิภา", source: "เว็บไซต์", customerId: 2 },
  { id: "#L-40324", numId: 3, name: "หจก. ราชบุรีโลหะ", company: "หจก. ราชบุรีโลหะ", contact: "คุณประยุทธ ร.", phone: "083-456-7890", email: "prayut@rajburimetal.com", province: "ราชบุรี", product: "อาคารโรงงาน", category: "อาคารอุตสาหกรรม", status: "BULLET", value: "฿3.1M", assigned: "วิภา", source: "แนะนำ", note: "กำลังต่อรองราคา รอใบเสนอราคาปรับใหม่", customerId: 3 },
  { id: "#L-40325", numId: 4, name: "บจ. สมุทรโกดัง", company: "บจ. สมุทรโกดัง", contact: "คุณดารัล ส.", phone: "084-567-8901", email: "daran@samutwarehouse.co.th", province: "สมุทรปราการ", product: "โกดังสินค้า", category: "คลังสินค้า", status: "WAITING", value: "฿2.0M", assigned: "สมชาย", source: "งานแสดงสินค้า", customerId: 4 },
  { id: "#L-40326", numId: 5, name: "บจ. นครสวรรค์โลหะ", company: "บจ. นครสวรรค์โลหะ", contact: "คุณวิชัย น.", phone: "085-678-9012", email: "wichai@nsmetal.co.th", province: "นครสวรรค์", product: "อาคารเชิงพาณิชย์", category: "งานพิเศษ", status: "WAITING", value: "฿760K", assigned: "กาญจนา", source: "Facebook", customerId: 8 },
  { id: "#L-40327", numId: 6, name: "บจ. ทีทีวาย", company: "บจ. ทีทีวาย อินเตอร์", contact: "คุณวิทยา ท.", phone: "086-789-0123", email: "wittaya@ttyinter.com", province: "นครสวรรค์", product: "อาคารโรงงาน", category: "อาคารอุตสาหกรรม", status: "PAID", value: "฿5.4M", assigned: "สมชาย", source: "แนะนำ", note: "ชำระเงินแล้ว รอทำสัญญา" },
];

// ─── PROJECTS ─────────────────────────────────────────────────
export type ProjectStatus = "not_started" | "in_progress" | "on_hold" | "completed" | "cancelled";

export type ProjectMock = {
  id: number; title: string; client: string; status: ProjectStatus;
  progress: number; start: string; due: string; assigned: string[]; value: string;
  customerId: number;    // link to customers[]
  quotationId?: string;  // link to quotations[]
};

export const projectStatusLabel: Record<ProjectStatus, string> = {
  not_started: "ยังไม่เริ่ม", in_progress: "กำลังดำเนินการ",
  on_hold: "หยุดชั่วคราว", completed: "เสร็จแล้ว", cancelled: "ยกเลิก",
};
export const projectStatusColor: Record<ProjectStatus, { bg: string; text: string }> = {
  not_started: { bg: "#f0f0f5", text: "#6b7280" },
  in_progress:  { bg: "#dce5f0", text: "#003366" },
  on_hold:      { bg: "#fef3cd", text: "#f59e0b" },
  completed:    { bg: "#e5faf0", text: "#22c55e" },
  cancelled:    { bg: "#fdeaed", text: "#f04d6a" },
};

export const projects: ProjectMock[] = [
  { id: 1, title: "โกดังสินค้า บจ. ไทยสตีล", client: "บจ. ไทยสตีล", status: "in_progress", progress: 65, start: "2026-04-01", due: "2026-07-31", assigned: ["สมชาย", "วิภา"], value: "฿1.8M", customerId: 1, quotationId: "Q-2026-0089" },
  { id: 2, title: "อาคารโรงงาน บจ. ซีซีเอส เชียงใหม่", client: "บจ. ซีซีเอส", status: "in_progress", progress: 28, start: "2026-05-15", due: "2026-08-15", assigned: ["วิชัย"], value: "฿3.2M", customerId: 2, quotationId: "Q-2026-0095" },
  { id: 3, title: "โกดังสินค้า ปากน้ำ", client: "บจ. สมุทรโกดัง", status: "not_started", progress: 0, start: "2026-07-01", due: "2026-10-31", assigned: [], value: "฿2.0M", customerId: 4, quotationId: "Q-2026-0097" },
  { id: 4, title: "อาคารเชิงพาณิชย์ นครสวรรค์", client: "บจ. นครสวรรค์โลหะ", status: "completed", progress: 100, start: "2026-01-01", due: "2026-03-31", assigned: ["สมชาย", "กาญจนา"], value: "฿5.4M", customerId: 8 },
  { id: 5, title: "อาคารโรงงาน PEB ราชบุรี", client: "หจก. ราชบุรีโลหะ", status: "on_hold", progress: 40, start: "2026-03-01", due: "2026-09-01", assigned: ["วิภา"], value: "฿760K", customerId: 3, quotationId: "Q-2026-0091" },
  { id: 6, title: "โกดังสินค้า แม่สอด", client: "บจ. แม่สอดโลหะ", status: "in_progress", progress: 82, start: "2026-02-01", due: "2026-06-30", assigned: ["สมชาย"], value: "฿4.1M", customerId: 6 },
  { id: 7, title: "อาคารสำเร็จรูป อุตรดิตถ์", client: "บจ. อุตรดิตถ์โลหะ", status: "not_started", progress: 0, start: "2026-08-01", due: "2026-12-31", assigned: [], value: "฿2.8M", customerId: 7, quotationId: "Q-2026-0098" },
  { id: 8, title: "อาคารโรงงาน ระยอง VCS Asia", client: "VCS Asia", status: "completed", progress: 100, start: "2025-11-01", due: "2026-02-28", assigned: ["วิชัย", "กาญจนา"], value: "฿6.2M", customerId: 5, quotationId: "Q-2026-0092" },
];

// ─── TASKS ────────────────────────────────────────────────────
export type TaskPriority = "urgent" | "high" | "normal" | "low";
export type TaskStatus = "todo" | "in_progress" | "review" | "done" | "cancelled";

export type TaskMock = {
  id: number; title: string; project: string | null; projectId: number | null;
  priority: TaskPriority; status: TaskStatus; statusTitle: string; statusColor: string;
  due: string | null; assigned: string[];
};

export const taskStatusLabel: Record<TaskStatus, string> = {
  todo: "รอดำเนินการ", in_progress: "กำลังทำ",
  review: "กำลังรีวิว", done: "เสร็จแล้ว", cancelled: "ยกเลิก",
};
export const taskStatusBadge: Record<TaskStatus, { bg: string; text: string }> = {
  todo:        { bg: "#f0f0f5", text: "#6b7280" },
  in_progress: { bg: "#dce5f0", text: "#003366" },
  review:      { bg: "#fef3cd", text: "#f59e0b" },
  done:        { bg: "#e5faf0", text: "#22c55e" },
  cancelled:   { bg: "#fdeaed", text: "#f04d6a" },
};
export const taskPriorityColor: Record<TaskPriority, string> = {
  urgent: "#f04d6a", high: "#f59e0b", normal: "#003366", low: "#6b7280",
};
export const taskPriorityLabel: Record<TaskPriority, string> = {
  urgent: "เร่งด่วน", high: "สูง", normal: "ปกติ", low: "ต่ำ",
};

export const tasks: TaskMock[] = [
  { id: 1,  title: "ประชุมเปิดโครงการ บจ. ไทยสตีล",  project: "โกดังสินค้า บจ. ไทยสตีล",       projectId: 1, priority: "urgent", status: "done",        statusTitle: "เสร็จแล้ว",      statusColor: "#22c55e", due: "2026-06-10", assigned: ["สมชาย"] },
  { id: 2,  title: "วางแผนงานโครงการ Phase 1",        project: "โกดังสินค้า บจ. ไทยสตีล",       projectId: 1, priority: "high",   status: "in_progress", statusTitle: "กำลังทำ",       statusColor: "#003366", due: "2026-06-30", assigned: ["วิภา", "สมชาย"] },
  { id: 3,  title: "สั่งซื้อวัสดุและอุปกรณ์",         project: "โกดังสินค้า บจ. ไทยสตีล",       projectId: 1, priority: "high",   status: "todo",        statusTitle: "รอดำเนินการ", statusColor: "#6b7280", due: "2026-07-05", assigned: [] },
  { id: 4,  title: "นำเสนอแผนโครงการ Phase 1",        project: "อาคารโรงงาน บจ. ซีซีเอส เชียงใหม่", projectId: 2, priority: "urgent", status: "review",      statusTitle: "กำลังรีวิว",   statusColor: "#f59e0b", due: "2026-06-25", assigned: ["วิชัย"] },
  { id: 5,  title: "เตรียมเอกสารสัญญา",               project: "อาคารโรงงาน บจ. ซีซีเอส เชียงใหม่", projectId: 2, priority: "normal", status: "todo",        statusTitle: "รอดำเนินการ", statusColor: "#6b7280", due: "2026-07-15", assigned: ["วิชัย"] },
  { id: 6,  title: "ส่งมอบโครงการ อาคารเชิงพาณิชย์ นครสวรรค์", project: "อาคารเชิงพาณิชย์ นครสวรรค์", projectId: 4, priority: "normal", status: "done",        statusTitle: "เสร็จแล้ว",      statusColor: "#22c55e", due: "2026-03-31", assigned: ["สมชาย", "กาญจนา"] },
  { id: 7,  title: "ติดตามความก้าวหน้า Phase 3",       project: "อาคารโรงงาน PEB ราชบุรี",         projectId: 5, priority: "high",   status: "in_progress", statusTitle: "กำลังทำ",       statusColor: "#003366", due: "2026-07-01", assigned: ["วิภา"] },
  { id: 8,  title: "ประชุมลูกค้า แม่สอด",             project: "โกดังสินค้า แม่สอด",             projectId: 6, priority: "normal", status: "done",        statusTitle: "เสร็จแล้ว",      statusColor: "#22c55e", due: "2026-06-15", assigned: ["สมชาย"] },
  { id: 9,  title: "เตรียมเอกสารส่งมอบโครงการ",        project: "โกดังสินค้า แม่สอด",             projectId: 6, priority: "high",   status: "in_progress", statusTitle: "กำลังทำ",       statusColor: "#003366", due: "2026-06-28", assigned: ["สมชาย"] },
  { id: 10, title: "รับมอบโครงการระยอง",               project: "อาคารโรงงาน ระยอง VCS Asia",      projectId: 8, priority: "normal", status: "done",        statusTitle: "เสร็จแล้ว",      statusColor: "#22c55e", due: "2026-02-28", assigned: ["วิชัย", "กาญจนา"] },
  { id: 11, title: "อัปเดตรายงานความก้าวหน้า",        project: null,                            projectId: null, priority: "low", status: "todo",       statusTitle: "รอดำเนินการ", statusColor: "#6b7280", due: "2026-06-30", assigned: [] },
  { id: 12, title: "ประชุมทีมรายสัปดาห์",            project: null,                            projectId: null, priority: "normal", status: "in_progress", statusTitle: "กำลังทำ", statusColor: "#003366", due: "2026-06-22", assigned: ["สมชาย", "วิภา", "วิชัย"] },
  { id: 13, title: "ทบทวนสัญญา CRM",                project: "อาคารโรงงาน บจ. ซีซีเอส เชียงใหม่", projectId: 2, priority: "urgent", status: "cancelled",   statusTitle: "ยกเลิก",        statusColor: "#f04d6a", due: "2026-06-18", assigned: [] },
  { id: 14, title: "สรุปผลงาน Q2 2026",              project: null,                            projectId: null, priority: "high", status: "todo",       statusTitle: "รอดำเนินการ", statusColor: "#6b7280", due: "2026-06-30", assigned: [] },
];

// ─── CUSTOMERS ────────────────────────────────────────────────
export type CustomerMock = {
  id: number; name: string; company: string; phone: string; email: string;
  province: string; category: string; initials: string; color: string;
  tags: string[]; projectCount: number;
};

export const customers: CustomerMock[] = [
  { id: 1, name: "คุณสมชาย ใจดี", company: "บจ. ไทยสตีล", phone: "081-234-5678", email: "somchai@thaisteel.co.th", province: "นนทบุรี", category: "โกดังสินค้า", initials: "สช", color: "#003366", tags: ["VIP", "สัญญาใหม่"], projectCount: 2 },
  { id: 2, name: "คุณกาญจนา ม.", company: "บจ. ซีซีเอส", phone: "082-345-6789", email: "kanjana@ccs.co.th", province: "เชียงใหม่", category: "อาคารโรงงาน", initials: "กม", color: "#22c55e", tags: ["ต่อเนื่อง"], projectCount: 1 },
  { id: 3, name: "คุณประยุทธ ร.", company: "หจก. ราชบุรีโลหะ", phone: "083-456-7890", email: "prayuth@rajburi.co.th", province: "ราชบุรี", category: "อาคารโรงงาน", initials: "ปร", color: "#f59e0b", tags: ["โซนตะวันตก"], projectCount: 1 },
  { id: 4, name: "คุณดารัล ส.", company: "บจ. สมุทรโกดัง", phone: "084-567-8901", email: "darat@smgodown.co.th", province: "สมุทรปราการ", category: "โกดังสินค้า", initials: "ดส", color: "#f04d6a", tags: ["ลูกค้าเดิม"], projectCount: 2 },
  { id: 5, name: "VCS Asia (ระยอง)", company: "VCS Asia Co., Ltd.", phone: "085-678-9012", email: "vcs@vcsasia.com", province: "ระยอง", category: "อาคารโรงงาน", initials: "VC", color: "#002244", tags: ["Enterprise", "Contract"], projectCount: 3 },
  { id: 6, name: "คุณสุรัตน์ ล.", company: "บจ. แม่สอดโลหะ", phone: "086-789-0123", email: "surat@maesot.co.th", province: "ตาก", category: "โกดังสินค้า", initials: "สล", color: "#C0C0C0", tags: ["โซนตะวันตก"], projectCount: 1 },
  { id: 7, name: "บจ. อุตรดิตถ์โลหะ", company: "บจ. อุตรดิตถ์โลหะ", phone: "087-890-1234", email: "info@uttaradit.co.th", province: "อุตรดิตถ์", category: "อาคารสำเร็จรูป", initials: "อต", color: "#8fa3b8", tags: ["ลีดใหม่"], projectCount: 0 },
  { id: 8, name: "บจ. นครสวรรค์โลหะ", company: "บจ. นครสวรรค์โลหะ", phone: "088-901-2345", email: "nakhon@nsloha.co.th", province: "นครสวรรค์", category: "อาคารเชิงพาณิชย์", initials: "นส", color: "#22c55e", tags: ["ลูกค้าเดิม", "VIP"], projectCount: 2 },
  { id: 9, name: "บจ. เชียงรายเมทัล", company: "บจ. เชียงรายเมทัล", phone: "089-012-3456", email: "info@chiangrai-metal.co.th", province: "เชียงราย", category: "โกดังสินค้า", initials: "ชร", color: "#6b7280", tags: ["ลีดเก่า"], projectCount: 0 },
];

// ─── QUOTATIONS ───────────────────────────────────────────────
export type QuotationStatus = "draft" | "sent" | "won" | "lost" | "expired";

export type QuotationMock = {
  id: string; customer: string; project: string;
  total: string; totalValue: number;
  materialCost: number;
  province: string; buildingType: string; area: number;
  status: QuotationStatus; date: string; items: number;
  customerId: number;
  projectId: number;
};

export const quotationStatusLabel: Record<QuotationStatus, string> = {
  draft: "ร่าง", sent: "ส่งลูกค้าแล้ว", won: "ปิดการขาย", lost: "ไม่ได้งาน", expired: "หมดอายุ",
};
export const quotationStatusColor: Record<QuotationStatus, { bg: string; text: string }> = {
  draft:   { bg: "#f0f0f5", text: "#6b7280" },
  sent:    { bg: "#dce5f0", text: "#003366" },
  won:     { bg: "#e5faf0", text: "#22c55e" },
  lost:    { bg: "#f5f5f5", text: "#9ca3af" },
  expired: { bg: "#f5f5f5", text: "#9ca3af" },
};

export const quotations: QuotationMock[] = [
  { id: "Q-2026-0089", customer: "บจ. ไทยสตีล", project: "โกดังสินค้า บจ. ไทยสตีล", total: "฿1,800,000", totalValue: 1800000, materialCost: 1800000, province: "นนทบุรี", buildingType: "โกดังสินค้า", area: 960, status: "won", date: "2026-05-15", items: 8, customerId: 1, projectId: 1 },
  { id: "Q-2026-0091", customer: "หจก. ราชบุรีโลหะ", project: "อาคารโรงงาน PEB ราชบุรี", total: "฿760,000", totalValue: 760000, materialCost: 760000, province: "ราชบุรี", buildingType: "อาคารโรงงาน", area: 480, status: "sent", date: "2026-06-01", items: 5, customerId: 3, projectId: 5 },
  { id: "Q-2026-0092", customer: "VCS Asia", project: "อาคารโรงงาน ระยอง VCS Asia", total: "฿6,200,000", totalValue: 6200000, materialCost: 6200000, province: "ระยอง", buildingType: "อาคารโรงงาน", area: 3200, status: "won", date: "2025-11-10", items: 15, customerId: 5, projectId: 8 },
  { id: "Q-2026-0095", customer: "บจ. ซีซีเอส", project: "อาคารโรงงาน บจ. ซีซีเอส เชียงใหม่", total: "฿3,200,000", totalValue: 3200000, materialCost: 3200000, province: "เชียงใหม่", buildingType: "อาคารโรงงาน", area: 1800, status: "sent", date: "2026-06-10", items: 12, customerId: 2, projectId: 2 },
  { id: "Q-2026-0097", customer: "บจ. สมุทรโกดัง", project: "โกดังสินค้า ปากน้ำ", total: "฿2,000,000", totalValue: 2000000, materialCost: 2000000, province: "สมุทรปราการ", buildingType: "โกดังสินค้า", area: 1200, status: "sent", date: "2026-06-18", items: 7, customerId: 4, projectId: 3 },
  { id: "Q-2026-0098", customer: "บจ. อุตรดิตถ์โลหะ", project: "อาคารสำเร็จรูป อุตรดิตถ์", total: "฿2,800,000", totalValue: 2800000, materialCost: 2800000, province: "อุตรดิตถ์", buildingType: "อาคารสำเร็จรูป", area: 1600, status: "draft", date: "2026-06-20", items: 9, customerId: 7, projectId: 7 },
  { id: "Q-2026-0099", customer: "บจ. นครสวรรค์โลหะ", project: "อาคารเชิงพาณิชย์ นครสวรรค์", total: "฿5,400,000", totalValue: 5400000, materialCost: 5400000, province: "นครสวรรค์", buildingType: "อาคารเชิงพาณิชย์", area: 2800, status: "won", date: "2026-04-05", items: 18, customerId: 8, projectId: 6 },
  { id: "Q-2026-0100", customer: "บจ. เชียงรายเมทัล", project: "โกดังสินค้า เชียงราย", total: "฿1,500,000", totalValue: 1500000, materialCost: 1500000, province: "เชียงราย", buildingType: "โกดังสินค้า", area: 720, status: "lost", date: "2026-05-28", items: 6, customerId: 9, projectId: 0 },
];

// ─── TEAM ─────────────────────────────────────────────────────
export type TeamMock = {
  id: number; name: string; role: string; dept: string;
  initials: string; color: string; tasks: number; projects: number; phone: string;
};

export const teamRoleLabel: Record<string, string> = {
  ผู้จัดการสาขา: "ผู้จัดการสาขา",
  เซลส์: "เซลส์",
};

export const team: TeamMock[] = [
  { id: 1, name: "สมชาย เชียงใหม่",  role: "ผู้จัดการสาขา", dept: "บริหาร", initials: "สช", color: "#003366", tasks: 5, projects: 4, phone: "081-234-5678" },
  { id: 2, name: "วิภา รัตนกุล",      role: "เซลส์",         dept: "ขาย",    initials: "วร", color: "#22c55e", tasks: 3, projects: 3, phone: "082-345-6789" },
  { id: 3, name: "วิชัย ประสิทธิ์",   role: "เซลส์",         dept: "ขาย",    initials: "วป", color: "#f59e0b", tasks: 4, projects: 2, phone: "083-456-7890" },
  { id: 4, name: "กาญจนา มีสุข",      role: "เซลส์",         dept: "ขาย",    initials: "กม", color: "#f04d6a", tasks: 2, projects: 2, phone: "084-567-8901" },
  { id: 5, name: "ประสิทธิ์ ดีงาน",   role: "เซลส์",         dept: "ขาย",    initials: "ปด", color: "#2D2D2D", tasks: 1, projects: 1, phone: "085-678-9012" },
  { id: 6, name: "สุดาวรรณ สวยงาม",   role: "เซลส์",         dept: "ขาย",    initials: "สส", color: "#C0C0C0", tasks: 2, projects: 2, phone: "086-789-0123" },
];

// ─── HQ MOCK DATA ─────────────────────────────────────────────

// KPI รวมทั้งเครือ
export const hqKpis = [
  { key: "revenue", label: "ยอดขายรวมเดือนนี้", value: "฿18.4M", delta: 12.3, icon: "dollar" },
  { key: "pipeline", label: "Pipeline รวม", value: "฿54.2M", delta: 6.8, icon: "trending" },
  { key: "projects", label: "โครงการ Active", value: "23", delta: 16.4, icon: "building" },
  { key: "ontime", label: "On-time %", value: "87%", delta: -3.2, icon: "clock" },
];

// สาขา Benjamin
export type DealerCredentials = { email: string; password: string };

export type DealerRow = {
  id: string;
  code: string;
  name: string;
  region: string;
  revenueActual: number;
  revenueTarget: number;
  winRate: number;
  activeProjects: number;
  onTimePct: number;
  status: "active" | "inactive";
  credentials: DealerCredentials;
  deleted?: boolean;
};

export const dealerLeaderboard: DealerRow[] = [
  { id: "RYG", code: "RYG", name: "Benjamin สาขาระยอง",      region: "ตะวันออก", revenueActual: 5400000, revenueTarget: 6000000, winRate: 48, activeProjects: 6, onTimePct: 91, status: "active",   credentials: { email: "ryg@benjamin.co.th", password: "PEB-RYG-4821" } },
  { id: "CNX", code: "CNX", name: "Benjamin สาขาเชียงใหม่",   region: "เหนือ",    revenueActual: 4200000, revenueTarget: 6200000, winRate: 35, activeProjects: 5, onTimePct: 78, status: "active",   credentials: { email: "cnx@benjamin.co.th", password: "PEB-CNX-3317" } },
  { id: "MST", code: "MST", name: "Benjamin สาขาแม่สอด",      region: "ตะวันตก", revenueActual: 3800000, revenueTarget: 5000000, winRate: 52, activeProjects: 4, onTimePct: 85, status: "active",   credentials: { email: "mst@benjamin.co.th", password: "PEB-MST-7749" } },
  { id: "CRI", code: "CRI", name: "Benjamin สาขาเชียงราย",    region: "เหนือ",    revenueActual: 3100000, revenueTarget: 5800000, winRate: 41, activeProjects: 3, onTimePct: 72, status: "active",   credentials: { email: "cri@benjamin.co.th", password: "PEB-CRI-5563" } },
  { id: "NSN", code: "NSN", name: "Benjamin สาขานครสวรรค์",   region: "กลาง",     revenueActual: 1900000, revenueTarget: 5000000, winRate: 29, activeProjects: 2, onTimePct: 61, status: "active",   credentials: { email: "nsn@benjamin.co.th", password: "PEB-NSN-2294" } },
  { id: "HYI", code: "HYI", name: "Benjamin สาขาหาดใหญ่",    region: "ใต้",      revenueActual: 920000,  revenueTarget: 4000000, winRate: 18, activeProjects: 1, onTimePct: 0,  status: "inactive", credentials: { email: "hyi@benjamin.co.th", password: "PEB-HYI-1108" } },
];

// Lead pool กลาง (ยังไม่มอบหมาย dealer)
export type LeadPoolRow = {
  id: string;
  name: string;
  province: string;
  channel: string;
  product: string;
  value: string;
  createdAt: string;
};

export const leadPool: LeadPoolRow[] = [
  { id: "#LP-001", name: "บจ. อุตรดิตถ์โลหะ", province: "อุตรดิตถ์", channel: "เว็บไซต์", product: "อาคารโรงงาน", value: "฿2.8M", createdAt: "วันนี้ 09:14" },
  { id: "#LP-002", name: "คุณพรทิพย์ ว.", province: "ลำปาง", channel: "LINE OA", product: "โกดังสินค้า", value: "฿650K", createdAt: "วันนี้ 08:32" },
  { id: "#LP-003", name: "หจก. พะเยาอุตสาหกรรม", province: "พะเยา", channel: "เว็บไซต์", product: "อาคารสำเร็จรูป", value: "฿1.1M", createdAt: "เมื่อวาน 17:05" },
];

// รออนุมัติ (ใบเสนอราคาเกินวงเงิน)
export type ApprovalRow = {
  id: string;
  quoteNo: string;
  dealer: string;
  customer: string;
  total: string;
  discountPct: number;
  requestedAt: string;
};

export const pendingApprovals: ApprovalRow[] = [
  { id: "1", quoteNo: "Q-2026-0089", dealer: "เชียงใหม่", customer: "บจ. ไทยสตีล", total: "฿3.2M", discountPct: 15, requestedAt: "2 ชม. ที่แล้ว" },
  { id: "2", quoteNo: "Q-2026-0091", dealer: "ระยอง", customer: "หจก. ราชบุรีโลหะ", total: "฿1.8M", discountPct: 12, requestedAt: "5 ชม. ที่แล้ว" },
];

// ยอดขายรายเดือน (รวมทั้งเครือ)
export const hqSalesByMonth = [
  { month: "ม.ค.", value: 4200 },
  { month: "ก.พ.", value: 3800 },
  { month: "มี.ค.", value: 5600 },
  { month: "เม.ย.", value: 7100 },
  { month: "พ.ค.", value: 4900 },
  { month: "มิ.ย.", value: 6800 },
  { month: "ก.ค.", value: 5400 },
  { month: "ส.ค.", value: 8200 },
];

// ─── APPOINTMENTS ─────────────────────────────────────────────
export type ApptType = "survey" | "design_meet" | "presentation" | "contract_sign" | "handover" | "follow_up";
export type ApptStatus = "upcoming" | "done" | "cancelled";

export const apptTypeLabel: Record<ApptType, string> = {
  survey: "นัดดูพื้นที่ลูกค้า",
  design_meet: "ประชุมนำเสนอ",
  presentation: "นำเสนอราคา",
  contract_sign: "เซ็นสัญญา",
  handover: "ติดตามผลหลังปิดขาย",
  follow_up: "โทรติดตาม",
};

export const apptTypeColor: Record<ApptType, { bg: string; text: string }> = {
  survey:        { bg: "#dce5f0", text: "#003366" },
  design_meet:   { bg: "#f0f4f8", text: "#2D2D2D" },
  presentation:  { bg: "#fef3cd", text: "#f59e0b" },
  contract_sign: { bg: "#dbeafe", text: "#3b82f6" },
  handover:      { bg: "#e5faf0", text: "#22c55e" },
  follow_up:     { bg: "#f0f0f5", text: "#6b7280" },
};

export const apptStatusLabel: Record<ApptStatus, string> = {
  upcoming: "กำลังจะมาถึง", done: "เสร็จแล้ว", cancelled: "ยกเลิก",
};
export const apptStatusColor: Record<ApptStatus, { bg: string; text: string }> = {
  upcoming:  { bg: "#dce5f0", text: "#003366" },
  done:      { bg: "#e5faf0", text: "#22c55e" },
  cancelled: { bg: "#fdeaed", text: "#f04d6a" },
};

export type AppointmentMock = {
  id: number; company: string; contact: string; phone: string;
  project: string; buildingType: string; area: number; province: string;
  date: string; time: string; type: ApptType; assigned: string;
  status: ApptStatus; note: string;
};

export const appointments: AppointmentMock[] = [
  { id: 1, company: "บจ. ไทยสตีล", contact: "คุณสมชาย ใจดี", phone: "081-234-5678", project: "โกดังสินค้า บจ. ไทยสตีล", buildingType: "โกดังสินค้า", area: 1200, province: "นนทบุรี", date: "2026-06-24", time: "09:00", type: "survey", assigned: "สมชาย", status: "upcoming", note: "นัดดูพื้นที่โกดังสินค้า บจ. ไทยสตีล" },
  { id: 2, company: "บจ. ซีซีเอส", contact: "คุณกาญจนา ม.", phone: "082-345-6789", project: "อาคารโรงงาน บจ. ซีซีเอส เชียงใหม่", buildingType: "อาคารโรงงาน", area: 800, province: "เชียงใหม่", date: "2026-06-24", time: "13:30", type: "design_meet", assigned: "วิภา", status: "upcoming", note: "ประชุมนำเสนอโครงการอาคารโรงงาน" },
  { id: 3, company: "บจ. ไทยสตีล", contact: "คุณสมชาย ใจดี", phone: "081-234-5678", project: "โกดังสินค้า บจ. ไทยสตีล", buildingType: "โกดังสินค้า", area: 1200, province: "นนทบุรี", date: "2026-06-26", time: "09:00", type: "contract_sign", assigned: "สมชาย", status: "upcoming", note: "เซ็นสัญญาโครงการโกดังสินค้า" },
  { id: 4, company: "บจ. ซีซีเอส", contact: "คุณกาญจนา ม.", phone: "082-345-6789", project: "อาคารโรงงาน บจ. ซีซีเอส เชียงใหม่", buildingType: "อาคารโรงงาน", area: 800, province: "เชียงใหม่", date: "2026-06-30", time: "13:00", type: "follow_up", assigned: "สมชาย", status: "upcoming", note: "ติดตามผลหลังปิดขาย Phase 1" },
  { id: 5, company: "บจ. สมุทรโกดัง", contact: "คุณดารัล ส.", phone: "084-567-8901", project: "โกดังสินค้า ปากน้ำ", buildingType: "โกดังสินค้า", area: 2000, province: "สมุทรปราการ", date: "2026-07-03", time: "08:00", type: "survey", assigned: "วิชัย", status: "upcoming", note: "นัดดูพื้นที่โกดังสินค้าลูกค้าปากน้ำ" },
  { id: 6, company: "หจก. ราชบุรีโลหะ", contact: "คุณประยุทธ ร.", phone: "083-456-7890", project: "อาคารโรงงาน PEB ราชบุรี", buildingType: "อาคารโรงงาน", area: 3100, province: "ราชบุรี", date: "2026-07-05", time: "10:00", type: "presentation", assigned: "วิภา", status: "upcoming", note: "นำเสนอใบเสนอราคาฉบับปรับปรุง" },
  { id: 7, company: "บจ. แม่สอดโลหะ", contact: "คุณสุรัตน์ ล.", phone: "086-789-0123", project: "โกดังสินค้า แม่สอด", buildingType: "โกดังสินค้า", area: 4100, province: "ตาก", date: "2026-06-15", time: "10:00", type: "survey", assigned: "สมชาย", status: "done", note: "นัดดูพื้นที่เรียบร้อย รอนัดครั้งถัดไป" },
  { id: 8, company: "VCS Asia", contact: "VCS Asia (ระยอง)", phone: "085-678-9012", project: "อาคารโรงงาน ระยอง VCS Asia", buildingType: "อาคารโรงงาน", area: 6200, province: "ระยอง", date: "2026-02-25", time: "13:00", type: "follow_up", assigned: "วิชัย", status: "done", note: "ติดตามผลลูกค้าหลังปิดขาย" },
  { id: 9, company: "บจ. นครสวรรค์โลหะ", contact: "บจ. นครสวรรค์โลหะ", phone: "088-901-2345", project: "อาคารโรงงาน นครสวรรค์", buildingType: "อาคารโรงงาน", area: 5400, province: "นครสวรรค์", date: "2026-03-15", time: "14:00", type: "follow_up", assigned: "กาญจนา", status: "done", note: "โทรติดตามความพึงพอใจลูกค้า" },
  { id: 10, company: "บจ. อุตรดิตถ์โลหะ", contact: "บจ. อุตรดิตถ์โลหะ", phone: "087-890-1234", project: "อาคารสำเร็จรูป อุตรดิตถ์", buildingType: "อาคารสำเร็จรูป", area: 2800, province: "อุตรดิตถ์", date: "2026-07-10", time: "10:00", type: "presentation", assigned: "วิภา", status: "cancelled", note: "ลูกค้าขอเลื่อนนัด" },
];

// ─── CONTRACTS ────────────────────────────────────────────────
export type ContractStatus = "draft" | "active" | "completed" | "cancelled";

export const contractStatusLabel: Record<ContractStatus, string> = {
  draft: "ร่าง", active: "มีผล", completed: "เสร็จสิ้น", cancelled: "ยกเลิก",
};
export const contractStatusColor: Record<ContractStatus, { bg: string; text: string }> = {
  draft:     { bg: "#f0f0f5", text: "#6b7280" },
  active:    { bg: "#dbeafe", text: "#3b82f6" },
  completed: { bg: "#e5faf0", text: "#22c55e" },
  cancelled: { bg: "#fdeaed", text: "#f04d6a" },
};

export type ContractMock = {
  id: string; client: string; contact: string; phone: string;
  project: string; value: number; deposit: number; remaining: number;
  agentName: string; signDate: string; transferDate: string;
  status: ContractStatus; quotationRef?: string;
};

export const contracts: ContractMock[] = [
  { id: "C-2026-001", client: "บจ. ไทยสตีล", contact: "คุณสมชาย ใจดี", phone: "081-234-5678", project: "โกดังสินค้า บจ. ไทยสตีล", value: 1800000, deposit: 540000, remaining: 1260000, agentName: "สมชาย", signDate: "2026-04-01", transferDate: "2026-07-31", status: "active", quotationRef: "Q-2026-0089" },
  { id: "C-2026-002", client: "บจ. ซีซีเอส", contact: "คุณกาญจนา ม.", phone: "082-345-6789", project: "อาคารโรงงาน บจ. ซีซีเอส เชียงใหม่", value: 3200000, deposit: 960000, remaining: 2240000, agentName: "วิภา", signDate: "2026-05-15", transferDate: "2026-08-15", status: "active", quotationRef: "Q-2026-0095" },
  { id: "C-2026-003", client: "บจ. นครสวรรค์โลหะ", contact: "บจ. นครสวรรค์โลหะ", phone: "088-901-2345", project: "อาคารโรงงาน นครสวรรค์", value: 5400000, deposit: 5400000, remaining: 0, agentName: "สมชาย", signDate: "2026-01-01", transferDate: "2026-03-31", status: "completed" },
  { id: "C-2026-004", client: "VCS Asia", contact: "VCS Asia (ระยอง)", phone: "085-678-9012", project: "อาคารโรงงาน ระยอง VCS Asia", value: 6200000, deposit: 6200000, remaining: 0, agentName: "วิชัย", signDate: "2025-11-01", transferDate: "2026-02-28", status: "completed", quotationRef: "Q-2026-0092" },
  { id: "C-2026-005", client: "บจ. สมุทรโกดัง", contact: "คุณดารัล ส.", phone: "084-567-8901", project: "โกดังสินค้า ปากน้ำ", value: 2000000, deposit: 0, remaining: 2000000, agentName: "สมชาย", signDate: "—", transferDate: "—", status: "draft", quotationRef: "Q-2026-0097" },
  { id: "C-2026-006", client: "หจก. ราชบุรีโลหะ", contact: "คุณประยุทธ ร.", phone: "083-456-7890", project: "อาคารโรงงาน PEB ราชบุรี", value: 760000, deposit: 190000, remaining: 570000, agentName: "วิภา", signDate: "2026-04-20", transferDate: "2026-09-01", status: "active", quotationRef: "Q-2026-0091" },
];

// ─── INVOICES ─────────────────────────────────────────────────
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

export const invoiceStatusLabel: Record<InvoiceStatus, string> = {
  draft: "ร่าง", sent: "ส่งแล้ว", paid: "ชำระแล้ว", overdue: "เกินกำหนด", cancelled: "ยกเลิก",
};
export const invoiceStatusColor: Record<InvoiceStatus, { bg: string; text: string }> = {
  draft:     { bg: "#f0f0f5", text: "#6b7280" },
  sent:      { bg: "#dce5f0", text: "#003366" },
  paid:      { bg: "#e5faf0", text: "#22c55e" },
  overdue:   { bg: "#fdeaed", text: "#f04d6a" },
  cancelled: { bg: "#f5f5f5", text: "#9ca3af" },
};

export type InvoiceMock = {
  id: string; client: string; project: string; contractRef: string;
  issueDate: string; dueDate: string;
  subtotal: number; vatRate: number; vatAmount: number; total: number;
  status: InvoiceStatus; milestone: string; note: string;
  projectId?: number; installmentNo?: number;
};

export const invoices: InvoiceMock[] = [
  { id: "INV-2026-0041", client: "บจ. ไทยสตีล",    project: "โกดังสินค้า บจ. ไทยสตีล",    contractRef: "C-2026-001", issueDate: "2026-05-01", dueDate: "2026-05-30", subtotal: 504673,  vatRate: 7, vatAmount: 35327, total: 540000,  status: "paid",    milestone: "งวดที่ 1 (30%)", note: "มัดจำเริ่มโครงการ",       projectId: 1, installmentNo: 1 },
  { id: "INV-2026-0055", client: "VCS Asia",        project: "อาคารโรงงาน ระยอง VCS Asia",  contractRef: "C-2026-004", issueDate: "2026-02-20", dueDate: "2026-03-15", subtotal: 1158879, vatRate: 7, vatAmount: 81121, total: 1240000, status: "paid",    milestone: "งวดสุดท้าย",     note: "ปิดโครงการครบถ้วน",       projectId: 8, installmentNo: 4 },
  { id: "INV-2026-0062", client: "บจ. ซีซีเอส",    project: "อาคารโรงงาน บจ. ซีซีเอส เชียงใหม่", contractRef: "C-2026-002", issueDate: "2026-06-01", dueDate: "2026-06-30", subtotal: 747664, vatRate: 7, vatAmount: 52336, total: 800000,  status: "sent",    milestone: "งวดที่ 2 (30%)", note: "ดำเนินโครงการงวดที่ 2", projectId: 2, installmentNo: 2 },
  { id: "INV-2026-0068", client: "หจก. ราชบุรีโลหะ", project: "อาคารโรงงาน PEB ราชบุรี", contractRef: "C-2026-006", issueDate: "2026-05-20", dueDate: "2026-06-15", subtotal: 177570,  vatRate: 7, vatAmount: 12430, total: 190000,  status: "overdue", milestone: "งวดที่ 1",       note: "มัดจำ 25%",               projectId: 5, installmentNo: 1 },
  { id: "INV-2026-0071", client: "บจ. สมุทรโกดัง", project: "โกดังสินค้า ปากน้ำ",         contractRef: "C-2026-005", issueDate: "2026-07-01", dueDate: "2026-07-15", subtotal: 373832,  vatRate: 7, vatAmount: 26168, total: 400000,  status: "draft",   milestone: "มัดจำ (20%)",    note: "รอลูกค้าอนุมัติ",        projectId: 3, installmentNo: 1 },
];

// ─── PAYMENTS ─────────────────────────────────────────────────
export type PaymentMethod = "transfer" | "cheque" | "cash";
export type PaymentStatus = "confirmed" | "pending" | "cancelled";

export const paymentMethodLabel: Record<PaymentMethod, string> = {
  transfer: "โอนเงิน", cheque: "เช็ค", cash: "เงินสด",
};
export const paymentMethodColor: Record<PaymentMethod, { bg: string; text: string }> = {
  transfer: { bg: "#dce5f0", text: "#003366" },
  cheque:   { bg: "#f0f4f8", text: "#2D2D2D" },
  cash:     { bg: "#e5faf0", text: "#22c55e" },
};
export const paymentStatusLabel: Record<PaymentStatus, string> = {
  confirmed: "ยืนยันแล้ว", pending: "รอยืนยัน", cancelled: "ยกเลิก",
};
export const paymentStatusColor: Record<PaymentStatus, { bg: string; text: string }> = {
  confirmed: { bg: "#e5faf0", text: "#22c55e" },
  pending:   { bg: "#fef3cd", text: "#f59e0b" },
  cancelled: { bg: "#fdeaed", text: "#f04d6a" },
};

export type PaymentMock = {
  id: string; invoiceRef: string; client: string; amount: number;
  method: PaymentMethod; paidDate: string; salesPerson: string;
  status: PaymentStatus; note: string;
};

export const payments: PaymentMock[] = [
  { id: "PAY-2026-001", invoiceRef: "INV-2026-0041", client: "บจ. ไทยสตีล", amount: 540000, method: "transfer", paidDate: "2026-05-28", salesPerson: "สมชาย", status: "confirmed", note: "งวดที่ 1 วางรากฐาน" },
  { id: "PAY-2026-002", invoiceRef: "INV-2026-0055", client: "VCS Asia", amount: 1240000, method: "cheque", paidDate: "2026-03-14", salesPerson: "วิชัย", status: "confirmed", note: "งวดสุดท้าย ส่งมอบแล้ว" },
  { id: "PAY-2026-003", invoiceRef: "INV-2026-0062", client: "บจ. ซีซีเอส", amount: 800000, method: "transfer", paidDate: "2026-06-20", salesPerson: "วิภา", status: "confirmed", note: "งวดที่ 2 ดำเนินโครงการ" },
  { id: "PAY-2026-004", invoiceRef: "INV-2026-0071", client: "คุณสมชาย", amount: 400000, method: "cash", paidDate: "—", salesPerson: "สมชาย", status: "pending", note: "มัดจำ รอยืนยันสลิป" },
];

// ─── EXPENSES ─────────────────────────────────────────────────────
export type ExpenseCategory = "travel" | "printing" | "testing" | "equipment" | "other";
export type BillingStatus = "billable" | "not_billable" | "billed";

export const expenseCategoryLabel: Record<ExpenseCategory, string> = {
  travel: "เดินทาง", printing: "พิมพ์เอกสาร", testing: "ทดสอบ", equipment: "อุปกรณ์", other: "อื่นๆ",
};
export const billingStatusLabel: Record<BillingStatus, string> = {
  billable: "เรียกเก็บได้", not_billable: "ไม่เรียกเก็บ", billed: "เรียกเก็บแล้ว",
};
export const billingStatusColor: Record<BillingStatus, { bg: string; text: string }> = {
  billable: { bg: "#e5faf0", text: "#22c55e" },
  not_billable: { bg: "#fdeaed", text: "#f04d6a" },
  billed: { bg: "#f0f0f5", text: "#6b7280" },
};
export type ExpenseMock = {
  id: string; date: string; client: string; project: string;
  category: ExpenseCategory; amount: number; description: string;
  billingStatus: BillingStatus;
};
export const expenses: ExpenseMock[] = [
  { id: "EXP-001", date: "2026-06-10", client: "บจ. ไทยสตีล", project: "โกดังสินค้า บจ. ไทยสตีล", category: "travel", amount: 4800, description: "ค่าเดินทางนัดพบลูกค้า นนทบุรี", billingStatus: "billable" },
  { id: "EXP-002", date: "2026-06-12", client: "บจ. ซีซีเอส", project: "อาคารโรงงาน บจ. ซีซีเอส เชียงใหม่", category: "printing", amount: 1200, description: "พิมพ์เอกสารนำเสนองาน จำนวน 4 ชุด", billingStatus: "billed" },
  { id: "EXP-003", date: "2026-06-14", client: "VCS Asia", project: "อาคารโรงงาน ระยอง VCS Asia", category: "testing", amount: 32000, description: "ค่าตรวจสอบข้อมูลโครงการ", billingStatus: "billable" },
  { id: "EXP-004", date: "2026-06-18", client: "บจ. สมุทรโกดัง", project: "โกดังสินค้า ปากน้ำ", category: "travel", amount: 2800, description: "ค่าน้ำมันและทางด่วน", billingStatus: "not_billable" },
  { id: "EXP-005", date: "2026-06-20", client: "หจก. ราชบุรีโลหะ", project: "อาคารโรงงาน PEB ราชบุรี", category: "equipment", amount: 8500, description: "ค่าอุปกรณ์นำเสนองาน", billingStatus: "billable" },
];


// ─── MILESTONES ───────────────────────────────────────────────────
export type MilestoneMock = {
  id: number; title: string; projectId: number; position: number;
  type: "general" | "major"; dueDate: string; done: boolean;
};
export const milestones: MilestoneMock[] = [
  { id: 1, title: "สำรวจความต้องการและข้อกำหนดโครงการ", projectId: 1, position: 1, type: "general", dueDate: "2026-03-10", done: true },
  { id: 2, title: "ยืนยันสัญญาและรับมัดจำ", projectId: 1, position: 2, type: "major", dueDate: "2026-04-15", done: true },
  { id: 3, title: "ประสานงานเตรียมพร้อมโครงการ", projectId: 1, position: 3, type: "major", dueDate: "2026-05-20", done: false },
  { id: 4, title: "จัดส่งเอกสารประกอบโครงการ", projectId: 2, position: 1, type: "major", dueDate: "2026-06-30", done: false },
  { id: 5, title: "ปิดการขายและติดตามผล", projectId: 2, position: 2, type: "major", dueDate: "2026-07-15", done: false },
  { id: 6, title: "สรุปผลและปิดโครงการ", projectId: 3, position: 1, type: "major", dueDate: "2026-08-01", done: false },
];

// ─── MESSAGES ─────────────────────────────────────────────────────
export type MessageMock = {
  id: number; text: string; senderName: string; senderId: string; created: string;
};
export const messages: MessageMock[] = [
  { id: 1, text: "เอกสารสัญญา VCS Asia ผ่านการอนุมัติแล้ว ดำเนินการขั้นตอนถัดไปได้เลย", senderName: "สุรชัย", senderId: "surachai", created: "2026-06-20 09:15" },
  { id: 2, text: "ลูกค้า บจ. ซีซีเอส โอนเงินมัดจำมาแล้ว 30% รอตรวจสอบ statement", senderName: "วิภา", senderId: "wipa", created: "2026-06-20 10:30" },
  { id: 3, text: "งาน TKT-002 ได้สั่งวัสดุใหม่แล้ว ETA 3-5 วันทำการ", senderName: "สมชาย", senderId: "somchai", created: "2026-06-21 14:00" },
  { id: 4, text: "นัด site visit โครงการใหม่ที่นครสวรรค์ วันศุกร์ที่ 26 มิ.ย. เวลา 10:00", senderName: "กาญจนา", senderId: "kanchana", created: "2026-06-22 08:45" },
];

// ─── COMMISSION ───────────────────────────────────────────────────
export type CommissionStatus = "pending" | "approved" | "paid";

export const commissionStatusLabel: Record<CommissionStatus, string> = {
  pending: "รอการอนุมัติ", approved: "อนุมัติแล้ว", paid: "จ่ายแล้ว",
};
export const commissionStatusColor: Record<CommissionStatus, { bg: string; text: string }> = {
  pending:  { bg: "#fef3cd", text: "#f59e0b" },
  approved: { bg: "#dbeafe", text: "#3b82f6" },
  paid:     { bg: "#e5faf0", text: "#22c55e" },
};

export type CommissionMock = {
  id: string;
  quotationId: string;
  projectTitle: string;
  client: string;
  closedDate: string;
  dealValue: number;
  commissionRate: number;
  commissionAmount: number;
  status: CommissionStatus;
  paidDate?: string;
  period: string;
};

export const commissions: CommissionMock[] = [
  { id: "COM-2026-001", quotationId: "Q-2026-0089", projectTitle: "โกดังสินค้า บจ. ไทยสตีล",         client: "บจ. ไทยสตีล",          closedDate: "2026-05-15", dealValue: 1800000, commissionRate: 5, commissionAmount: 90000,  status: "paid",     paidDate: "2026-06-01", period: "พ.ค. 2569" },
  { id: "COM-2026-002", quotationId: "Q-2026-0092", projectTitle: "อาคารโรงงาน ระยอง VCS Asia",      client: "VCS Asia Co., Ltd.",     closedDate: "2025-11-10", dealValue: 6200000, commissionRate: 5, commissionAmount: 310000, status: "paid",     paidDate: "2026-01-10", period: "พ.ย. 2568" },
  { id: "COM-2026-003", quotationId: "Q-2026-0099", projectTitle: "อาคารโรงงาน นครสวรรค์",          client: "บจ. นครสวรรค์โลหะ",     closedDate: "2026-04-05", dealValue: 5400000, commissionRate: 5, commissionAmount: 270000, status: "approved", period: "เม.ย. 2569" },
  { id: "COM-2026-004", quotationId: "Q-2026-0097", projectTitle: "โกดังสินค้า ปากน้ำ",             client: "บจ. สมุทรโกดัง",        closedDate: "2026-06-18", dealValue: 2000000, commissionRate: 5, commissionAmount: 100000, status: "pending",  period: "มิ.ย. 2569" },
  { id: "COM-2026-005", quotationId: "Q-2026-0095", projectTitle: "อาคารโรงงาน บจ. ซีซีเอส เชียงใหม่", client: "บจ. ซีซีเอส",        closedDate: "2026-06-10", dealValue: 3200000, commissionRate: 5, commissionAmount: 160000, status: "pending",  period: "มิ.ย. 2569" },
];

// ─── CONTACTS ─────────────────────────────────────────────────────
export type ContactMock = {
  id: number;
  customerId: number;
  company: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  lineId?: string;
  isPrimary: boolean;
};

export const contacts: ContactMock[] = [
  { id: 1,  customerId: 1, company: "บจ. ไทยสตีล",          name: "คุณสมชาย ใจดี",       role: "กรรมการผู้จัดการ",     phone: "081-234-5678", email: "somchai@thaisteel.co.th",  lineId: "somchai.td",   isPrimary: true },
  { id: 2,  customerId: 1, company: "บจ. ไทยสตีล",          name: "คุณนารี สุขสวัสดิ์",   role: "ฝ่ายจัดซื้อ",           phone: "081-234-5679", email: "nari@thaisteel.co.th",     lineId: "",             isPrimary: false },
  { id: 3,  customerId: 2, company: "บจ. ซีซีเอส",           name: "คุณกาญจนา ม.",         role: "ผู้จัดการโครงการ",      phone: "082-345-6789", email: "kanjana@ccs.co.th",        lineId: "kanjana_ccs",  isPrimary: true },
  { id: 4,  customerId: 2, company: "บจ. ซีซีเอส",           name: "คุณธีรศักดิ์ ว.",       role: "วิศวกรโครงการ",         phone: "082-345-6780", email: "teerasak@ccs.co.th",       lineId: "",             isPrimary: false },
  { id: 5,  customerId: 3, company: "หจก. ราชบุรีโลหะ",      name: "คุณประยุทธ ร.",         role: "เจ้าของกิจการ",         phone: "083-456-7890", email: "prayuth@rajburi.co.th",    lineId: "prayuth_r",    isPrimary: true },
  { id: 6,  customerId: 4, company: "บจ. สมุทรโกดัง",        name: "คุณดารัล ส.",           role: "กรรมการ",               phone: "084-567-8901", email: "darat@smgodown.co.th",     lineId: "darat_sg",     isPrimary: true },
  { id: 7,  customerId: 4, company: "บจ. สมุทรโกดัง",        name: "คุณนพดล จ.",            role: "ผู้จัดการโครงการ",      phone: "084-567-8902", email: "noppadol@smgodown.co.th",  lineId: "",             isPrimary: false },
  { id: 8,  customerId: 5, company: "VCS Asia Co., Ltd.",     name: "Mr. Kevin Lim",         role: "Managing Director",    phone: "085-678-9012", email: "vcs@vcsasia.com",          lineId: "kevinlim.vcs", isPrimary: true },
  { id: 9,  customerId: 5, company: "VCS Asia Co., Ltd.",     name: "คุณสุภาพร ท.",          role: "Procurement Manager",  phone: "085-678-9013", email: "supaporn@vcsasia.com",     lineId: "",             isPrimary: false },
  { id: 10, customerId: 6, company: "บจ. แม่สอดโลหะ",        name: "คุณสุรัตน์ ล.",         role: "เจ้าของกิจการ",         phone: "086-789-0123", email: "surat@maesot.co.th",       lineId: "surat_ms",     isPrimary: true },
  { id: 11, customerId: 7, company: "บจ. อุตรดิตถ์โลหะ",    name: "คุณปรีชา ด.",           role: "ผู้จัดการทั่วไป",       phone: "087-890-1234", email: "preecha@uttaradit.co.th",  lineId: "",             isPrimary: true },
  { id: 12, customerId: 8, company: "บจ. นครสวรรค์โลหะ",    name: "คุณวิชัย น.",           role: "กรรมการผู้จัดการ",     phone: "088-901-2345", email: "nakhon@nsloha.co.th",      lineId: "wichai_ns",    isPrimary: true },
  { id: 13, customerId: 8, company: "บจ. นครสวรรค์โลหะ",    name: "คุณรัตนา ส.",           role: "ผู้ช่วยผู้จัดการ",     phone: "088-901-2346", email: "rattana@nsloha.co.th",     lineId: "",             isPrimary: false },
];

// ─── TAGS ─────────────────────────────────────────────────────────
export type TagVisibility = "public" | "team" | "private";
export type TagMock = {
  id: number; title: string; visibility: TagVisibility; color: string; created: string;
};
export const tags: TagMock[] = [
  { id: 1, title: "VIP", visibility: "public", color: "#f59e0b", created: "2026-01-01" },
  { id: 2, title: "ลูกค้าประจำ", visibility: "public", color: "#22c55e", created: "2026-01-01" },
  { id: 3, title: "ติดตามด่วน", visibility: "team", color: "#f04d6a", created: "2026-02-01" },
  { id: 4, title: "โครงการใหญ่", visibility: "public", color: "#003366", created: "2026-02-01" },
  { id: 5, title: "รอ BOQ", visibility: "team", color: "#6b7280", created: "2026-03-01" },
];

// ─── NOTES ────────────────────────────────────────────────────────
export type NoteCategory = "ลูกค้า" | "ดีล" | "ประชุม" | "ทั่วไป";
export type NoteMock = {
  id: number; title: string; content: string;
  category: NoteCategory; pinned: boolean;
  customerId?: number; customerName?: string;
  author: string; createdAt: string; updatedAt: string;
  color: string;
};

export const noteCategoryColor: Record<NoteCategory, { bg: string; text: string; dot: string }> = {
  ลูกค้า:  { bg: "#dce5f0", text: "#003366", dot: "#003366" },
  ดีล:     { bg: "#fef3cd", text: "#b45309", dot: "#f59e0b" },
  ประชุม:  { bg: "#f0fdf4", text: "#15803d", dot: "#22c55e" },
  ทั่วไป:  { bg: "#f0f0f5", text: "#6b7280", dot: "#9ca3af" },
};

export const notes: NoteMock[] = [
  {
    id: 1, title: "สรุปการโทรหา บจ. ไทยสตีล", category: "ลูกค้า", pinned: true,
    content: "โทรคุยกับคุณสมชาย เรื่องความคืบหน้าโครงการโกดัง\n- ลูกค้าพอใจกับ progress 65%\n- ขอให้ส่งรายงานรายสัปดาห์\n- จะนัดตรวจงานวันที่ 5 ก.ค. 2569",
    customerId: 1, customerName: "บจ. ไทยสตีล",
    author: "สมชาย", createdAt: "2026-06-20 14:30", updatedAt: "2026-06-20 14:30", color: "#003366",
  },
  {
    id: 2, title: "ประชุมทีมขาย ประจำสัปดาห์", category: "ประชุม", pinned: true,
    content: "ประชุมวันจันทร์ที่ 23 มิ.ย. 2569\n\nสรุปประเด็น:\n1. Pipeline รวม ฿14.6M (active 6 deals)\n2. เป้าหมาย Q2 ต้องปิด 2 deals เพิ่ม\n3. ลีดใหม่จาก นิคมฯ อมตะ 3 ราย\n\nAction items:\n- วิภา: follow up บจ. อุตรดิตถ์โลหะ ภายใน 3 วัน\n- วิชัย: นำเสนอ spec ให้ VCS Asia รอบ 2",
    author: "กาญจนา", createdAt: "2026-06-23 10:00", updatedAt: "2026-06-23 10:45", color: "#15803d",
  },
  {
    id: 3, title: "ข้อเสนอพิเศษ บจ. ซีซีเอส", category: "ดีล", pinned: false,
    content: "ลูกค้าขอส่วนลดเพิ่ม 5% สำหรับโครงการ PREFAB เชียงใหม่\n\nพิจารณา:\n- มูลค่าโครงการ ฿3.2M\n- ส่วนลด 5% = ฿160,000\n- Margin ยังคุ้มอยู่ถ้าได้ order ครั้งถัดไป\n\nตัดสินใจ: อนุมัติส่วนลด 3% เป็นพิเศษ รอ confirm",
    customerId: 2, customerName: "บจ. ซีซีเอส",
    author: "กาญจนา", createdAt: "2026-06-18 16:00", updatedAt: "2026-06-19 09:00", color: "#b45309",
  },
  {
    id: 4, title: "ติดต่อ Mr. Kevin Lim (VCS Asia)", category: "ลูกค้า", pinned: false,
    content: "อีเมลถึง Kevin เรื่องโครงการระยอง Phase 2\n- Kevin สนใจขยายโกดังอีก 2,000 ตร.ม.\n- Budget ประมาณ ฿8-10M\n- ต้องการ quote ภายใน 2 สัปดาห์\n\nNext step: ส่ง BOQ เบื้องต้นภายใน 27 มิ.ย.",
    customerId: 5, customerName: "VCS Asia Co., Ltd.",
    author: "วิชัย", createdAt: "2026-06-22 11:15", updatedAt: "2026-06-22 11:15", color: "#003366",
  },
  {
    id: 5, title: "Checklist ปิดโครงการ RANBUILD", category: "ทั่วไป", pinned: false,
    content: "สิ่งที่ต้องทำก่อนส่งมอบโครงการ RANBUILD นครสวรรค์:\n\n☑ ตรวจสอบงาน structural ครบ\n☑ ทดสอบระบบ drainage\n☑ ส่ง as-built drawing ให้ลูกค้า\n☑ ทำ punch list ร่วมกับลูกค้า\n☐ รับเงินงวดสุดท้าย\n☐ ออก warranty certificate",
    author: "สมชาย", createdAt: "2026-06-15 08:00", updatedAt: "2026-06-21 13:00", color: "#6b7280",
  },
  {
    id: 6, title: "Follow up หจก. ราชบุรีโลหะ", category: "ดีล", pinned: false,
    content: "ดีลโกดัง PEB ราชบุรี 760K\nลูกค้ายังลังเลเรื่องราคา เปรียบเทียบกับคู่แข่ง\n\nจุดแข็งที่ต้องเน้น:\n- Benjamin มาตรฐาน ISO\n- รับประกัน 5 ปี\n- ส่งได้เร็วกว่า (8 สัปดาห์)\n\nวางแผนโทรติดตามอีกครั้ง 25 มิ.ย.",
    customerId: 3, customerName: "หจก. ราชบุรีโลหะ",
    author: "วิภา", createdAt: "2026-06-17 09:30", updatedAt: "2026-06-17 09:30", color: "#b45309",
  },
];

// ─── PIPELINE DEALS (shared: Dealer + HQ) ─────────────────────────
export type PipelineOutcome = "active" | "won" | "lost";
export type PipelineTask = { id: number; text: string; done: boolean };
export type PipelineFile = { name: string; size: string };

export type PipelineDealMock = {
  id: number;
  customerId: number;
  customer: string;
  project: string;
  value: number;
  stageId: number;
  assigned: string;
  dealer: string;
  dealerColor: string;
  tasks: PipelineTask[];
  files: PipelineFile[];
  outcome: PipelineOutcome;
  createdAt: string;
  lostReason?: string;
};

// ─── Unified Sales Pipeline Statuses ──────────────────────────────
export const PIPELINE_STATUSES = {
  new_lead:    "ลีดใหม่",
  contacted:   "ติดต่อแล้ว",
  meeting:     "นัดประชุม",
  quotation:   "เสนอราคา",
  negotiation: "เจรจา",
  won:         "ปิดการขายสำเร็จ",
  lost:        "ปิดการขายไม่สำเร็จ",
} as const;

export const PIPELINE_STAGE_PROGRESS: Record<number, number> = {
  1: 10, 2: 25, 4: 50, 5: 70, 6: 85, 7: 100, 8: 0,
};

export const LOST_REASONS = [
  "ราคาสูงเกินไป",
  "เลือกคู่แข่ง",
  "โครงการยกเลิก",
  "ไม่มีงบประมาณ",
  "ไม่มีการตอบสนอง",
  "อื่นๆ",
] as const;

export type LostReason = typeof LOST_REASONS[number];

export type PipelineStage = { id: number; name: string; color: string };

export const pipelineStages: PipelineStage[] = [
  { id: 1, name: "ลีดใหม่",              color: "#6b7280" },
  { id: 2, name: "ติดต่อแล้ว",           color: "#003366" },
  { id: 4, name: "นัดประชุม",            color: "#0369a1" },
  { id: 5, name: "เสนอราคา",            color: "#f59e0b" },
  { id: 6, name: "เจรจา",               color: "#475569" },
  { id: 7, name: "สำเร็จ",  color: "#22c55e" },
  { id: 8, name: "ไม่สำเร็จ", color: "#f04d6a" },
];

export const pipelineDeals: PipelineDealMock[] = [
  // ── สาขาเชียงใหม่ ──
  {
    id: 1, customerId: 3, customer: "หจก. ราชบุรีโลหะ", project: "RANBUILD PEB ราชบุรี",
    value: 760000, stageId: 2, assigned: "วิภา", dealer: "สาขาเชียงใหม่", dealerColor: "#003366",
    outcome: "active", createdAt: "2026-06-20",
    files: [],
    tasks: [
      { id: 1, text: "โทรหาลูกค้าครั้งแรก",    done: true  },
      { id: 2, text: "ส่งแคตตาล็อก Benjamin",  done: true  },
      { id: 3, text: "นัดประชุมออนไลน์",        done: false },
    ],
  },
  {
    id: 2, customerId: 7, customer: "บจ. อุตรดิตถ์โลหะ", project: "PREFAB อุตรดิตถ์",
    value: 2800000, stageId: 4, assigned: "วิภา", dealer: "สาขาเชียงใหม่", dealerColor: "#003366",
    outcome: "active", createdAt: "2026-06-15",
    files: [{ name: "presentation.pdf", size: "2.1MB" }],
    tasks: [
      { id: 4, text: "นำเสนอ Solution",  done: true  },
      { id: 5, text: "ส่งตัวอย่างวัสดุ", done: true  },
      { id: 6, text: "เยี่ยมชมสถานที่",  done: false },
      { id: 7, text: "สรุปความต้องการ", done: false },
    ],
  },
  {
    id: 3, customerId: 6, customer: "บจ. แม่สอดโลหะ", project: "EASYBUILD แม่สอด",
    value: 4100000, stageId: 4, assigned: "สมชาย", dealer: "สาขาเชียงใหม่", dealerColor: "#003366",
    outcome: "active", createdAt: "2026-06-10",
    files: [],
    tasks: [
      { id: 8,  text: "นำเสนอ Solution",     done: true },
      { id: 9,  text: "ดูพื้นที่โครงการ",       done: true },
      { id: 10, text: "จัดทำ BOQ เบื้องต้น", done: true },
    ],
  },
  {
    id: 4, customerId: 2, customer: "บจ. ซีซีเอส", project: "PREFAB บจ. ซีซีเอส เชียงใหม่",
    value: 3200000, stageId: 5, assigned: "กาญจนา", dealer: "สาขาเชียงใหม่", dealerColor: "#003366",
    outcome: "active", createdAt: "2026-05-28",
    files: [{ name: "quotation_Q2026-0095.pdf", size: "1.4MB" }, { name: "specs.xlsx", size: "340KB" }],
    tasks: [
      { id: 11, text: "จัดทำใบเสนอราคา",        done: true  },
      { id: 12, text: "ส่งใบเสนอราคาให้ลูกค้า", done: true  },
      { id: 13, text: "ติดตามผล",               done: false },
      { id: 14, text: "อธิบาย spec เพิ่มเติม",  done: false },
    ],
  },
  {
    id: 5, customerId: 4, customer: "บจ. สมุทรโกดัง", project: "EASYBUILD ปากน้ำ",
    value: 2000000, stageId: 6, assigned: "สมชาย", dealer: "สาขาเชียงใหม่", dealerColor: "#003366",
    outcome: "active", createdAt: "2026-05-20",
    files: [{ name: "contract_draft.docx", size: "520KB" }],
    tasks: [
      { id: 15, text: "เจรจาเงื่อนไขราคา", done: true  },
      { id: 16, text: "ปรับแก้สัญญา",      done: true  },
      { id: 17, text: "นัดเซ็นสัญญา",      done: false },
    ],
  },
  {
    id: 6, customerId: 1, customer: "บจ. ไทยสตีล", project: "EASYBUILD บจ. ไทยสตีล",
    value: 1800000, stageId: 6, assigned: "วิชัย", dealer: "สาขาเชียงใหม่", dealerColor: "#003366",
    outcome: "active", createdAt: "2026-05-01",
    files: [{ name: "signed_contract.pdf", size: "1.8MB" }],
    tasks: [
      { id: 18, text: "ลูกค้าอนุมัติในหลักการ", done: true },
      { id: 19, text: "เตรียมเอกสารสัญญา",      done: true },
      { id: 20, text: "เซ็นสัญญาสำเร็จ",        done: true },
    ],
  },
  {
    id: 7, customerId: 5, customer: "VCS Asia Co., Ltd.", project: "RANBUILD ระยอง VCS Asia",
    value: 6200000, stageId: 7, assigned: "วิชัย", dealer: "สาขาเชียงใหม่", dealerColor: "#003366",
    outcome: "won", createdAt: "2025-11-10", files: [], tasks: [],
  },
  {
    id: 8, customerId: 8, customer: "บจ. นครสวรรค์โลหะ", project: "RANBUILD นครสวรรค์",
    value: 5400000, stageId: 7, assigned: "สมชาย", dealer: "สาขาเชียงใหม่", dealerColor: "#003366",
    outcome: "won", createdAt: "2026-04-05", files: [], tasks: [],
  },
  // ── สาขานนทบุรี ──
  {
    id: 9, customerId: 1, customer: "บจ. ไทยสตีล", project: "EASYBUILD Phase 2 นนทบุรี",
    value: 3500000, stageId: 2, assigned: "ปรีดา", dealer: "สาขานนทบุรี", dealerColor: "#f59e0b",
    outcome: "active", createdAt: "2026-06-18",
    files: [],
    tasks: [
      { id: 30, text: "ส่งเอกสาร Proposal",  done: true  },
      { id: 31, text: "นัดประชุมลูกค้า",       done: false },
    ],
  },
  {
    id: 10, customerId: 2, customer: "บจ. ซีซีเอส", project: "PREFAB นนทบุรี",
    value: 5800000, stageId: 5, assigned: "สายชล", dealer: "สาขานนทบุรี", dealerColor: "#f59e0b",
    outcome: "active", createdAt: "2026-05-15",
    files: [{ name: "BOQ_NTB.xlsx", size: "512KB" }, { name: "quote_v2.pdf", size: "1.1MB" }],
    tasks: [
      { id: 32, text: "จัดทำ BOQ ละเอียด",    done: true  },
      { id: 33, text: "ส่งใบเสนอราคา",        done: true  },
      { id: 34, text: "นำเสนอต่อ MD",         done: false },
      { id: 35, text: "ขอ final approval",     done: false },
    ],
  },
  {
    id: 11, customerId: 5, customer: "VCS Asia Co., Ltd.", project: "คลังสินค้า Nonthaburi",
    value: 9200000, stageId: 6, assigned: "ปรีดา", dealer: "สาขานนทบุรี", dealerColor: "#f59e0b",
    outcome: "active", createdAt: "2026-04-20",
    files: [{ name: "contract_VCS_NTB.pdf", size: "2.3MB" }],
    tasks: [
      { id: 36, text: "เจรจาเงื่อนไข",        done: true },
      { id: 37, text: "ปรับ scope งาน",        done: true },
      { id: 38, text: "เซ็นสัญญา",            done: false },
    ],
  },
  // ── สาขาระยอง ──
  {
    id: 12, customerId: 4, customer: "บจ. สมุทรโกดัง", project: "EASYBUILD Rayong Eastern",
    value: 4400000, stageId: 4, assigned: "มานิตย์", dealer: "สาขาระยอง", dealerColor: "#22c55e",
    outcome: "active", createdAt: "2026-06-08",
    files: [{ name: "layout_Rayong.dwg", size: "6.1MB" }],
    tasks: [
      { id: 40, text: "นำเสนอ Solution PEB",   done: true  },
      { id: 41, text: "ดูพื้นที่โครงการระยอง",  done: true  },
      { id: 42, text: "จัดทำแผนงานเบื้องต้น",   done: false },
    ],
  },
  {
    id: 13, customerId: 3, customer: "หจก. ราชบุรีโลหะ", project: "คลังสินค้าเขต EEC",
    value: 7100000, stageId: 7, assigned: "มานิตย์", dealer: "สาขาระยอง", dealerColor: "#22c55e",
    outcome: "won", createdAt: "2026-03-10",
    files: [{ name: "signed_eec.pdf", size: "1.9MB" }],
    tasks: [
      { id: 43, text: "เซ็นสัญญา", done: true },
      { id: 44, text: "รับมัดจำ",  done: true },
    ],
  },
];

// ─── RECENT ACTIVITY ──────────────────────────────────────────
// เหมือน "กิจกรรมล่าสุด" ในระบบต้นฉบับ (localhost:8000)
export type ActivityType = "lead_status" | "task_done" | "quotation" | "payment" | "note";

export type RecentActivity = {
  id: number;
  type: ActivityType;
  user: string;        // ผู้ทำกิจกรรม
  userInitials: string;
  userColor: string;
  action: string;      // คำอธิบาย
  subject: string;     // ลีด/โครงการ/ใบเสนอราคา
  subjectId: string;
  product: string;     // EASYBUILD / PREFAB / RANBUILD / Custom
  newStatus?: string;  // สถานะใหม่ (เฉพาะ lead_status)
  timeAgo: string;     // "1 ชั่วโมงที่แล้ว"
};

// ─── OPPORTUNITIES ────────────────────────────────────────────────
export type OpportunityStage = "new_lead" | "contacted" | "meeting" | "quotation" | "negotiation" | "won" | "lost";
export type OpportunityStatus = "open" | "won" | "lost";

export const opportunityStageLabel: Record<OpportunityStage, string> = {
  new_lead:    "ลีดใหม่",
  contacted:   "ติดต่อแล้ว",
  meeting:     "นัดประชุม",
  quotation:   "เสนอราคา",
  negotiation: "เจรจา",
  won:         "ปิดการขายสำเร็จ",
  lost:        "ปิดการขายไม่สำเร็จ",
};

export const opportunityStageColor: Record<OpportunityStage, { bg: string; text: string }> = {
  new_lead:    { bg: "#f0f4f8", text: "#6b7280" },
  contacted:   { bg: "#dce5f0", text: "#003366" },
  meeting:     { bg: "#f3f0ff", text: "#7c3aed" },
  quotation:   { bg: "#fffbeb", text: "#b45309" },
  negotiation: { bg: "#fef3cd", text: "#92400e" },
  won:         { bg: "#e5faf0", text: "#15803d" },
  lost:        { bg: "#fdeaed", text: "#b91c1c" },
};

export const opportunityStatusLabel: Record<OpportunityStatus, string> = {
  open: "กำลังดำเนิน", won: "ปิดการขายสำเร็จ", lost: "ปิดการขายไม่สำเร็จ",
};

export const OPPORTUNITY_STAGE_SEQUENCE: OpportunityStage[] = [
  "new_lead", "contacted", "meeting", "quotation", "negotiation",
];

export const OPPORTUNITY_STAGE_PROGRESS: Record<OpportunityStage, number> = {
  new_lead: 10, contacted: 25, meeting: 50,
  quotation: 70, negotiation: 85, won: 100, lost: 0,
};

export type OpportunityMock = {
  id: number;
  title: string;
  customerId: number;
  client: string;
  contactId?: number;
  stage: OpportunityStage;
  probability: number;
  dealValue: number;
  expectedCloseDate: string;
  assignedTo: string[];
  status: OpportunityStatus;
  notes?: string;
  lostReason?: string;
  quotationId?: string;
  createdDate: string;
  lastActivity: string;
  dealerName?: string;
};

export const opportunities: OpportunityMock[] = [
  { id: 1, title: "EASYBUILD บจ. ไทยสตีล",          customerId: 1, client: "บจ. ไทยสตีล",          contactId: 1,  stage: "negotiation", probability: 75, dealValue: 1800000, expectedCloseDate: "2026-07-31", assignedTo: ["สมชาย","วิภา"],   status: "open",  quotationId: "Q-2026-0089", createdDate: "2026-04-01", lastActivity: "2026-06-20", dealerName: "สาขาเชียงใหม่", notes: "ลูกค้าสนใจมาก รอการอนุมัติจากผู้บริหาร" },
  { id: 2, title: "PREFAB บจ. ซีซีเอส เชียงใหม่",   customerId: 2, client: "บจ. ซีซีเอส",           contactId: 3,  stage: "quotation",   probability: 55, dealValue: 3200000, expectedCloseDate: "2026-08-15", assignedTo: ["วิชัย"],          status: "open",  quotationId: "Q-2026-0095", createdDate: "2026-05-15", lastActivity: "2026-06-22", dealerName: "สาขาเชียงใหม่", notes: "ส่งใบเสนอราคาไปแล้ว รอการตอบรับ" },
  { id: 3, title: "EASYBUILD ปากน้ำ",                customerId: 4, client: "บจ. สมุทรโกดัง",        contactId: 6,  stage: "meeting",     probability: 40, dealValue: 2000000, expectedCloseDate: "2026-10-31", assignedTo: ["วิชัย"],          status: "open",  quotationId: "Q-2026-0097", createdDate: "2026-06-18", lastActivity: "2026-06-24", dealerName: "สาขาเชียงใหม่", notes: "นัดพรีเซนต์วันที่ 3 ก.ค." },
  { id: 4, title: "RANBUILD PEB ราชบุรี",            customerId: 3, client: "หจก. ราชบุรีโลหะ",      contactId: 5,  stage: "contacted",   probability: 25, dealValue: 3100000, expectedCloseDate: "2026-09-30", assignedTo: ["วิภา"],           status: "open",  createdDate: "2026-06-01",  lastActivity: "2026-06-15", dealerName: "สาขาเชียงใหม่" },
  { id: 5, title: "EASYBUILD แม่สอด",                customerId: 6, client: "บจ. แม่สอดโลหะ",        contactId: 10, stage: "new_lead",    probability: 10, dealValue: 4100000, expectedCloseDate: "2026-12-31", assignedTo: ["สมชาย"],          status: "open",  createdDate: "2026-06-15",  lastActivity: "2026-06-15", dealerName: "สาขาเชียงใหม่" },
  { id: 6, title: "RANBUILD นครสวรรค์",              customerId: 8, client: "บจ. นครสวรรค์โลหะ",     contactId: 12, stage: "won",         probability: 100,dealValue: 5400000, expectedCloseDate: "2026-03-31", assignedTo: ["สมชาย"],          status: "won",   quotationId: "Q-2026-0099", createdDate: "2026-01-01",  lastActivity: "2026-03-31", dealerName: "สาขาเชียงใหม่" },
  { id: 7, title: "RANBUILD ระยอง VCS Asia",         customerId: 5, client: "VCS Asia Co., Ltd.",     contactId: 8,  stage: "won",         probability: 100,dealValue: 6200000, expectedCloseDate: "2026-02-28", assignedTo: ["วิชัย"],          status: "won",   quotationId: "Q-2026-0092", createdDate: "2025-11-01",  lastActivity: "2026-02-28", dealerName: "สาขาเชียงใหม่" },
  { id: 8, title: "PREFAB อุตรดิตถ์",               customerId: 7, client: "บจ. อุตรดิตถ์โลหะ",    contactId: 11, stage: "lost",        probability: 0,  dealValue: 2800000, expectedCloseDate: "2026-07-10", assignedTo: ["วิภา"],           status: "lost",  createdDate: "2026-05-01",  lastActivity: "2026-07-10", dealerName: "สาขาเชียงใหม่", notes: "ลูกค้าตัดสินใจใช้เจ้าอื่น", lostReason: "เลือกคู่แข่ง" },
  { id: 9, title: "PREFAB นนทบุรี Phase 2",          customerId: 2, client: "บจ. ซีซีเอส",           contactId: 3,  stage: "quotation",   probability: 60, dealValue: 5800000, expectedCloseDate: "2026-09-15", assignedTo: ["สายชล"],          status: "open",  createdDate: "2026-05-15",  lastActivity: "2026-06-20", dealerName: "สาขานนทบุรี" },
  { id: 10, title: "EASYBUILD Phase 2 นนทบุรี",     customerId: 1, client: "บจ. ไทยสตีล",          contactId: 1,  stage: "contacted",   probability: 25, dealValue: 3500000, expectedCloseDate: "2026-10-31", assignedTo: ["ปรีดา"],          status: "open",  createdDate: "2026-06-18",  lastActivity: "2026-06-18", dealerName: "สาขานนทบุรี" },
];

export const recentActivity: RecentActivity[] = [
  {
    id: 1, type: "lead_status", user: "สมชาย", userInitials: "สช", userColor: "#003366",
    action: "เปลี่ยนสถานะลีด", subject: "บจ. ไทยสตีล", subjectId: "#L-40322",
    product: "EASYBUILD", newStatus: "ออกใบเสนอราคา", timeAgo: "1 ชม. ที่แล้ว",
  },
  {
    id: 2, type: "task_done", user: "วิภา", userInitials: "วร", userColor: "#22c55e",
    action: "เสร็จสิ้นงาน", subject: "วางแผนงานโครงการ Phase 1", subjectId: "#T-002",
    product: "EASYBUILD", timeAgo: "3 ชม. ที่แล้ว",
  },
  {
    id: 3, type: "quotation", user: "กาญจนา", userInitials: "กม", userColor: "#f04d6a",
    action: "ส่งใบเสนอราคา", subject: "Q-2026-0095", subjectId: "Q-2026-0095",
    product: "PREFAB", timeAgo: "5 ชม. ที่แล้ว",
  },
  {
    id: 4, type: "lead_status", user: "DEALER", userInitials: "ดล", userColor: "#2D2D2D",
    action: "เปลี่ยนสถานะลีด", subject: "หจก. ราชบุรีโลหะ", subjectId: "#L-40324",
    product: "RANBUILD", newStatus: "เสนอบูเลท", timeAgo: "1 วันที่แล้ว",
  },
  {
    id: 5, type: "payment", user: "สมชาย", userInitials: "สช", userColor: "#003366",
    action: "บันทึกการชำระเงิน", subject: "บจ. ทีทีวาย อินเตอร์", subjectId: "#L-40327",
    product: "RANBUILD", timeAgo: "2 วันที่แล้ว",
  },
  {
    id: 6, type: "lead_status", user: "DEALER", userInitials: "ดล", userColor: "#2D2D2D",
    action: "เปลี่ยนสถานะลีด", subject: "บจ. สมุทรโกดัง", subjectId: "#L-40325",
    product: "EASYBUILD", newStatus: "กำลังรอรายละเอียด", timeAgo: "2 วันที่แล้ว",
  },
  {
    id: 7, type: "task_done", user: "วิชัย", userInitials: "วป", userColor: "#f59e0b",
    action: "เสร็จสิ้นงาน", subject: "รับมอบโครงการระยอง", subjectId: "#T-010",
    product: "RANBUILD", timeAgo: "5 วันที่แล้ว",
  },
  {
    id: 8, type: "lead_status", user: "HQ", userInitials: "HQ", userColor: "#C0C0C0",
    action: "เปลี่ยนสถานะลีด", subject: "บจ. ซีซีเอส", subjectId: "#L-40323",
    product: "PREFAB", newStatus: "ใหม่", timeAgo: "1 สัปดาห์ที่แล้ว",
  },
];

