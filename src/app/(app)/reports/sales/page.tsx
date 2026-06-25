"use client";

import { salesByMonth, leads, projects, quotations } from "@/lib/mock";

const CARD: React.CSSProperties = { background: "#fff", borderRadius: 16, border: "1px solid #cfd4dc", boxShadow: "0 2px 14px rgba(0,51,102,.07)" };

const BAR_H = 120;
const BAR_PAD = 16;

function BarChart({ data }: { data: { month: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value)) * 1.1;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: BAR_H + 20, padding: `0 ${BAR_PAD}px`, justifyContent: "space-between" }}>
      {data.map((d, i) => {
        const pct = d.value / max;
        const isLatest = i === data.length - 1;
        return (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1 }}>
            <span style={{ fontSize: "0.6rem", color: "#6b7280", fontWeight: 700 }}>{d.value}</span>
            <div style={{ width: "100%", background: isLatest ? "#003366" : "#cfd4dc", borderRadius: "4px 4px 0 0", height: `${pct * BAR_H}px`, transition: "height .3s" }} />
            <span style={{ fontSize: "0.58rem", color: "#6b7280" }}>{d.month}</span>
          </div>
        );
      })}
    </div>
  );
}

const MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย."];

export default function SalesReportPage() {
  const wonLeads = leads.filter(l => l.status === "PAID");
  const completedProjects = projects.filter(p => p.status === "completed");
  const approvedQuotes = quotations.filter(q => q.status === "approved");
  const totalApproved = approvedQuotes.reduce((s, q) => s + q.totalValue, 0);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#2D2D2D", marginBottom: 3 }}>รายงานยอดขาย</h1>
        <p style={{ fontSize: "0.76rem", color: "#6b7280" }}>สรุปยอดขาย ดีลที่ปิดได้ และมูลค่ารวม</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { label: "ยอดขาย Q2", value: "฿8.4M", delta: "+12.3%", up: true },
          { label: "ดีลที่ปิดได้", value: wonLeads.length, delta: "จากลีดทั้งหมด", up: true },
          { label: "ใบเสนอราคาอนุมัติ", value: `฿${(totalApproved / 1000000).toFixed(1)}M`, delta: `${approvedQuotes.length} ฉบับ`, up: true },
          { label: "โครงการเสร็จ", value: completedProjects.length, delta: "ไตรมาสนี้", up: true },
        ].map((s, i) => (
          <div key={i} style={{ ...CARD, padding: "14px 16px" }}>
            <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#2D2D2D" }}>{s.value}</div>
            <div style={{ fontSize: "0.7rem", fontWeight: 600, color: s.up ? "#22c55e" : "#f04d6a", marginTop: 4 }}>{s.delta}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14, marginBottom: 14 }}>
        {/* Monthly bar chart */}
        <div style={{ ...CARD, padding: "16px 16px 10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#2D2D2D" }}>ยอดขายรายเดือน (K฿)</div>
            <span style={{ fontSize: "0.68rem", color: "#6b7280" }}>ม.ค. – ส.ค. 2026</span>
          </div>
          <BarChart data={salesByMonth} />
        </div>

        {/* Win vs Lost */}
        <div style={{ ...CARD, padding: "16px" }}>
          <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#2D2D2D", marginBottom: 14 }}>ปิด / เสียดีล</div>
          {[
            { label: "ชำระเงินแล้ว", count: wonLeads.length, color: "#0f766e", bg: "#e6faf7" },
            { label: "ยกเลิก", count: leads.filter(l => l.status === "CANCELLED").length, color: "#f04d6a", bg: "#fdeaed" },
            { label: "ออกใบเสนอราคา", count: leads.filter(l => l.status === "QUOTED").length, color: "#15803d", bg: "#f0fdf4" },
            { label: "รอติดตาม", count: leads.filter(l => ["NEW", "WAITING"].includes(l.status)).length, color: "#6b7280", bg: "#f0f0f5" },
          ].map(row => (
            <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 10, background: row.bg, marginBottom: 6 }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 600, color: row.color }}>{row.label}</span>
              <span style={{ fontSize: "1rem", fontWeight: 800, color: row.color }}>{row.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top deals table */}
      <div style={CARD}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #cfd4dc" }}>
          <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#2D2D2D" }}>ดีลที่ปิดได้สูงสุด</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #cfd4dc", background: "#f8f9fb" }}>
                {["ลูกค้า", "สินค้า", "มูลค่า", "จังหวัด", "สถานะ"].map(h => (
                  <th key={h} style={{ fontSize: "0.67rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", padding: "10px 14px", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...leads].sort((a, b) => {
                const va = parseFloat(a.value.replace(/[฿,MKB]/g, "")) * (a.value.includes("M") ? 1000000 : a.value.includes("K") ? 1000 : 1);
                const vb = parseFloat(b.value.replace(/[฿,MKB]/g, "")) * (b.value.includes("M") ? 1000000 : b.value.includes("K") ? 1000 : 1);
                return vb - va;
              }).slice(0, 5).map(l => (
                <tr key={l.id} style={{ borderBottom: "1px solid #f0f4f8" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f8f9fb"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}>
                  <td style={{ padding: "11px 14px", fontSize: "0.84rem", fontWeight: 600, color: "#2D2D2D" }}>{l.name}</td>
                  <td style={{ padding: "11px 14px" }}><span style={{ padding: "3px 10px", borderRadius: 99, fontSize: "0.68rem", fontWeight: 700, background: "#dce5f0", color: "#003366" }}>{l.product}</span></td>
                  <td style={{ padding: "11px 14px", fontSize: "0.88rem", fontWeight: 800, color: "#2D2D2D" }}>{l.value}</td>
                  <td style={{ padding: "11px 14px", fontSize: "0.8rem", color: "#6b7280" }}>{l.province}</td>
                  <td style={{ padding: "11px 14px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: "0.68rem", fontWeight: 700, background: l.status === "PAID" ? "#e6faf7" : l.status === "CANCELLED" ? "#fdeaed" : "#dce5f0", color: l.status === "PAID" ? "#0f766e" : l.status === "CANCELLED" ? "#f04d6a" : "#003366" }}>
                      {l.status === "PAID" ? "ชำระเงินแล้ว" : l.status === "CANCELLED" ? "ยกเลิก" : "กำลังดำเนินการ"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
