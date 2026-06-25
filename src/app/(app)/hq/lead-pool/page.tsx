"use client";

import { LeadPoolTable } from "@/components/hq/LeadPoolTable";
import { leadPool } from "@/lib/mock";

const CARD: React.CSSProperties = { background: "#fff", borderRadius: 16, border: "1px solid #cfd4dc", boxShadow: "0 2px 14px rgba(0,51,102,.07)" };

export default function HQLeadPoolPage() {
  const totalValue = leadPool.reduce((s, l) => {
    const v = parseFloat(l.value.replace(/[฿,MKB]/g, "").trim());
    return s + (l.value.includes("M") ? v * 1000000 : l.value.includes("K") ? v * 1000 : v);
  }, 0);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#2D2D2D", marginBottom: 3 }}>ลีดส่วนกลาง</h1>
        <p style={{ fontSize: "0.76rem", color: "#6b7280" }}>ลีดจากช่องทาง HQ ที่ยังไม่ได้มอบหมายสาขา</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { label: "ลีดรอมอบหมาย", value: leadPool.length, color: "#f59e0b" },
          { label: "มูลค่ารวม", value: `฿${(totalValue / 1000000).toFixed(1)}M`, color: "#003366" },
          { label: "ช่องทางหลัก", value: "เว็บไซต์", color: "#22c55e" },
        ].map((s, i) => (
          <div key={i} style={{ ...CARD, padding: "14px 16px" }}>
            <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <LeadPoolTable />
    </div>
  );
}
