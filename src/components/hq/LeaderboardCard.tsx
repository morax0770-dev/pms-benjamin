"use client";

import { dealerLeaderboard } from "@/lib/mock";
import { TrendingUp, Trophy } from "lucide-react";

const CARD: React.CSSProperties = {
  background: "#fff", borderRadius: 16, border: "1px solid #cfd4dc",
  boxShadow: "0 2px 14px rgba(0,51,102,.07)", overflow: "hidden",
};

const RANK_COLORS = [
  { bg: "#fbbf24", text: "#78350f" },
  { bg: "#C0C0C0", text: "#fff" },
  { bg: "#f59e0b", text: "#fff" },
];

export function LeaderboardCard() {
  const ranked = [...dealerLeaderboard]
    .filter(d => d.status === "active")
    .sort((a, b) => b.revenueActual - a.revenueActual);

  return (
    <div style={CARD}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 14px", borderBottom: "1px solid #cfd4dc" }}>
        <div>
          <p style={{ fontSize: "0.86rem", fontWeight: 700, color: "#2D2D2D", margin: 0, display:"flex", alignItems:"center", gap:5 }}><Trophy size={14}/> อันดับสาขา</p>
          <p style={{ fontSize: "0.72rem", color: "#6b7280", margin: "2px 0 0" }}>เดือนมิถุนายน 2026</p>
        </div>
        <button style={{ fontSize: "0.72rem", color: "#003366", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>ดูทั้งหมด</button>
      </div>

      {/* List */}
      <div>
        {ranked.map((d, i) => {
          const targetPct = d.revenueTarget > 0 ? Math.min(100, Math.round(d.revenueActual / d.revenueTarget * 100)) : 0;
          const revenueLabel = `฿${(d.revenueActual / 1_000_000).toFixed(1)}M`;
          const rankColor = RANK_COLORS[i] ?? { bg: "#f0f0f5", text: "#6b7280" };
          const barColor = targetPct >= 80 ? "#22c55e" : targetPct >= 50 ? "#003366" : "#f59e0b";

          return (
            <div key={d.code}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderBottom: "1px solid #f0f4f8" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f8f9fb"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}>
              {/* Rank badge */}
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: rankColor.bg, color: rankColor.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", fontWeight: 800, flexShrink: 0 }}>
                {i + 1}
              </div>

              {/* Branch info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#2D2D2D", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.name}</p>
                <p style={{ fontSize: "0.65rem", color: "#6b7280", margin: "2px 0 0" }}>{d.region} · {d.activeProjects} โครงการ</p>
              </div>

              {/* Progress bar */}
              <div style={{ width: 80, flexShrink: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.62rem", color: "#6b7280", marginBottom: 4 }}>
                  <span>เป้า</span>
                  <span style={{ color: targetPct >= 80 ? "#22c55e" : "#6b7280", fontWeight: targetPct >= 80 ? 700 : 400 }}>{targetPct}%</span>
                </div>
                <div style={{ height: 5, background: "#f0f0f5", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${targetPct}%`, background: barColor, borderRadius: 99 }} />
                </div>
              </div>

              {/* Revenue */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ fontSize: "0.78rem", fontWeight: 800, color: "#2D2D2D", margin: 0 }}>{revenueLabel}</p>
                <p style={{ fontSize: "0.62rem", color: "#6b7280", margin: "2px 0 0", display: "flex", alignItems: "center", gap: 2, justifyContent: "flex-end" }}>
                  <TrendingUp size={9} /> {d.winRate}% ปิดการขาย
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
