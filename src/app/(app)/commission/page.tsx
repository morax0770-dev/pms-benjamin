"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  commissions as INIT_DATA, commissionStatusLabel, commissionStatusColor,
  type CommissionMock, type CommissionStatus,
} from "@/lib/mock";
import { TrendingUp, DollarSign, Clock, CheckCircle2, Receipt, ChevronDown, ChevronUp } from "lucide-react";

const PRIMARY = "#003366";
const BORDER  = "#cfd4dc";
const MUTED   = "#6b7280";
const CARD: React.CSSProperties = {
  background: "#fff", borderRadius: 16,
  border: `1px solid ${BORDER}`, boxShadow: "0 2px 14px rgba(0,51,102,.07)",
};

function fmt(n: number) { return "฿" + n.toLocaleString("th-TH"); }
function fmtDate(d: string | undefined) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  const mo = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return `${parseInt(day)} ${mo[parseInt(m)-1]} ${parseInt(y)+543}`;
}

type SortKey = "closedDate" | "dealValue" | "commissionAmount" | "status";
type SortDir = "asc" | "desc";

export default function CommissionPage() {
  const [data]          = useState<CommissionMock[]>(INIT_DATA);
  const [filterStatus, setFilter] = useState<CommissionStatus | "ALL">("ALL");
  const [sortKey, setSortKey]     = useState<SortKey>("closedDate");
  const [sortDir, setSortDir]     = useState<SortDir>("desc");

  function handleSort(k: SortKey) {
    if (sortKey === k) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("desc"); }
  }
  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronDown size={10} style={{ marginLeft: 2, opacity: 0.3 }} />;
    return sortDir === "asc" ? <ChevronUp size={10} style={{ marginLeft: 2 }} /> : <ChevronDown size={10} style={{ marginLeft: 2 }} />;
  }

  const filtered = useMemo(() => {
    let rows = filterStatus === "ALL" ? data : data.filter(c => c.status === filterStatus);
    return [...rows].sort((a, b) => {
      const va = a[sortKey] as string | number;
      const vb = b[sortKey] as string | number;
      const cmp = typeof va === "number" ? (va - (vb as number)) : (va as string).localeCompare(vb as string, "th");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [data, filterStatus, sortKey, sortDir]);

  const stats = useMemo(() => {
    const paid     = data.filter(c => c.status === "paid");
    const approved = data.filter(c => c.status === "approved");
    const pending  = data.filter(c => c.status === "pending");
    return {
      totalEarned:   data.reduce((s, c) => s + c.commissionAmount, 0),
      paidAmount:    paid.reduce((s, c) => s + c.commissionAmount, 0),
      approvedAmount: approved.reduce((s, c) => s + c.commissionAmount, 0),
      pendingAmount: pending.reduce((s, c) => s + c.commissionAmount, 0),
      deals: data.length,
    };
  }, [data]);

  // Group by period for summary
  const byPeriod = useMemo(() => {
    const map: Record<string, { period: string; total: number; count: number; paid: boolean }> = {};
    data.forEach(c => {
      if (!map[c.period]) map[c.period] = { period: c.period, total: 0, count: 0, paid: c.status === "paid" };
      map[c.period].total += c.commissionAmount;
      map[c.period].count += 1;
      if (c.status !== "paid") map[c.period].paid = false;
    });
    return Object.values(map).reverse();
  }, [data]);

  const STATUSES: (CommissionStatus | "ALL")[] = ["ALL", "pending", "approved", "paid"];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#2D2D2D", marginBottom: 3 }}>คอมมิชชัน</h1>
        <p style={{ fontSize: "0.76rem", color: MUTED }}>รายได้ค่าคอมมิชชันจากการปิดการขาย</p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        {[
          { label: "รวมทุกงาน",    value: fmt(stats.totalEarned),    color: "#2D2D2D", icon: <TrendingUp size={18} color="#2D2D2D" />,  bg: "#f4f6f9" },
          { label: "จ่ายแล้ว",    value: fmt(stats.paidAmount),     color: "#22c55e", icon: <CheckCircle2 size={18} color="#22c55e" />, bg: "#e5faf0" },
          { label: "อนุมัติแล้ว", value: fmt(stats.approvedAmount), color: "#3b82f6", icon: <DollarSign size={18} color="#3b82f6" />,   bg: "#dbeafe" },
          { label: "รอการอนุมัติ", value: fmt(stats.pendingAmount),  color: "#f59e0b", icon: <Clock size={18} color="#f59e0b" />,        bg: "#fef3cd" },
        ].map((s, i) => (
          <div key={i} style={{ ...CARD, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: MUTED }}>{s.label}</span>
              <div style={{ background: s.bg, borderRadius: 8, padding: 6 }}>{s.icon}</div>
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 14 }}>
        {/* Main table */}
        <div>
          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
            {STATUSES.map(s => {
              const cnt = s === "ALL" ? data.length : data.filter(c => c.status === s).length;
              const active = filterStatus === s;
              const col = s === "ALL" ? { bg: "#dce5f0", text: PRIMARY } : commissionStatusColor[s];
              return (
                <button key={s} onClick={() => setFilter(s)}
                  style={{ padding: "5px 14px", borderRadius: 99, border: `1px solid ${active ? col.text + "60" : BORDER}`, background: active ? col.bg : "#fff", color: active ? col.text : MUTED, fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}>
                  {s === "ALL" ? "ทั้งหมด" : commissionStatusLabel[s]} ({cnt})
                </button>
              );
            })}
          </div>

          <div style={CARD}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${BORDER}`, background: "#f8f9fb" }}>
                    {([
                      { l: "รหัส / โครงการ", k: null },
                      { l: "ลูกค้า",         k: null },
                      { l: "งวด",            k: null },
                      { l: "วันปิดดีล",       k: "closedDate" as SortKey },
                      { l: "มูลค่าดีล",       k: "dealValue" as SortKey },
                      { l: "% คอม",          k: null },
                      { l: "คอมมิชชัน",      k: "commissionAmount" as SortKey },
                      { l: "สถานะ",          k: "status" as SortKey },
                    ] as { l: string; k: SortKey | null }[]).map((col, i) => (
                      <th key={i} onClick={col.k ? () => handleSort(col.k!) : undefined}
                        style={{ padding: "10px 14px", fontSize: "0.63rem", fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", whiteSpace: "nowrap", cursor: col.k ? "pointer" : "default" }}>
                        <span style={{ display: "inline-flex", alignItems: "center" }}>
                          {col.l}{col.k && <SortIcon k={col.k} />}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={8} style={{ textAlign: "center", padding: "40px 0", color: MUTED, fontSize: "0.82rem" }}>ไม่พบรายการ</td></tr>
                  )}
                  {filtered.map(c => {
                    const sc = commissionStatusColor[c.status];
                    return (
                      <tr key={c.id} style={{ borderBottom: "1px solid #f0f4f8" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f8f9fb"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}>
                        <td style={{ padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: "#dce5f0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Receipt size={13} color={PRIMARY} />
                            </div>
                            <div>
                              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: MUTED, fontFamily: "monospace" }}>{c.id}</div>
                              <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#2D2D2D", marginTop: 1 }}>{c.projectTitle}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 14px", fontSize: "0.8rem", color: PRIMARY, fontWeight: 600 }}>{c.client}</td>
                        <td style={{ padding: "12px 14px", fontSize: "0.75rem", color: MUTED }}>{c.period}</td>
                        <td style={{ padding: "12px 14px", fontSize: "0.78rem", color: MUTED, whiteSpace: "nowrap" }}>{fmtDate(c.closedDate)}</td>
                        <td style={{ padding: "12px 14px", fontSize: "0.84rem", fontWeight: 700, color: "#2D2D2D", whiteSpace: "nowrap" }}>{fmt(c.dealValue)}</td>
                        <td style={{ padding: "12px 14px" }}>
                          <span style={{ background: "#dce5f0", color: PRIMARY, padding: "3px 8px", borderRadius: 6, fontSize: "0.72rem", fontWeight: 800 }}>
                            {c.commissionRate}%
                          </span>
                        </td>
                        <td style={{ padding: "12px 14px", fontSize: "1rem", fontWeight: 800, color: c.status === "paid" ? "#22c55e" : c.status === "approved" ? "#3b82f6" : "#f59e0b", whiteSpace: "nowrap" }}>
                          {fmt(c.commissionAmount)}
                        </td>
                        <td style={{ padding: "12px 14px" }}>
                          <div>
                            <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 99, fontSize: "0.65rem", fontWeight: 700, background: sc.bg, color: sc.text }}>
                              {commissionStatusLabel[c.status]}
                            </span>
                            {c.paidDate && (
                              <div style={{ fontSize: "0.62rem", color: MUTED, marginTop: 3 }}>จ่าย: {fmtDate(c.paidDate)}</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{ padding: "10px 16px", borderTop: `1px solid ${BORDER}`, fontSize: "0.72rem", color: MUTED }}>
              แสดง {filtered.length}/{data.length} รายการ
            </div>
          </div>
        </div>

        {/* Period summary sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Rate info */}
          <div style={{ ...CARD, padding: "16px 18px" }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#2D2D2D", marginBottom: 12 }}>อัตราคอมมิชชัน</div>
            <div style={{ background: "#dce5f0", borderRadius: 12, padding: "14px 16px", textAlign: "center" }}>
              <div style={{ fontSize: "2.2rem", fontWeight: 900, color: PRIMARY, lineHeight: 1 }}>5%</div>
              <div style={{ fontSize: "0.7rem", color: MUTED, marginTop: 4 }}>ของมูลค่าดีลที่ปิดแล้ว</div>
            </div>
            <div style={{ marginTop: 12, fontSize: "0.72rem", color: MUTED, lineHeight: 1.6 }}>
              คำนวณจากยอด <strong>ปิดการขาย (won)</strong> เท่านั้น<br />
              ชำระทุกต้นเดือนถัดไป หลัง HQ อนุมัติ
            </div>
          </div>

          {/* Period breakdown */}
          <div style={{ ...CARD, padding: "16px 18px" }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 800, color: "#2D2D2D", marginBottom: 14 }}>สรุปรายเดือน</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {byPeriod.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "#f8f9fb", borderRadius: 10, border: `1px solid ${BORDER}` }}>
                  <div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "#2D2D2D" }}>{p.period}</div>
                    <div style={{ fontSize: "0.65rem", color: MUTED, marginTop: 2 }}>{p.count} ดีล</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 800, color: p.paid ? "#22c55e" : "#f59e0b" }}>{fmt(p.total)}</div>
                    <div style={{ fontSize: "0.62rem", color: p.paid ? "#22c55e" : MUTED, marginTop: 2 }}>
                      {p.paid ? "จ่ายแล้ว" : "รอดำเนินการ"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total summary */}
          <div style={{ ...CARD, padding: "16px 18px", background: PRIMARY }}>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "rgba(255,255,255,.7)", marginBottom: 6 }}>คอมมิชชันรวมทั้งหมด</div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#fff" }}>{fmt(stats.totalEarned)}</div>
            <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                { label: "จ่ายแล้ว",    value: fmt(stats.paidAmount),     color: "#4ade80" },
                { label: "อนุมัติแล้ว", value: fmt(stats.approvedAmount), color: "#93c5fd" },
                { label: "รอการอนุมัติ", value: fmt(stats.pendingAmount),  color: "#fcd34d" },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem" }}>
                  <span style={{ color: "rgba(255,255,255,.65)" }}>{r.label}</span>
                  <span style={{ color: r.color, fontWeight: 700 }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
