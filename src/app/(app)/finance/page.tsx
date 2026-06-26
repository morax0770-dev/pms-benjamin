"use client";

import React, { useState, useMemo } from "react";
import {
  invoices, payments,
  invoiceStatusLabel, invoiceStatusColor,
  paymentMethodLabel, paymentMethodColor,
  paymentStatusLabel, paymentStatusColor,
  type InvoiceStatus,
} from "@/lib/mock";
import { Banknote, FileText, Clock, AlertCircle, FileEdit } from "lucide-react";

const CARD: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  border: "1px solid #cfd4dc",
  boxShadow: "0 2px 14px rgba(0,51,102,.07)",
};

function fmt(n: number) {
  return "฿" + n.toLocaleString("th-TH");
}

export default function FinancePage() {
  const [tab, setTab] = useState<"invoices" | "payments">("invoices");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");

  const totalPaid = useMemo(
    () => invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.total, 0),
    []
  );
  const totalPending = useMemo(
    () => invoices.filter(i => i.status === "sent").reduce((s, i) => s + i.total, 0),
    []
  );
  const totalOverdue = useMemo(
    () => invoices.filter(i => i.status === "overdue").reduce((s, i) => s + i.total, 0),
    []
  );
  const totalDraft = useMemo(
    () => invoices.filter(i => i.status === "draft").reduce((s, i) => s + i.total, 0),
    []
  );

  const filteredInvoices = useMemo(
    () => statusFilter === "all" ? invoices : invoices.filter(i => i.status === statusFilter),
    [statusFilter]
  );

  const kpiCards = [
    { label: "รับแล้ว", value: fmt(totalPaid), color: "#22c55e", bg: "#e5faf0", icon: <Banknote size={18} /> },
    { label: "รอชำระ", value: fmt(totalPending), color: "#003366", bg: "#dce5f0", icon: <Clock size={18} /> },
    { label: "เกินกำหนด", value: fmt(totalOverdue), color: "#f04d6a", bg: "#fdeaed", icon: <AlertCircle size={18} /> },
    { label: "ร่าง", value: fmt(totalDraft), color: "#6b7280", bg: "#f0f4f8", icon: <FileEdit size={18} /> },
  ];

  const STATUS_FILTERS: { label: string; value: InvoiceStatus | "all" }[] = [
    { label: "ทั้งหมด", value: "all" },
    { label: "รับแล้ว", value: "paid" },
    { label: "ส่งแล้ว", value: "sent" },
    { label: "เกินกำหนด", value: "overdue" },
    { label: "ร่าง", value: "draft" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#2D2D2D", marginBottom: 3 }}>การเงิน</h1>
        <p style={{ fontSize: "0.76rem", color: "#6b7280" }}>ใบแจ้งหนี้และประวัติการชำระเงิน</p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
        {kpiCards.map(k => (
          <div key={k.label} style={{ ...CARD, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: k.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: k.color, flexShrink: 0,
            }}>
              {k.icon}
            </div>
            <div>
              <div style={{ fontSize: "0.68rem", color: "#6b7280", fontWeight: 600, marginBottom: 4 }}>{k.label}</div>
              <div style={{ fontSize: "1.15rem", fontWeight: 800, color: k.color }}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Toggle */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "#f0f4f8", borderRadius: 12, padding: 4, width: "fit-content" }}>
        {(["invoices", "payments"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 20px",
              borderRadius: 9,
              border: "none",
              cursor: "pointer",
              fontSize: "0.82rem",
              fontWeight: 700,
              background: tab === t ? "#fff" : "transparent",
              color: tab === t ? "#003366" : "#6b7280",
              boxShadow: tab === t ? "0 1px 6px rgba(0,0,0,0.1)" : "none",
              transition: "all .15s",
            }}
          >
            {t === "invoices" ? (
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <FileText size={14} /> ใบแจ้งหนี้
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Banknote size={14} /> ประวัติชำระ
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Invoices Tab */}
      {tab === "invoices" && (
        <div style={CARD}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #cfd4dc", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#2D2D2D" }}>
              ใบแจ้งหนี้ทั้งหมด ({filteredInvoices.length})
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {STATUS_FILTERS.map(f => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 99,
                    border: "1px solid",
                    borderColor: statusFilter === f.value ? "#003366" : "#cfd4dc",
                    background: statusFilter === f.value ? "#003366" : "#fff",
                    color: statusFilter === f.value ? "#fff" : "#6b7280",
                    fontSize: "0.72rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #cfd4dc", background: "#f8f9fb" }}>
                  {["เลขที่", "ลูกค้า", "โครงการ", "งวด", "ครบกำหนด", "ยอดรวม", "สถานะ"].map(h => (
                    <th key={h} style={{ fontSize: "0.67rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", padding: "10px 14px", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map(inv => {
                  const sc = invoiceStatusColor[inv.status];
                  return (
                    <tr
                      key={inv.id}
                      style={{ borderBottom: "1px solid #f0f4f8" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f8f9fb"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}
                    >
                      <td style={{ padding: "11px 14px", fontSize: "0.78rem", fontWeight: 700, color: "#003366", whiteSpace: "nowrap" }}>{inv.id}</td>
                      <td style={{ padding: "11px 14px", fontSize: "0.84rem", fontWeight: 600, color: "#2D2D2D" }}>{inv.client}</td>
                      <td style={{ padding: "11px 14px", fontSize: "0.78rem", color: "#6b7280", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{inv.project}</td>
                      <td style={{ padding: "11px 14px", fontSize: "0.78rem", color: "#475569" }}>{inv.milestone}</td>
                      <td style={{ padding: "11px 14px", fontSize: "0.78rem", color: inv.status === "overdue" ? "#f04d6a" : "#6b7280", fontWeight: inv.status === "overdue" ? 700 : 400, whiteSpace: "nowrap" }}>{inv.dueDate}</td>
                      <td style={{ padding: "11px 14px", fontSize: "0.9rem", fontWeight: 800, color: "#2D2D2D", whiteSpace: "nowrap" }}>{fmt(inv.total)}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{
                          padding: "4px 10px", borderRadius: 99,
                          fontSize: "0.68rem", fontWeight: 700,
                          background: sc.bg, color: sc.text,
                          whiteSpace: "nowrap",
                        }}>
                          {invoiceStatusLabel[inv.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Footer sum */}
          <div style={{ padding: "12px 14px", borderTop: "1px solid #cfd4dc", display: "flex", justifyContent: "flex-end", gap: 24 }}>
            <span style={{ fontSize: "0.76rem", color: "#6b7280", fontWeight: 600 }}>
              รวม {filteredInvoices.length} รายการ
            </span>
            <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#2D2D2D" }}>
              {fmt(filteredInvoices.reduce((s, i) => s + i.total, 0))}
            </span>
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {tab === "payments" && (
        <div style={CARD}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #cfd4dc" }}>
            <div style={{ fontSize: "0.84rem", fontWeight: 700, color: "#2D2D2D" }}>
              ประวัติการชำระเงิน ({payments.length})
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #cfd4dc", background: "#f8f9fb" }}>
                  {["รหัสชำระ", "ใบแจ้งหนี้อ้างอิง", "ลูกค้า", "วิธีชำระ", "ยอด", "วันที่", "ผู้รับผิดชอบ", "สถานะ"].map(h => (
                    <th key={h} style={{ fontSize: "0.67rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", padding: "10px 14px", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map(pay => {
                  const mc = paymentMethodColor[pay.method];
                  const sc = paymentStatusColor[pay.status];
                  return (
                    <tr
                      key={pay.id}
                      style={{ borderBottom: "1px solid #f0f4f8" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f8f9fb"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}
                    >
                      <td style={{ padding: "11px 14px", fontSize: "0.78rem", fontWeight: 700, color: "#003366", whiteSpace: "nowrap" }}>{pay.id}</td>
                      <td style={{ padding: "11px 14px", fontSize: "0.78rem", color: "#475569" }}>{pay.invoiceRef}</td>
                      <td style={{ padding: "11px 14px", fontSize: "0.84rem", fontWeight: 600, color: "#2D2D2D" }}>{pay.client}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ padding: "4px 10px", borderRadius: 99, fontSize: "0.68rem", fontWeight: 700, background: mc.bg, color: mc.text, whiteSpace: "nowrap" }}>
                          {paymentMethodLabel[pay.method]}
                        </span>
                      </td>
                      <td style={{ padding: "11px 14px", fontSize: "0.9rem", fontWeight: 800, color: "#22c55e", whiteSpace: "nowrap" }}>{fmt(pay.amount)}</td>
                      <td style={{ padding: "11px 14px", fontSize: "0.78rem", color: "#6b7280", whiteSpace: "nowrap" }}>{pay.paidDate}</td>
                      <td style={{ padding: "11px 14px", fontSize: "0.78rem", color: "#475569" }}>{pay.salesPerson}</td>
                      <td style={{ padding: "11px 14px" }}>
                        <span style={{ padding: "4px 10px", borderRadius: 99, fontSize: "0.68rem", fontWeight: 700, background: sc.bg, color: sc.text, whiteSpace: "nowrap" }}>
                          {paymentStatusLabel[pay.status]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Footer sum */}
          <div style={{ padding: "12px 14px", borderTop: "1px solid #cfd4dc", display: "flex", justifyContent: "flex-end", gap: 24 }}>
            <span style={{ fontSize: "0.76rem", color: "#6b7280", fontWeight: 600 }}>
              ยืนยันแล้ว {payments.filter(p => p.status === "confirmed").length} รายการ
            </span>
            <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#22c55e" }}>
              {fmt(payments.filter(p => p.status === "confirmed").reduce((s, p) => s + p.amount, 0))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
