import type { LeadStatus } from "@/lib/mock";

const config: Record<LeadStatus, { label: string; bg: string; color: string }> = {
  NEW:       { label: "ใหม่",                  bg: "#f0f0f5", color: "#6b7280" },
  WAITING:   { label: "กำลังรอรายละเอียด",     bg: "#e0f5fd", color: "#0284c7" },
  BULLET:    { label: "เสนอบูเลท",             bg: "#fff4eb", color: "#ea6c00" },
  QUOTED:    { label: "ออกใบเสนอราคา",         bg: "#f0fdf4", color: "#15803d" },
  PAID:      { label: "ชำระเงินแล้ว ✓",        bg: "#e6faf7", color: "#0f766e" },
  CANCELLED: { label: "ยกเลิก",               bg: "#fdeaed", color: "#f04d6a" },
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  const { label, bg, color } = config[status];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "3px 10px", borderRadius: 99,
      fontSize: "0.68rem", fontWeight: 700,
      background: bg, color, whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}
