"use client";

import { useState } from "react";
import { pendingApprovals } from "@/lib/mock";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";

type ActionState = Record<string, "approved" | "rejected">;

const CARD: React.CSSProperties = {
  background: "#fff", borderRadius: 16, border: "1px solid #cfd4dc",
  boxShadow: "0 2px 14px rgba(0,51,102,.07)", overflow: "hidden",
};

export function ApprovalQueue() {
  const [actions, setActions] = useState<ActionState>({});
  const act = (id: string, action: "approved" | "rejected") =>
    setActions(prev => ({ ...prev, [id]: action }));
  const pendingCount = pendingApprovals.filter(a => !actions[a.id]).length;

  return (
    <div style={CARD}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 14px", borderBottom: "1px solid #cfd4dc" }}>
        <div>
          <p style={{ fontSize: "0.86rem", fontWeight: 700, color: "#2D2D2D", margin: 0 }}>รออนุมัติใบเสนอราคา</p>
          <p style={{ fontSize: "0.72rem", color: "#6b7280", margin: "2px 0 0" }}>ส่วนลดเกินเกณฑ์ที่กำหนด — ต้องผ่าน HQ</p>
        </div>
        {pendingCount > 0 && (
          <span style={{ fontSize: "0.68rem", fontWeight: 700, background: "#fdeaed", color: "#f04d6a", border: "1px solid #fca5a5", borderRadius: 99, padding: "3px 10px" }}>
            {pendingCount} รายการ
          </span>
        )}
      </div>

      {/* Items */}
      <div>
        {pendingApprovals.map(item => {
          const status = actions[item.id];
          const highDiscount = item.discountPct >= 15;

          return (
            <div key={item.id}
              style={{ padding: "14px 20px", borderBottom: "1px solid #f0f4f8", opacity: status ? 0.5 : 1, background: status ? "#f8f9fb" : "transparent" }}
              onMouseEnter={e => { if (!status) (e.currentTarget as HTMLElement).style.background = "#f8f9fb"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = status ? "#f8f9fb" : "transparent"; }}>

              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                {/* Warning icon */}
                <AlertTriangle size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 3 }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#2D2D2D" }}>{item.quoteNo}</span>
                    <span style={{ fontSize: "0.65rem", color: "#6b7280" }}>· สาขา{item.dealer}</span>
                  </div>
                  <p style={{ fontSize: "0.78rem", color: "#2D2D2D", margin: "0 0 5px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.customer}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.68rem", color: "#6b7280" }}>
                      มูลค่า: <span style={{ fontWeight: 700, color: "#2D2D2D" }}>{item.total}</span>
                    </span>
                    <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 6, background: highDiscount ? "#fdeaed" : "#fef3cd", color: highDiscount ? "#f04d6a" : "#f59e0b" }}>
                      ส่วนลด {item.discountPct}%
                    </span>
                    <span style={{ fontSize: "0.68rem", color: "#6b7280" }}>{item.requestedAt}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                  {status === "approved" ? (
                    <span style={{ fontSize: "0.72rem", color: "#22c55e", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                      <CheckCircle size={13} /> อนุมัติแล้ว
                    </span>
                  ) : status === "rejected" ? (
                    <span style={{ fontSize: "0.72rem", color: "#f04d6a", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                      <XCircle size={13} /> ปฏิเสธแล้ว
                    </span>
                  ) : (
                    <>
                      <button onClick={() => act(item.id, "rejected")}
                        style={{ width: 30, height: 30, borderRadius: 9, border: "1px solid #fca5a5", background: "#fff", color: "#f04d6a", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fdeaed"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}>
                        <XCircle size={16} />
                      </button>
                      <button onClick={() => act(item.id, "approved")}
                        style={{ width: 30, height: 30, borderRadius: 9, border: "1px solid #a7f3d0", background: "#fff", color: "#22c55e", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#e5faf0"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}>
                        <CheckCircle size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {pendingApprovals.length === 0 && (
          <div style={{ padding: "28px 20px", textAlign: "center", fontSize: "0.78rem", color: "#6b7280" }}>
            ไม่มีรายการรออนุมัติ
          </div>
        )}
      </div>
    </div>
  );
}
