// Mock data สำหรับ frontend (ยังไม่เชื่อม backend)
// ─── ROLE / SESSION ───────────────────────────────────────────
export type UserRole =
  | "SUPER_ADMIN"
  | "HQ_MANAGEMENT"
  | "HQ_STAFF"
  | "DEALER_ADMIN"
  | "DEALER_SALES"
  | "DEALER_SITE";

export type MockSession = {
  name: string;
  role: UserRole;
  dealerName: string;
  scopeAll: boolean; // true = HQ เห็นทุก dealer
};

export const sessions: Record<string, MockSession> = {
  hq: {
    name: "วิชัย ประสิทธิ์",
    role: "HQ_MANAGEMENT",
    dealerName: "Benjamin HQ",
    scopeAll: true,
  },
  dealer: {
    name: "สมชาย เชียงใหม่",
    role: "DEALER_ADMIN",
    dealerName: "Benjamin สาขาเชียงใหม่",
    scopeAll: false,
  },
};


// โครงสร้างอ้างอิง prisma/schema.prisma

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
  NEW:       { bg: "#f0f0f5",  text: "#6b7280" },
  WAITING:   { bg: "#e0f5fd",  text: "#0284c7" },
  BULLET:    { bg: "#fff4eb",  text: "#ea6c00" },
  QUOTED:    { bg: "#f0fdf4",  text: "#15803d" },
  PAID:      { bg: "#e6faf7",  text: "#0f766e" },
  CANCELLED: { bg: "#fdeaed",  text: "#f04d6a" },
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
  { title: "สำรวจไซต์ — โกดังแม่สอด", time: "10:00 - 11:00", place: "แม่สอด, ตาก", kind: "survey" },
  { title: "นัดลูกค้า — CCS บางใหญ่", time: "13:30 - 14:30", place: "บางใหญ่, นนทบุรี", kind: "meet" },
];

export const upcoming = [
  { title: "ส่งมอบ — โครงการ CCS-02", date: "30 มิ.ย. 2026", who: "บจ. ซีซีเอส", kind: "handover" },
  { title: "เริ่มติดตั้ง — โกดังปากน้ำ", date: "3 ก.ค. 2026", who: "คุณสมชาย", kind: "install" },
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
};

