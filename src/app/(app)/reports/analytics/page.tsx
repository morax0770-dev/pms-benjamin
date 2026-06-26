"use client";

import { salesByMonth, leads, projects, leadStatusLabel, type LeadStatus } from "@/lib/mock";

const CARD: React.CSSProperties = { background: "#fff", borderRadius: 16, border: "1px solid #cfd4dc", boxShadow: "0 2px 14px rgba(0,51,102,.07)" };

const W = 560;
const H = 140;
const PAD = { top: 12, right: 12, bottom: 24, left: 36 };
const chartW = W - PAD.left - PAD.right;
const chartH = H - PAD.top - PAD.bottom;

function AreaChart({ data }: { data: { month: string; value: number }[] }) {
  const max = Math.max(...data.map(d => d.value)) * 1.15;
  const xs = data.map((_, i) => PAD.left + (i / (data.length - 1)) * chartW);
  const ys = data.map(d => PAD.top + chartH - (d.value / max) * chartH);
  const line = xs.map((x, i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(" ");
  const area = line + ` L${xs[xs.length - 1].toFixed(1)},${(PAD.top + chartH).toFixed(1)} L${xs[0].toFixed(1)},${(PAD.top + chartH).toFixed(1)} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block" }}>
      <defs>
        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#003366" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#003366" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#ag)" />
      <path d={line} fill="none" stroke="#003366" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {xs.map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={ys[i]} r="3" fill="#003366" />
          <text x={x} y={H - 4} textAnchor="middle" fontSize="8" fill="#6b7280">{data[i].month}</text>
        </g>
      ))}
    </svg>
  );
}

const FUNNEL_ORDER: LeadStatus[] = ["new_lead", "contacted", "meeting", "quotation", "negotiation", "won", "lost"];
const FUNNEL_COLOR: Record<LeadStatus, string> = {
  new_lead: "#6b7280", contacted: "#003366", meeting: "#7c3aed",
  quotation: "#b45309", negotiation: "#475569", won: "#15803d", lost: "#f04d6a",
};

export default function AnalyticsPage() {
  const funnelData = FUNNEL_ORDER.map(s => ({ status: s, count: leads.filter(l => l.status === s).length }));
  const maxFunnel = Math.max(...funnelData.map(d => d.count), 1);

  const projectByStatus = {
    in_progress: projects.filter(p => p.status === "in_progress").length,
    completed: projects.filter(p => p.status === "completed").length,
    not_started: projects.filter(p => p.status === "not_started").length,
    on_hold: projects.filter(p => p.status === "on_hold").length,
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#2D2D2D", marginBottom: 3 }}>วิเคราะห์ข้อมูล</h1>
        <p style={{ fontSize: "0.76rem", color: "#6b7280" }}>วิเคราะห์ข้อมูลยอดขาย ลีด และโครงการ</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { label: "อัตราปิดการขาย", value: "35%", delta: "+4.2%", up: true },
          { label: "มูลค่าดีลเฉลี่ย", value: "฿1.8M", delta: "+8.6%", up: true },
          { label: "รอบการขาย", value: "42 วัน", delta: "-3 วัน", up: true },
          { label: "อัตราแปลงลีด", value: "23%", delta: "-1.2%", up: false },
        ].map((s, i) => (
          <div key={i} style={{ ...CARD, padding: "14px 16px" }}>
            <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#2D2D2D" }}>{s.value}</div>
            <div style={{ fontSize: "0.7rem", fontWeight: 700, color: s.up ? "#22c55e" : "#f04d6a", marginTop: 4 }}>{s.delta} vs เดือนที่แล้ว</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        {/* Area Chart */}
        <div style={{ ...CARD, padding: "16px 16px 10px" }}>
          <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#2D2D2D", marginBottom: 12 }}>ยอดขายรายเดือน (K฿)</div>
          <AreaChart data={salesByMonth} />
        </div>

        {/* Lead Funnel */}
        <div style={{ ...CARD, padding: "16px" }}>
          <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#2D2D2D", marginBottom: 14 }}>ช่องทางลีด</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {funnelData.map(f => (
              <div key={f.status} style={{ display: "grid", gridTemplateColumns: "90px 1fr 28px", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 600, textAlign: "right" }}>{leadStatusLabel[f.status]}</span>
                <div style={{ height: 8, background: "#f0f0f5", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${(f.count / maxFunnel) * 100}%`, background: FUNNEL_COLOR[f.status], borderRadius: 99 }} />
                </div>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#2D2D2D" }}>{f.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project status breakdown */}
      <div style={{ ...CARD, padding: "16px" }}>
        <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#2D2D2D", marginBottom: 14 }}>สถานะโครงการ</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {[
            { label: "กำลังดำเนินการ", value: projectByStatus.in_progress, color: "#003366", bg: "#dce5f0" },
            { label: "เสร็จแล้ว", value: projectByStatus.completed, color: "#22c55e", bg: "#e5faf0" },
            { label: "ยังไม่เริ่ม", value: projectByStatus.not_started, color: "#6b7280", bg: "#f0f0f5" },
            { label: "หยุดชั่วคราว", value: projectByStatus.on_hold, color: "#f59e0b", bg: "#fef3cd" },
          ].map(s => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: "0.72rem", color: s.color, fontWeight: 600, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
