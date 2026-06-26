"use client";

import { quotations, projects } from "@/lib/mock";

const CARD: React.CSSProperties = { background: "#fff", borderRadius: 16, border: "1px solid #cfd4dc", boxShadow: "0 2px 14px rgba(0,51,102,.07)" };

const MONTHLY_CASH: { month: string; income: number; expense: number }[] = [
  { month: "ม.ค.", income: 1200, expense: 420 },
  { month: "ก.พ.", income: 980,  expense: 380 },
  { month: "มี.ค.", income: 1650, expense: 510 },
  { month: "เม.ย.", income: 2100, expense: 680 },
  { month: "พ.ค.", income: 1450, expense: 490 },
  { month: "มิ.ย.", income: 1820, expense: 560 },
];

const BAR_H = 110;

function DualBar({ data }: { data: typeof MONTHLY_CASH }) {
  const max = Math.max(...data.flatMap(d => [d.income, d.expense])) * 1.1;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: BAR_H + 22, justifyContent: "space-between", padding: "0 8px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 2, width: "100%" }}>
            <div style={{ flex: 1, background: "#003366", borderRadius: "3px 3px 0 0", height: `${(d.income / max) * BAR_H}px` }} />
            <div style={{ flex: 1, background: "#f04d6a", borderRadius: "3px 3px 0 0", height: `${(d.expense / max) * BAR_H}px` }} />
          </div>
          <span style={{ fontSize: "0.58rem", color: "#6b7280" }}>{d.month}</span>
        </div>
      ))}
    </div>
  );
}

export default function FinancePage() {
  const totalIncome = MONTHLY_CASH.reduce((s, d) => s + d.income, 0);
  const totalExpense = MONTHLY_CASH.reduce((s, d) => s + d.expense, 0);
  const totalApproved = quotations.filter(q => q.status === "won").reduce((s, q) => s + q.totalValue, 0);
  const projectValue = projects.filter(p => p.status === "in_progress").reduce((s, p) => {
    const v = parseFloat(p.value.replace(/[฿,MKB]/g, "").trim());
    return s + (p.value.includes("M") ? v * 1000000 : p.value.includes("K") ? v * 1000 : v);
  }, 0);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#2D2D2D", marginBottom: 3 }}>รายงานการเงิน</h1>
        <p style={{ fontSize: "0.76rem", color: "#6b7280" }}>สรุปรายรับ รายจ่าย และกระแสเงินสด</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { label: "รายรับรวม (สะสม)", value: `฿${(totalIncome / 1000).toFixed(1)}M`, color: "#22c55e" },
          { label: "รายจ่ายรวม (สะสม)", value: `฿${(totalExpense / 1000).toFixed(1)}M`, color: "#f04d6a" },
          { label: "กำไรสุทธิ (สะสม)", value: `฿${((totalIncome - totalExpense) / 1000).toFixed(1)}M`, color: "#003366" },
          { label: "มูลค่าโครงการ Active", value: `฿${(projectValue / 1000000).toFixed(1)}M`, color: "#2D2D2D" },
        ].map((s, i) => (
          <div key={i} style={{ ...CARD, padding: "14px 16px" }}>
            <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14, marginBottom: 14 }}>
        {/* Cash flow chart */}
        <div style={{ ...CARD, padding: "16px 16px 10px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#2D2D2D" }}>กระแสเงินสดรายเดือน (K฿)</div>
            <div style={{ display: "flex", gap: 12 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.68rem", color: "#003366" }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: "#003366", display: "inline-block" }} /> รายรับ
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.68rem", color: "#f04d6a" }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: "#f04d6a", display: "inline-block" }} /> รายจ่าย
              </span>
            </div>
          </div>
          <DualBar data={MONTHLY_CASH} />
        </div>

        {/* Quick summary */}
        <div style={{ ...CARD, padding: "16px" }}>
          <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#2D2D2D", marginBottom: 14 }}>สรุปการเงิน</div>
          {[
            { label: "ใบแจ้งหนี้ที่อนุมัติ", value: `฿${(totalApproved / 1000000).toFixed(1)}M`, color: "#22c55e" },
            { label: "รอเก็บเงิน", value: "฿4.2M", color: "#f59e0b" },
            { label: "เกินกำหนดชำระ", value: "฿0.8M", color: "#f04d6a" },
            { label: "กำไรขั้นต้น", value: "65%", color: "#003366" },
          ].map(row => (
            <div key={row.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f0f4f8" }}>
              <span style={{ fontSize: "0.78rem", color: "#6b7280", fontWeight: 600 }}>{row.label}</span>
              <span style={{ fontSize: "0.9rem", fontWeight: 800, color: row.color }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction table */}
      <div style={CARD}>
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #cfd4dc" }}>
          <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#2D2D2D" }}>รายการล่าสุด</div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #cfd4dc", background: "#f8f9fb" }}>
                {["วันที่", "รายการ", "ลูกค้า/โครงการ", "ประเภท", "จำนวน"].map(h => (
                  <th key={h} style={{ fontSize: "0.67rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", padding: "10px 14px", textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { date: "2026-06-20", name: "งวดที่ 1 — โกดังสินค้า ไทยสตีล", client: "บจ. ไทยสตีล", type: "รายรับ", amount: "฿540,000", pos: true },
                { date: "2026-06-18", name: "ค่าวัสดุ", client: "โกดัง PEB ราชบุรี", type: "รายจ่าย", amount: "฿120,000", pos: false },
                { date: "2026-06-15", name: "งวดสุดท้าย — VCS Asia", client: "VCS Asia", type: "รายรับ", amount: "฿1,240,000", pos: true },
                { date: "2026-06-12", name: "เงินเดือนพนักงาน", client: "ภายใน", type: "รายจ่าย", amount: "฿185,000", pos: false },
                { date: "2026-06-10", name: "งวดที่ 2 — ERP ซีซีเอส", client: "บจ. ซีซีเอส", type: "รายรับ", amount: "฿800,000", pos: true },
              ].map((r, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f0f4f8" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f8f9fb"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}>
                  <td style={{ padding: "11px 14px", fontSize: "0.76rem", color: "#6b7280" }}>{r.date}</td>
                  <td style={{ padding: "11px 14px", fontSize: "0.84rem", fontWeight: 600, color: "#2D2D2D" }}>{r.name}</td>
                  <td style={{ padding: "11px 14px", fontSize: "0.78rem", color: "#6b7280" }}>{r.client}</td>
                  <td style={{ padding: "11px 14px" }}>
                    <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: "0.68rem", fontWeight: 700, background: r.pos ? "#e5faf0" : "#fdeaed", color: r.pos ? "#22c55e" : "#f04d6a" }}>{r.type}</span>
                  </td>
                  <td style={{ padding: "11px 14px", fontSize: "0.9rem", fontWeight: 800, color: r.pos ? "#22c55e" : "#f04d6a" }}>
                    {r.pos ? "+" : "-"}{r.amount}
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