export const leads: LeadRow[] = [
  { id: "#L-40322", numId: 1, name: "บจ. ไทยสตีล", company: "บจ. ไทยสตีล", contact: "คุณสมชาย ใจดี", phone: "081-234-5678", email: "somchai@thaisteel.co.th", province: "นนทบุรี", product: "EASYBUILD", category: "โกดังสินค้า", status: "QUOTED", value: "฿1.2M", assigned: "สมชาย", source: "โทรเข้า", note: "ต้องการโกดัง 1,200 ตร.ม. พร้อมสำนักงาน", customerId: 1 },
  { id: "#L-40323", numId: 2, name: "บจ. ซีซีเอส", company: "บจ. ซีซีเอส", contact: "คุณกาญจนา ม.", phone: "082-345-6789", email: "kanchana@ccs.co.th", province: "เชียงใหม่", product: "PREFAB", category: "โรงงาน", status: "NEW", value: "฿480K", assigned: "วิภา", source: "เว็บไซต์", customerId: 2 },
  { id: "#L-40324", numId: 3, name: "หจก. ราชบุรีโลหะ", company: "หจก. ราชบุรีโลหะ", contact: "คุณประยุทธ ร.", phone: "083-456-7890", email: "prayut@rajburimetal.com", province: "ราชบุรี", product: "RANBUILD", category: "โรงงาน", status: "BULLET", value: "฿3.1M", assigned: "วิภา", source: "แนะนำ", note: "ขอต่อรองราคาค่าก่อสร้าง", customerId: 3 },
  { id: "#L-40325", numId: 4, name: "บจ. สมุทรโกดัง", company: "บจ. สมุทรโกดัง", contact: "คุณดารัล ส.", phone: "084-567-8901", email: "daran@samutwarehouse.co.th", province: "สมุทรปราการ", product: "EASYBUILD", category: "โกดังสินค้า", status: "WAITING", value: "฿2.0M", assigned: "สมชาย", source: "งานแสดงสินค้า", customerId: 4 },
  { id: "#L-40326", numId: 5, name: "บจ. นครสวรรค์โลหะ", company: "บจ. นครสวรรค์โลหะ", contact: "คุณวิชัย น.", phone: "085-678-9012", email: "wichai@nsmetal.co.th", province: "นครสวรรค์", product: "Custom", category: "งานตามแบบ", status: "WAITING", value: "฿760K", assigned: "กาญจนา", source: "Facebook", customerId: 8 },
  { id: "#L-40327", numId: 6, name: "บจ. ทีทีวาย", company: "บจ. ทีทีวาย อินเตอร์", contact: "คุณวิทยา ท.", phone: "086-789-0123", email: "wittaya@ttyinter.com", province: "นครสวรรค์", product: "RANBUILD", category: "โรงงาน", status: "PAID", value: "฿5.4M", assigned: "สมชาย", source: "แนะนำ", note: "ชำระเงินแล้ว รอทำสัญญา" },
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
  { id: 1, title: "โกดังสำเร็จรูป บจ. ไทยสตีล", client: "บจ. ไทยสตีล", status: "in_progress", progress: 65, start: "2026-04-01", due: "2026-07-31", assigned: ["สมชาย", "วิภา"], value: "฿1.8M", customerId: 1, quotationId: "Q-2026-0089" },
  { id: 2, title: "ระบบ ERP บจ. ซีซีเอส", client: "บจ. ซีซีเอส", status: "in_progress", progress: 28, start: "2026-05-15", due: "2026-08-15", assigned: ["วิชัย"], value: "฿3.2M", customerId: 2, quotationId: "Q-2026-0095" },
  { id: 3, title: "โกดังปากน้ำ พระปราชญ์", client: "คุณสมชาย", status: "not_started", progress: 0, start: "2026-07-01", due: "2026-10-31", assigned: [], value: "฿2.0M", customerId: 1, quotationId: "Q-2026-0097" },
  { id: 4, title: "โรงงาน RANBUILD นครสวรรค์", client: "บจ. นครสวรรค์โลหะ", status: "completed", progress: 100, start: "2026-01-01", due: "2026-03-31", assigned: ["สมชาย", "กาญจนา"], value: "฿5.4M", customerId: 8 },
  { id: 5, title: "โกดัง PEB ราชบุรี", client: "หจก. ราชบุรีโลหะ", status: "on_hold", progress: 40, start: "2026-03-01", due: "2026-09-01", assigned: ["วิภา"], value: "฿760K", customerId: 3, quotationId: "Q-2026-0091" },
  { id: 6, title: "EASYBUILD แม่สอด", client: "บจ. แม่สอดโลหะ", status: "in_progress", progress: 82, start: "2026-02-01", due: "2026-06-30", assigned: ["สมชาย"], value: "฿4.1M", customerId: 6 },
  { id: 7, title: "PREFAB อุตรดิตถ์", client: "บจ. อุตรดิตถ์โลหะ", status: "not_started", progress: 0, start: "2026-08-01", due: "2026-12-31", assigned: [], value: "฿2.8M", customerId: 7, quotationId: "Q-2026-0098" },
  { id: 8, title: "โกดังระยอง VCS Asia", client: "VCS Asia", status: "completed", progress: 100, start: "2025-11-01", due: "2026-02-28", assigned: ["วิชัย", "กาญจนา"], value: "฿6.2M", customerId: 5, quotationId: "Q-2026-0092" },
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
  { id: 1,  title: "สำรวจไซต์ บจ. ไทยสตีล",       project: "โกดังสำเร็จรูป บจ. ไทยสตีล", projectId: 1, priority: "urgent", status: "done",        statusTitle: "เสร็จแล้ว",      statusColor: "#22c55e", due: "2026-06-10", assigned: ["สมชาย"] },
  { id: 2,  title: "ออกแบบโครงสร้าง Phase 1",       project: "โกดังสำเร็จรูป บจ. ไทยสตีล", projectId: 1, priority: "high",   status: "in_progress", statusTitle: "กำลังทำ",       statusColor: "#003366", due: "2026-06-30", assigned: ["วิภา", "สมชาย"] },
  { id: 3,  title: "จัดซื้อเหล็กโครงสร้าง",         project: "โกดังสำเร็จรูป บจ. ไทยสตีล", projectId: 1, priority: "high",   status: "todo",        statusTitle: "รอดำเนินการ", statusColor: "#6b7280", due: "2026-07-05", assigned: [] },
  { id: 4,  title: "นำเสนอ ERP Blueprint",            project: "ระบบ ERP บจ. ซีซีเอส",        projectId: 2, priority: "urgent", status: "review",      statusTitle: "กำลังรีวิว",   statusColor: "#f59e0b", due: "2026-06-25", assigned: ["วิชัย"] },
  { id: 5,  title: "ทดสอบระบบ module HR",             project: "ระบบ ERP บจ. ซีซีเอส",        projectId: 2, priority: "normal", status: "todo",        statusTitle: "รอดำเนินการ", statusColor: "#6b7280", due: "2026-07-15", assigned: ["วิชัย"] },
  { id: 6,  title: "ส่งมอบโครงการ RANBUILD",          project: "โรงงาน RANBUILD นครสวรรค์",   projectId: 4, priority: "normal", status: "done",        statusTitle: "เสร็จแล้ว",      statusColor: "#22c55e", due: "2026-03-31", assigned: ["สมชาย", "กาญจนา"] },
  { id: 7,  title: "ตรวจสอบคุณภาพงาน Phase 3",       project: "โกดัง PEB ราชบุรี",            projectId: 5, priority: "high",   status: "in_progress", statusTitle: "กำลังทำ",       statusColor: "#003366", due: "2026-07-01", assigned: ["วิภา"] },
  { id: 8,  title: "ประชุมลูกค้า แม่สอด",            project: "EASYBUILD แม่สอด",             projectId: 6, priority: "normal", status: "done",        statusTitle: "เสร็จแล้ว",      statusColor: "#22c55e", due: "2026-06-15", assigned: ["สมชาย"] },
  { id: 9,  title: "เตรียมเอกสารส่งมอบ EASYBUILD",   project: "EASYBUILD แม่สอด",             projectId: 6, priority: "high",   status: "in_progress", statusTitle: "กำลังทำ",       statusColor: "#003366", due: "2026-06-28", assigned: ["สมชาย"] },
  { id: 10, title: "ตรวจรับงานโครงการระยอง",         project: "โกดังระยอง VCS Asia",          projectId: 8, priority: "normal", status: "done",        statusTitle: "เสร็จแล้ว",      statusColor: "#22c55e", due: "2026-02-28", assigned: ["วิชัย", "กาญจนา"] },
  { id: 11, title: "อัปเดตรายงานความก้าวหน้า",        project: null,                            projectId: null, priority: "low", status: "todo",       statusTitle: "รอดำเนินการ", statusColor: "#6b7280", due: "2026-06-30", assigned: [] },
  { id: 12, title: "ประชุมทีมรายสัปดาห์",            project: null,                            projectId: null, priority: "normal", status: "in_progress", statusTitle: "กำลังทำ", statusColor: "#003366", due: "2026-06-22", assigned: ["สมชาย", "วิภา", "วิชัย"] },
  { id: 13, title: "ทบทวนสัญญา CRM",                project: "ระบบ ERP บจ. ซีซีเอส",        projectId: 2, priority: "urgent", status: "cancelled",   statusTitle: "ยกเลิก",        statusColor: "#f04d6a", due: "2026-06-18", assigned: [] },
  { id: 14, title: "สรุปผลงาน Q2 2026",              project: null,                            projectId: null, priority: "high", status: "todo",       statusTitle: "รอดำเนินการ", statusColor: "#6b7280", due: "2026-06-30", assigned: [] },
];

