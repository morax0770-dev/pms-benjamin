"use client";

import { useState } from "react";
import { leadPool } from "@/lib/mock";
import { Globe, MessageCircle, UserPlus } from "lucide-react";

const CARD: React.CSSProperties = {
  background: "#fff", borderRadius: 16, border: "1px solid #cfd4dc",
  boxShadow: "0 2px 14px rgba(0,51,102,.07)", overflow: "hidden",
};

const channelStyle = (ch: string) =>
  ch === "LINE OA"
    ? { bg: "#e5faf0", text: "#22c55e" }
    : { bg: "#dbeafe", text: "#3b82f6" };

export function LeadPoolTable() {
  const [assigned, setAssigned] = useState<Set<string>>(new Set());
  const handleAssign = (id: string) => setAssigned(prev => new Set([...prev, id]));
  const pending = leadPool.filter(l => !assigned.has(l.id)).length;

  return (
    <div style={CARD}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 14px", borderBottom: "1px solid #cfd4dc" }}>
        <div>
          <p style={{ fontSize: "0.86rem", fontWeight: 700, color: "#2D2D2D", margin: 0 }}>ลีดส่วนกลาง</p>
          <p style={{ fontSize: "0.72rem", color: "#6b7280", margin: "2px 0 0" }}>ลีดจากช่องทาง HQ ยังไม่มีสาขารับผิดชอบ</p>
        </div>
        {pending > 0 && (
          <span style={{ fontSize: "0.68rem", fontWeight: 700, background: "#fef3cd", color: "#f59e0b", border: "1px solid #fde68a", borderRadius: 99, padding: "3px 10px" }}>
            {pending} รายการ
          </span>
        )}
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8f9fb", borderBottom: "1px solid #cfd4dc" }}>
              {["ลูกค้า", "จังหวัด", "ช่องทาง", "รับเมื่อ", "ประเภท", "มูลค่า", "มอบหมาย"].map(h => (
                <th key={h} style={{ fontSize: "0.67rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", padding: "10px 14px", textAlign: h === "มอบหมาย" ? "right" : "left", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leadPool.map(lead => {
              const done = assigned.has(lead.id);
              const ch = channelStyle(lead.channel);
              return (
                <tr key={lead.id} style={{ borderBottom: "1px solid #f0f4f8", opacity: done ? 0.5 : 1 }}
                  onMouseEnter={e => { if (!done) (e.currentTarget as HTMLElement).style.background = "#f8f9fb"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}>
                  <td style={{ padding: "12px 14px" }}>
                    <p style={{ fontSize: "0.82rem", fontWeight: 700, color: "#2D2D2D", margin: 0 }}>{lead.name}</p>
                    <p style={{ fontSize: "0.65rem", color: "#6b7280", margin: "2px 0 0" }}>{lead.id}</p>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "0.78rem", color: "#6b7280" }}>{lead.province}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 99, fontSize: "0.68rem", fontWeight: 600, background: ch.bg, color: ch.text }}>
                      {lead.channel === "LINE OA" ? <MessageCircle size={10} /> : <Globe size={10} />} {lead.channel}
                    </span>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "0.78rem", color: "#6b7280" }}>{lead.createdAt}</td>
                  <td style={{ padding: "12px 14px", fontSize: "0.78rem", color: "#6b7280" }}>{lead.product}</td>
                  <td style={{ padding: "12px 14px", fontSize: "0.84rem", fontWeight: 700, color: "#2D2D2D" }}>{lead.value}</td>
                  <td style={{ padding: "12px 14px", textAlign: "right" }}>
                    {done ? (
                      <span style={{ fontSize: "0.72rem", color: "#22c55e", fontWeight: 700 }}>✓ มอบหมายแล้ว</span>
                    ) : (
                      <button onClick={() => handleAssign(lead.id)}
                        style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 12px", background: "#003366", color: "#fff", border: "none", borderRadius: 9, fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(0,51,102,.25)" }}>
                        <UserPlus size={11} /> มอบหมาย
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