// ─── CUSTOMERS ────────────────────────────────────────────────
export type CustomerMock = {
  id: number; name: string; company: string; phone: string; email: string;
  province: string; category: string; initials: string; color: string;
  tags: string[]; projectCount: number;
};

export const customers: CustomerMock[] = [
  { id: 1, name: "คุณสมชาย ใจดี", company: "บจ. ไทยสตีล", phone: "081-234-5678", email: "somchai@thaisteel.co.th", province: "นนทบุรี", category: "EASYBUILD", initials: "สช", color: "#003366", tags: ["VIP", "สัญญาใหม่"], projectCount: 2 },
  { id: 2, name: "คุณกาญจนา ม.", company: "บจ. ซีซีเอส", phone: "082-345-6789", email: "kanjana@ccs.co.th", province: "เชียงใหม่", category: "PREFAB", initials: "กม", color: "#22c55e", tags: ["ต่อเนื่อง"], projectCount: 1 },
  { id: 3, name: "คุณประยุทธ ร.", company: "หจก. ราชบุรีโลหะ", phone: "083-456-7890", email: "prayuth@rajburi.co.th", province: "ราชบุรี", category: "RANBUILD", initials: "ปร", color: "#f59e0b", tags: ["โซนตะวันตก"], projectCount: 1 },
  { id: 4, name: "คุณดารัล ส.", company: "บจ. สมุทรโกดัง", phone: "084-567-8901", email: "darat@smgodown.co.th", province: "สมุทรปราการ", category: "EASYBUILD", initials: "ดส", color: "#f04d6a", tags: ["ลูกค้าเดิม"], projectCount: 2 },
  { id: 5, name: "VCS Asia (ระยอง)", company: "VCS Asia Co., Ltd.", phone: "085-678-9012", email: "vcs@vcsasia.com", province: "ระยอง", category: "RANBUILD", initials: "VC", color: "#002244", tags: ["Enterprise", "Contract"], projectCount: 3 },
  { id: 6, name: "คุณสุรัตน์ ล.", company: "บจ. แม่สอดโลหะ", phone: "086-789-0123", email: "surat@maesot.co.th", province: "ตาก", category: "EASYBUILD", initials: "สล", color: "#C0C0C0", tags: ["โซนตะวันตก"], projectCount: 1 },
  { id: 7, name: "บจ. อุตรดิตถ์โลหะ", company: "บจ. อุตรดิตถ์โลหะ", phone: "087-890-1234", email: "info@uttaradit.co.th", province: "อุตรดิตถ์", category: "RANBUILD", initials: "อต", color: "#8fa3b8", tags: ["ลีดใหม่"], projectCount: 0 },
  { id: 8, name: "บจ. นครสวรรค์โลหะ", company: "บจ. นครสวรรค์โลหะ", phone: "088-901-2345", email: "nakhon@nsloha.co.th", province: "นครสวรรค์", category: "Custom", initials: "นส", color: "#22c55e", tags: ["ลูกค้าเดิม", "VIP"], projectCount: 2 },
];

// ─── QUOTATIONS ───────────────────────────────────────────────
export type QuotationStatus = "draft" | "sent_to_client" | "pending_hq" | "approved" | "rejected" | "won" | "lost" | "expired";

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
  draft: "ร่าง", sent_to_client: "ส่งลูกค้าแล้ว", pending_hq: "รอดำเนินการ",
  approved: "อนุมัติ", rejected: "ปฏิเสธ", won: "ปิดการขาย", lost: "ไม่ได้งาน", expired: "หมดอายุ",
};
export const quotationStatusColor: Record<QuotationStatus, { bg: string; text: string }> = {
  draft:          { bg: "#f0f0f5", text: "#6b7280" },
  sent_to_client: { bg: "#dce5f0", text: "#003366" },
  pending_hq:     { bg: "#fef3cd", text: "#f59e0b" },
  approved:       { bg: "#dbeafe", text: "#3b82f6" },
  rejected:       { bg: "#fdeaed", text: "#f04d6a" },
  won:            { bg: "#e5faf0", text: "#22c55e" },
  lost:           { bg: "#f5f5f5", text: "#9ca3af" },
  expired:        { bg: "#f5f5f5", text: "#9ca3af" },
};

export const quotations: QuotationMock[] = [
  { id: "Q-2026-0089", customer: "บจ. ไทยสตีล", project: "โกดังสำเร็จรูป บจ. ไทยสตีล", total: "฿1,800,000", totalValue: 1800000, materialCost: 1800000, province: "นนทบุรี", buildingType: "โกดังสินค้า", area: 960, status: "won", date: "2026-05-15", items: 8, customerId: 1, projectId: 1 },
  { id: "Q-2026-0091", customer: "หจก. ราชบุรีโลหะ", project: "โกดัง PEB ราชบุรี", total: "฿760,000", totalValue: 760000, materialCost: 760000, province: "ราชบุรี", buildingType: "โกดังสินค้า", area: 480, status: "sent_to_client", date: "2026-06-01", items: 5, customerId: 3, projectId: 5 },
  { id: "Q-2026-0092", customer: "VCS Asia", project: "โกดังระยอง VCS Asia", total: "฿6,200,000", totalValue: 6200000, materialCost: 6200000, province: "ระยอง", buildingType: "โรงงาน", area: 3200, status: "won", date: "2025-11-10", items: 15, customerId: 5, projectId: 8 },
  { id: "Q-2026-0095", customer: "บจ. ซีซีเอส", project: "โรงงาน PREFAB เชียงใหม่", total: "฿3,200,000", totalValue: 3200000, materialCost: 3200000, province: "เชียงใหม่", buildingType: "โรงงาน", area: 1800, status: "sent_to_client", date: "2026-06-10", items: 12, customerId: 2, projectId: 2 },
  { id: "Q-2026-0097", customer: "บจ. สมุทรโกดัง", project: "โกดังปากน้ำ พระปราชญ์", total: "฿2,000,000", totalValue: 2000000, materialCost: 2000000, province: "สมุทรปราการ", buildingType: "โกดังสินค้า", area: 1200, status: "approved", date: "2026-06-18", items: 7, customerId: 4, projectId: 3 },
  { id: "Q-2026-0098", customer: "บจ. อุตรดิตถ์โลหะ", project: "PREFAB อุตรดิตถ์", total: "฿2,800,000", totalValue: 2800000, materialCost: 2800000, province: "อุตรดิตถ์", buildingType: "โรงงาน", area: 1600, status: "draft", date: "2026-06-20", items: 9, customerId: 7, projectId: 7 },
  { id: "Q-2026-0099", customer: "บจ. นครสวรรค์โลหะ", project: "โรงงาน Custom นครสวรรค์", total: "฿5,400,000", totalValue: 5400000, materialCost: 5400000, province: "นครสวรรค์", buildingType: "โรงงาน", area: 2800, status: "won", date: "2026-04-05", items: 18, customerId: 8, projectId: 6 },
  { id: "Q-2026-0100", customer: "บจ. เชียงรายเมทัล", project: "โกดัง EASYBUILD เชียงราย", total: "฿1,500,000", totalValue: 1500000, materialCost: 1500000, province: "เชียงราย", buildingType: "โกดังสินค้า", area: 720, status: "lost", date: "2026-05-28", items: 6, customerId: 9, projectId: 9 },
];

// ─── TEAM ─────────────────────────────────────────────────────
export type TeamMock = {
  id: number; name: string; role: string; dept: string;
  initials: string; color: string; tasks: number; projects: number; phone: string;
};

export const teamRoleLabel: Record<string, string> = {
  DEALER_ADMIN: "ผู้จัดการ", DEALER_SALES: "เซลส์", DEALER_SITE: "ช่างหน้างาน",
};

export const team: TeamMock[] = [
  { id: 1, name: "สมชาย เชียงใหม่",  role: "DEALER_ADMIN", dept: "บริหาร",    initials: "สช", color: "#003366", tasks: 5, projects: 4, phone: "081-234-5678" },
  { id: 2, name: "วิภา รัตนกุล",      role: "DEALER_SALES", dept: "ขาย",       initials: "วร", color: "#22c55e", tasks: 3, projects: 3, phone: "082-345-6789" },
  { id: 3, name: "วิชัย ประสิทธิ์",   role: "DEALER_SITE",  dept: "ไซต์งาน",  initials: "วป", color: "#f59e0b", tasks: 4, projects: 2, phone: "083-456-7890" },
  { id: 4, name: "กาญจนา มีสุข",      role: "DEALER_SALES", dept: "ขาย",       initials: "กม", color: "#f04d6a", tasks: 2, projects: 2, phone: "084-567-8901" },
  { id: 5, name: "ประสิทธิ์ ดีงาน",   role: "DEALER_SITE",  dept: "ไซต์งาน",  initials: "ปด", color: "#002244", tasks: 1, projects: 1, phone: "085-678-9012" },
  { id: 6, name: "สุดาวรรณ สวยงาม",   role: "DEALER_SALES", dept: "ขาย",       initials: "สส", color: "#8fa3b8", tasks: 2, projects: 2, phone: "086-789-0123" },
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
  { id: "#LP-001", name: "บจ. อุตรดิตถ์โลหะ", province: "อุตรดิตถ์", channel: "เว็บไซต์", product: "RANBUILD", value: "฿2.8M", createdAt: "วันนี้ 09:14" },
  { id: "#LP-002", name: "คุณพรทิพย์ ว.", province: "ลำปาง", channel: "LINE OA", product: "EASYBUILD", value: "฿650K", createdAt: "วันนี้ 08:32" },
  { id: "#LP-003", name: "หจก. พะเยาก่อสร้าง", province: "พะเยา", channel: "เว็บไซต์", product: "PREFAB", value: "฿1.1M", createdAt: "เมื่อวาน 17:05" },
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
  survey: "สำรวจพื้นที่",
  design_meet: "ประชุมออกแบบ",
  presentation: "นำเสนอราคา",
  contract_sign: "เซ็นสัญญา",
  handover: "ส่งมอบงาน",
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
  { id: 1, company: "บจ. ไทยสตีล", contact: "คุณสมชาย ใจดี", phone: "081-234-5678", project: "โกดังสำเร็จรูป บจ. ไทยสตีล", buildingType: "EASYBUILD", area: 1200, province: "นนทบุรี", date: "2026-06-24", time: "09:00", type: "survey", assigned: "สมชาย", status: "upcoming", note: "สำรวจพื้นที่ก่อสร้างโกดังสินค้า" },
  { id: 2, company: "บจ. ซีซีเอส", contact: "คุณกาญจนา ม.", phone: "082-345-6789", project: "ระบบ ERP บจ. ซีซีเอส", buildingType: "PREFAB", area: 800, province: "เชียงใหม่", date: "2026-06-24", time: "13:30", type: "design_meet", assigned: "วิภา", status: "upcoming", note: "ประชุมออกแบบ Layout และ BIM" },
  { id: 3, company: "บจ. ไทยสตีล", contact: "คุณสมชาย ใจดี", phone: "081-234-5678", project: "โกดังสำเร็จรูป บจ. ไทยสตีล", buildingType: "EASYBUILD", area: 1200, province: "นนทบุรี", date: "2026-06-26", time: "09:00", type: "contract_sign", assigned: "สมชาย", status: "upcoming", note: "เซ็นสัญญาจ้างก่อสร้าง" },
  { id: 4, company: "บจ. ซีซีเอส", contact: "คุณกาญจนา ม.", phone: "082-345-6789", project: "ระบบ ERP บจ. ซีซีเอส", buildingType: "PREFAB", area: 800, province: "เชียงใหม่", date: "2026-06-30", time: "13:00", type: "handover", assigned: "สมชาย", status: "upcoming", note: "ส่งมอบงาน Phase 1" },
  { id: 5, company: "บจ. สมุทรโกดัง", contact: "คุณดารัล ส.", phone: "084-567-8901", project: "โกดังปากน้ำ พระปราชญ์", buildingType: "EASYBUILD", area: 2000, province: "สมุทรปราการ", date: "2026-07-03", time: "08:00", type: "survey", assigned: "วิชัย", status: "upcoming", note: "สำรวจพื้นที่และตรวจสอบดิน" },
  { id: 6, company: "หจก. ราชบุรีโลหะ", contact: "คุณประยุทธ ร.", phone: "083-456-7890", project: "โกดัง PEB ราชบุรี", buildingType: "RANBUILD", area: 3100, province: "ราชบุรี", date: "2026-07-05", time: "10:00", type: "presentation", assigned: "วิภา", status: "upcoming", note: "นำเสนอใบเสนอราคาฉบับปรับปรุง" },
  { id: 7, company: "บจ. แม่สอดโลหะ", contact: "คุณสุรัตน์ ล.", phone: "086-789-0123", project: "EASYBUILD แม่สอด", buildingType: "EASYBUILD", area: 4100, province: "ตาก", date: "2026-06-15", time: "10:00", type: "survey", assigned: "สมชาย", status: "done", note: "สำรวจพื้นที่เรียบร้อย รอส่งรายงาน" },
  { id: 8, company: "VCS Asia", contact: "VCS Asia (ระยอง)", phone: "085-678-9012", project: "โกดังระยอง VCS Asia", buildingType: "RANBUILD", area: 6200, province: "ระยอง", date: "2026-02-25", time: "13:00", type: "handover", assigned: "วิชัย", status: "done", note: "ส่งมอบงานเสร็จสมบูรณ์" },
  { id: 9, company: "บจ. นครสวรรค์โลหะ", contact: "บจ. นครสวรรค์โลหะ", phone: "088-901-2345", project: "โรงงาน RANBUILD นครสวรรค์", buildingType: "RANBUILD", area: 5400, province: "นครสวรรค์", date: "2026-03-15", time: "14:00", type: "follow_up", assigned: "กาญจนา", status: "done", note: "โทรติดตามหลังส่งมอบ" },
  { id: 10, company: "บจ. อุตรดิตถ์โลหะ", contact: "บจ. อุตรดิตถ์โลหะ", phone: "087-890-1234", project: "PREFAB อุตรดิตถ์", buildingType: "PREFAB", area: 2800, province: "อุตรดิตถ์", date: "2026-07-10", time: "10:00", type: "presentation", assigned: "วิภา", status: "cancelled", note: "ลูกค้าขอเลื่อน" },
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
  { id: "C-2026-001", client: "บจ. ไทยสตีล", contact: "คุณสมชาย ใจดี", phone: "081-234-5678", project: "โกดังสำเร็จรูป บจ. ไทยสตีล", value: 1800000, deposit: 540000, remaining: 1260000, agentName: "สมชาย", signDate: "2026-04-01", transferDate: "2026-07-31", status: "active", quotationRef: "Q-2026-0089" },
  { id: "C-2026-002", client: "บจ. ซีซีเอส", contact: "คุณกาญจนา ม.", phone: "082-345-6789", project: "ระบบ ERP บจ. ซีซีเอส", value: 3200000, deposit: 960000, remaining: 2240000, agentName: "วิภา", signDate: "2026-05-15", transferDate: "2026-08-15", status: "active", quotationRef: "Q-2026-0095" },
  { id: "C-2026-003", client: "บจ. นครสวรรค์โลหะ", contact: "บจ. นครสวรรค์โลหะ", phone: "088-901-2345", project: "โรงงาน RANBUILD นครสวรรค์", value: 5400000, deposit: 5400000, remaining: 0, agentName: "สมชาย", signDate: "2026-01-01", transferDate: "2026-03-31", status: "completed" },
  { id: "C-2026-004", client: "VCS Asia", contact: "VCS Asia (ระยอง)", phone: "085-678-9012", project: "โกดังระยอง VCS Asia", value: 6200000, deposit: 6200000, remaining: 0, agentName: "วิชัย", signDate: "2025-11-01", transferDate: "2026-02-28", status: "completed", quotationRef: "Q-2026-0092" },
  { id: "C-2026-005", client: "คุณสมชาย", contact: "คุณสมชาย ใจดี", phone: "081-234-5678", project: "โกดังปากน้ำ พระปราชญ์", value: 2000000, deposit: 0, remaining: 2000000, agentName: "สมชาย", signDate: "—", transferDate: "—", status: "draft", quotationRef: "Q-2026-0097" },
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
  { id: "INV-2026-0041", client: "บจ. ไทยสตีล", project: "โกดังสำเร็จรูป บจ. ไทยสตีล", contractRef: "C-2026-001", issueDate: "2026-05-01", dueDate: "2026-05-30", subtotal: 504673, vatRate: 7, vatAmount: 35327, total: 540000, status: "paid",    milestone: "งวดที่ 1 (30%)", note: "วางฐานราก",           projectId: 1, installmentNo: 1 },
  { id: "INV-2026-0055", client: "VCS Asia",      project: "โกดังระยอง VCS Asia",          contractRef: "C-2026-004", issueDate: "2026-02-20", dueDate: "2026-03-15", subtotal: 1158879, vatRate: 7, vatAmount: 81121, total: 1240000, status: "paid",    milestone: "งวดสุดท้าย",     note: "ส่งมอบงานครบถ้วน",    projectId: 8, installmentNo: 4 },
  { id: "INV-2026-0062", client: "บจ. ซีซีเอส",   project: "ระบบ ERP บจ. ซีซีเอส",         contractRef: "C-2026-002", issueDate: "2026-06-01", dueDate: "2026-06-30", subtotal: 747664,  vatRate: 7, vatAmount: 52336, total: 800000,  status: "sent",    milestone: "งวดที่ 2 (30%)", note: "ติดตั้งโครงสร้าง",   projectId: 2, installmentNo: 2 },
  { id: "INV-2026-0068", client: "หจก. ราชบุรีโลหะ", project: "โกดัง PEB ราชบุรี",         contractRef: "C-2026-001", issueDate: "2026-05-20", dueDate: "2026-06-15", subtotal: 177570,  vatRate: 7, vatAmount: 12430, total: 190000,  status: "overdue", milestone: "งวดที่ 1",       note: "มัดจำ 25%",           projectId: 5, installmentNo: 1 },
  { id: "INV-2026-0071", client: "คุณสมชาย",     project: "โกดังปากน้ำ พระปราชญ์",         contractRef: "C-2026-005", issueDate: "2026-07-01", dueDate: "2026-07-15", subtotal: 373832,  vatRate: 7, vatAmount: 26168, total: 400000,  status: "draft",   milestone: "มัดจำ (20%)",    note: "รอลูกค้าอนุมัติ",    projectId: 3, installmentNo: 1 },
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
  { id: "PAY-2026-003", invoiceRef: "INV-2026-0062", client: "บจ. ซีซีเอส", amount: 800000, method: "transfer", paidDate: "2026-06-20", salesPerson: "วิภา", status: "confirmed", note: "งวดที่ 2 ติดตั้งโครงสร้าง" },
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
  { id: "EXP-001", date: "2026-06-10", client: "บจ. ไทยสตีล", project: "โกดังสำเร็จรูป บจ. ไทยสตีล", category: "travel", amount: 4800, description: "ค่าเดินทางสำรวจหน้างาน นนทบุรี", billingStatus: "billable" },
  { id: "EXP-002", date: "2026-06-12", client: "บจ. ซีซีเอส", project: "โรงงาน PREFAB เชียงใหม่", category: "printing", amount: 1200, description: "พิมพ์แบบก่อสร้าง A0 จำนวน 4 ชุด", billingStatus: "billed" },
  { id: "EXP-003", date: "2026-06-14", client: "VCS Asia", project: "โกดังระยอง VCS Asia", category: "testing", amount: 32000, description: "ทดสอบดินและฐานราก", billingStatus: "billable" },
  { id: "EXP-004", date: "2026-06-18", client: "บจ. สมุทรโกดัง", project: "โกดังปากน้ำ พระปราชญ์", category: "travel", amount: 2800, description: "ค่าน้ำมันและทางด่วน", billingStatus: "not_billable" },
  { id: "EXP-005", date: "2026-06-20", client: "หจก. ราชบุรีโลหะ", project: "โกดัง PEB ราชบุรี", category: "equipment", amount: 8500, description: "เช่าเครื่องมือสำรวจ Total Station", billingStatus: "billable" },
];


// ─── MILESTONES ───────────────────────────────────────────────────
export type MilestoneMock = {
  id: number; title: string; projectId: number; position: number;
  type: "general" | "major"; dueDate: string; done: boolean;
};
export const milestones: MilestoneMock[] = [
  { id: 1, title: "สำรวจหน้างานและวัดพื้นที่", projectId: 1, position: 1, type: "general", dueDate: "2026-03-10", done: true },
  { id: 2, title: "เสร็จสิ้นงานฐานราก", projectId: 1, position: 2, type: "major", dueDate: "2026-04-15", done: true },
  { id: 3, title: "ติดตั้งโครงเหล็ก", projectId: 1, position: 3, type: "major", dueDate: "2026-05-20", done: false },
  { id: 4, title: "ติดตั้งหลังคาและผนัง", projectId: 2, position: 1, type: "major", dueDate: "2026-06-30", done: false },
  { id: 5, title: "ส่งมอบงาน", projectId: 2, position: 2, type: "major", dueDate: "2026-07-15", done: false },
  { id: 6, title: "ตรวจรับงานขั้นสุดท้าย", projectId: 3, position: 1, type: "major", dueDate: "2026-08-01", done: false },
];

// ─── MESSAGES ─────────────────────────────────────────────────────
export type MessageMock = {
  id: number; text: string; senderName: string; senderId: string; created: string;
};
export const messages: MessageMock[] = [
  { id: 1, text: "แบบแปลนโกดัง VCS Asia ผ่านการอนุมัติจาก engineering แล้ว สามารถเริ่ม fabricate ได้เลย", senderName: "สุรชัย", senderId: "surachai", created: "2026-06-20 09:15" },
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
  { id: "COM-2026-001", quotationId: "Q-2026-0089", projectTitle: "โกดังสำเร็จรูป บจ. ไทยสตีล",     client: "บจ. ไทยสตีล",          closedDate: "2026-05-15", dealValue: 1800000, commissionRate: 5, commissionAmount: 90000,  status: "paid",     paidDate: "2026-06-01", period: "พ.ค. 2569" },
  { id: "COM-2026-002", quotationId: "Q-2026-0092", projectTitle: "โกดังระยอง VCS Asia",             client: "VCS Asia Co., Ltd.",     closedDate: "2025-11-10", dealValue: 6200000, commissionRate: 5, commissionAmount: 310000, status: "paid",     paidDate: "2026-01-10", period: "พ.ย. 2568" },
  { id: "COM-2026-003", quotationId: "Q-2026-0099", projectTitle: "โรงงาน Custom นครสวรรค์",         client: "บจ. นครสวรรค์โลหะ",     closedDate: "2026-04-05", dealValue: 5400000, commissionRate: 5, commissionAmount: 270000, status: "approved", period: "เม.ย. 2569" },
  { id: "COM-2026-004", quotationId: "Q-2026-0097", projectTitle: "โกดังปากน้ำ พระปราชญ์",           client: "บจ. สมุทรโกดัง",        closedDate: "2026-06-18", dealValue: 2000000, commissionRate: 5, commissionAmount: 100000, status: "pending",  period: "มิ.ย. 2569" },
  { id: "COM-2026-005", quotationId: "Q-2026-0095", projectTitle: "โรงงาน PREFAB เชียงใหม่",         client: "บจ. ซีซีเอส",           closedDate: "2026-06-10", dealValue: 3200000, commissionRate: 5, commissionAmount: 160000, status: "pending",  period: "มิ.ย. 2569" },
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
  { id: 7,  customerId: 4, company: "บจ. สมุทรโกดัง",        name: "คุณนพดล จ.",            role: "ผู้จัดการฝ่ายก่อสร้าง", phone: "084-567-8902", email: "noppadol@smgodown.co.th",  lineId: "",             isPrimary: false },
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

