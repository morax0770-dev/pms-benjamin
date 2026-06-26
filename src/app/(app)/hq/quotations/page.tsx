"use client";

import React, { useState, useMemo } from "react";
import {
  quotations, customers, quotationStatusLabel, quotationStatusColor,
  type QuotationStatus, type QuotationMock,
} from "@/lib/mock";
import { Search, FileText, Plus, Edit2, Trash2, X, ChevronDown } from "lucide-react";

const PRIMARY = "#003366";
const STEEL   = "#2D2D2D";
const BORDER  = "#e2e8f0";
const MUTED   = "#6b7280";
const BG      = "#f4f6f9";

const STATUS_ORDER: QuotationStatus[] = ["draft", "sent", "won", "lost", "expired"];
const STATUS_DOT: Record<QuotationStatus, string> = {
  draft: "#9ca3af", sent: "#003366", won: "#22c55e", lost: "#f04d6a", expired: "#f59e0b",
};
const DEALER_NAMES = ["สาขานนทบุรี","สาขาราชบุรี","สาขาระยอง","สาขาเชียงใหม่","สาขาสมุทรปราการ"];
const BUILDING_TYPES = ["โกดังสินค้า","โรงงาน","อาคารเกษตร","งานตามแบบ","อื่นๆ"];

type QRow = QuotationMock & { dealer: string };

const INIT_DATA: QRow[] = quotations.map((q, i) => ({
  ...q,
  dealer: DEALER_NAMES[i % DEALER_NAMES.length],
}));

type QForm = {
  customer: string; project: string; totalValue: number;
  status: QuotationStatus; dealer: string;
  buildingType: string; area: number; date: string;
};

function blankForm(): QForm {
  return { customer: "", project: "", totalValue: 0, status: "draft", dealer: DEALER_NAMES[0], buildingType: "โกดังสินค้า", area: 0, date: new Date().toISOString().slice(0, 10) };
}

function fmtMoney(v: number) { return "฿" + v.toLocaleString("th-TH"); }
function fmtDate(d: string) {
  if (!d || d === "—") return "—";
  const [y, m, day] = d.split("-");
  const mo = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return `${parseInt(day)} ${mo[parseInt(m)-1]} ${parseInt(y)+543}`;
}

function QModal({ title, initial, onSave, onClose }: {
  title: string; initial: QForm;
  onSave: (f: QForm) => void; onClose: () => void;
}) {
  const [form, setForm] = useState(initial);
  const INP: React.CSSProperties = { width: "100%", border: `1px solid ${BORDER}`, borderRadius: 9, padding: "8px 11px", fontSize: "0.82rem", outline: "none", color: STEEL, boxSizing: "border-box" };
  const LBL: React.CSSProperties = { fontSize: "0.68rem", fontWeight: 700, color: MUTED, display: "block", marginBottom: 5 };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 200 }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 210, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, pointerEvents: "none" }}>
        <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, border: `1px solid ${BORDER}`, boxShadow: "0 24px 80px rgba(0,51,102,.22)", width: "100%", maxWidth: 520, pointerEvents: "auto", overflow: "hidden" }}>
          <div style={{ background: PRIMARY, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 800, color: "#fff", fontSize: "0.9rem" }}>{title}</span>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 7, width: 28, height: 28, cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={13} /></button>
          </div>
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 13 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={LBL}>ลูกค้า *</label>
                <select value={form.customer} onChange={e => setForm(p => ({ ...p, customer: e.target.value }))} style={INP}>
                  <option value="">-- เลือกลูกค้า --</option>
                  {customers.map(c => <option key={c.id} value={c.company}>{c.company}</option>)}
                </select>
              </div>
              <div>
                <label style={LBL}>สาขา</label>
                <select value={form.dealer} onChange={e => setForm(p => ({ ...p, dealer: e.target.value }))} style={INP}>
                  {DEALER_NAMES.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={LBL}>โครงการ *</label>
              <input value={form.project} onChange={e => setForm(p => ({ ...p, project: e.target.value }))} placeholder="ชื่อโครงการ" style={INP} autoFocus />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={LBL}>มูลค่า (บาท) *</label>
                <input type="number" value={form.totalValue || ""} onChange={e => setForm(p => ({ ...p, totalValue: Number(e.target.value) }))} placeholder="0" style={INP} />
              </div>
              <div>
                <label style={LBL}>สถานะ</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as QuotationStatus }))} style={INP}>
                  {STATUS_ORDER.map(s => <option key={s} value={s}>{quotationStatusLabel[s]}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={LBL}>ประเภทอาคาร</label>
                <select value={form.buildingType} onChange={e => setForm(p => ({ ...p, buildingType: e.target.value }))} style={INP}>
                  {BUILDING_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label style={LBL}>พื้นที่ (ม²)</label>
                <input type="number" value={form.area || ""} onChange={e => setForm(p => ({ ...p, area: Number(e.target.value) }))} placeholder="0" style={INP} />
              </div>
            </div>
            <div>
              <label style={LBL}>วันที่</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} style={INP} />
            </div>
          </div>
          <div style={{ padding: "13px 20px", borderTop: `1px solid ${BORDER}`, display: "flex", gap: 8, justifyContent: "flex-end", background: "#fafafa" }}>
            <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 9, border: `1px solid ${BORDER}`, background: "#fff", color: STEEL, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>ยกเลิก</button>
            <button onClick={() => { if (form.customer && form.project && form.totalValue) { onSave(form); onClose(); } }}
              style={{ padding: "8px 22px", borderRadius: 9, border: "none", background: PRIMARY, color: "#fff", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>บันทึก</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function HQQuotationsPage() {
  const [data,         setData]         = useState<QRow[]>(INIT_DATA);
  const [query,        setQuery]        = useState("");
  const [filterStatus, setFilterStatus] = useState<QuotationStatus | "ALL">("ALL");
  const [filterDealer, setFilterDealer] = useState("ALL");
  const [modal,        setModal]        = useState<"add" | QRow | null>(null);
  const [delId,        setDelId]        = useState<string | null>(null);
  const [statusPop,    setStatusPop]    = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return data.filter(row => {
      const matchQ = !q || row.id.toLowerCase().includes(q) || row.customer.toLowerCase().includes(q) || row.project.toLowerCase().includes(q);
      const matchS = filterStatus === "ALL" || row.status === filterStatus;
      const matchD = filterDealer === "ALL" || row.dealer === filterDealer;
      return matchQ && matchS && matchD;
    });
  }, [data, query, filterStatus, filterDealer]);

  const totalWon    = data.filter(q => q.status === "won").reduce((s, q) => s + q.totalValue, 0);
  const countWon    = data.filter(q => q.status === "won").length;
  const countSent   = data.filter(q => q.status === "sent").length;
  const winRate     = data.length > 0 ? Math.round((countWon / data.length) * 100) : 0;

  function addQ(form: QForm) {
    const newId = `Q-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900) + 100).padStart(4, "0")}`;
    setData(d => [...d, {
      id: newId, customer: form.customer, project: form.project,
      total: fmtMoney(form.totalValue), totalValue: form.totalValue,
      materialCost: form.totalValue, province: "", buildingType: form.buildingType,
      area: form.area, status: form.status, date: form.date,
      items: 0, customerId: 0, projectId: 0, dealer: form.dealer,
    }]);
  }
  function editQ(id: string, form: QForm) {
    setData(d => d.map(q => q.id === id ? {
      ...q, customer: form.customer, project: form.project,
      total: fmtMoney(form.totalValue), totalValue: form.totalValue,
      buildingType: form.buildingType, area: form.area,
      status: form.status, date: form.date, dealer: form.dealer,
    } : q));
  }
  function changeStatus(id: string, status: QuotationStatus) {
    setData(d => d.map(q => q.id === id ? { ...q, status } : q));
    setStatusPop(null);
  }
  function deleteQ(id: string) { setData(d => d.filter(q => q.id !== id)); setDelId(null); }

  return (
    <div onClick={() => setStatusPop(null)}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: "1.55rem", fontWeight: 800, color: STEEL, margin: 0 }}>ใบเสนอราคา · ทุกสาขา</h1>
          <div style={{ fontSize: "0.74rem", color: MUTED, marginTop: 4 }}>HQ · จัดการใบเสนอราคาทุกสาขา</div>
        </div>
        <button onClick={() => setModal("add")}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, border: "none", background: PRIMARY, color: "#fff", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,51,102,.25)" }}>
          <Plus size={14} /> สร้างใบเสนอราคา
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "ทั้งหมด",      value: data.length,        sub: "รายการ" },
          { label: "รอการตอบรับ",  value: countSent,          sub: "รายการ" },
          { label: "ปิดการขาย",    value: countWon,           sub: fmtMoney(totalWon) },
          { label: "Win Rate",      value: `${winRate}%`,      sub: "อัตราปิด" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, border: `1px solid ${BORDER}`, padding: "18px 20px" }}>
            <div style={{ fontSize: "0.68rem", color: MUTED, fontWeight: 600, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: "2rem", fontWeight: 900, color: STEEL, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: "0.65rem", color: MUTED, marginTop: 6 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ background: "#fff", borderRadius: "12px 12px 0 0", border: `1px solid ${BORDER}`, borderBottom: "none", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "7px 12px", flex: 1, minWidth: 220 }}>
          <Search size={13} color={MUTED} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="ค้นหาเลขที่ / ลูกค้า / โครงการ..."
            style={{ border: "none", outline: "none", fontSize: "0.78rem", color: STEEL, background: "transparent", flex: 1 }} />
          {query && <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, display: "flex", padding: 0 }}><X size={11} /></button>}
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as "ALL" | QuotationStatus)}
          style={{ padding: "7px 12px", borderRadius: 10, border: `1px solid ${BORDER}`, background: "#fff", fontSize: "0.78rem", color: "#374151", outline: "none" }}>
          <option value="ALL">ทุกสถานะ</option>
          {STATUS_ORDER.map(s => <option key={s} value={s}>{quotationStatusLabel[s]}</option>)}
        </select>
        <select value={filterDealer} onChange={e => setFilterDealer(e.target.value)}
          style={{ padding: "7px 12px", borderRadius: 10, border: `1px solid ${BORDER}`, background: "#fff", fontSize: "0.78rem", color: "#374151", outline: "none" }}>
          <option value="ALL">ทุกสาขา</option>
          {DEALER_NAMES.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <span style={{ fontSize: "0.7rem", color: MUTED, marginLeft: "auto" }}>{filtered.length} / {data.length}</span>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderTop: "none", borderRadius: "0 0 14px 14px", overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}`, background: BG }}>
                {["สาขา","ลูกค้า / โครงการ","เลขที่","มูลค่า","ประเภท","สถานะ","วันที่",""].map((h, i) => (
                  <th key={i} style={{ fontSize: "0.62rem", fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", padding: "11px 14px", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: "center", padding: "52px 0", color: MUTED, fontSize: "0.82rem" }}>
                  <FileText size={30} color="#e5e7eb" style={{ display: "block", margin: "0 auto 10px" }} />
                  ไม่พบข้อมูล
                </td></tr>
              )}
              {filtered.map(q => {
                const sc = quotationStatusColor[q.status];
                return (
                  <tr key={q.id} style={{ borderBottom: "1px solid #f3f4f6" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = BG; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "0.7rem", fontWeight: 600, color: PRIMARY, padding: "3px 9px", borderRadius: 99, background: "#dce5f0" }}>{q.dealer}</span>
                    </td>
                    <td style={{ padding: "12px 14px", minWidth: 180 }}>
                      <div style={{ fontSize: "0.8rem", fontWeight: 700, color: STEEL }}>{q.customer}</div>
                      <div style={{ fontSize: "0.68rem", color: MUTED, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{q.project}</div>
                    </td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "0.74rem", fontWeight: 700, color: STEEL, fontFamily: "monospace" }}>{q.id}</span>
                    </td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "0.86rem", fontWeight: 800, color: STEEL }}>{q.total}</span>
                    </td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <div style={{ fontSize: "0.72rem", color: STEEL }}>{q.buildingType}</div>
                      <div style={{ fontSize: "0.65rem", color: MUTED }}>{q.area?.toLocaleString()} ม²</div>
                    </td>
                    {/* Status — clickable dropdown */}
                    <td style={{ padding: "12px 14px", position: "relative" }}>
                      <button onClick={e => { e.stopPropagation(); setStatusPop(p => p === q.id ? null : q.id); }}
                        style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, fontSize: "0.68rem", fontWeight: 700, background: sc.bg, color: sc.text, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: STATUS_DOT[q.status] }} />
                        {quotationStatusLabel[q.status]}
                        <ChevronDown size={10} />
                      </button>
                      {statusPop === q.id && (
                        <div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: "calc(100% - 4px)", left: 14, zIndex: 50, background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,.12)", overflow: "hidden", minWidth: 160 }}>
                          {STATUS_ORDER.map(s => (
                            <button key={s} onClick={() => changeStatus(q.id, s)}
                              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 14px", border: "none", background: q.status === s ? BG : "#fff", cursor: "pointer", fontSize: "0.75rem", color: s === q.status ? PRIMARY : STEEL, fontWeight: s === q.status ? 700 : 400, textAlign: "left" }}>
                              <span style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS_DOT[s], flexShrink: 0 }} />
                              {quotationStatusLabel[s]}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "0.72rem", color: MUTED }}>{fmtDate(q.date)}</span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: 5 }}>
                        <button onClick={() => setModal(q)} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${BORDER}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: PRIMARY }}>
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => setDelId(q.id)} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #fdeaed", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#f04d6a" }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "11px 16px", borderTop: `1px solid ${BORDER}` }}>
          <span style={{ fontSize: "0.7rem", color: MUTED }}>แสดง {filtered.length} จาก {data.length} รายการ</span>
        </div>
      </div>

      {/* Modals */}
      {modal !== null && (
        <QModal
          title={modal === "add" ? "สร้างใบเสนอราคาใหม่" : "แก้ไขใบเสนอราคา"}
          initial={modal === "add" ? blankForm() : {
            customer: modal.customer, project: modal.project,
            totalValue: modal.totalValue, status: modal.status,
            dealer: modal.dealer, buildingType: modal.buildingType,
            area: modal.area, date: modal.date,
          }}
          onSave={form => { if (modal === "add") addQ(form); else editQ(modal.id, form); }}
          onClose={() => setModal(null)}
        />
      )}
      {delId !== null && (
        <>
          <div onClick={() => setDelId(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", zIndex: 200 }} />
          <div style={{ position: "fixed", inset: 0, zIndex: 210, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, border: `1px solid ${BORDER}`, boxShadow: "0 20px 60px rgba(0,0,0,.15)", width: 300, pointerEvents: "auto", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px 14px", borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: STEEL }}>ยืนยันการลบ</div>
                <div style={{ fontSize: "0.74rem", color: MUTED, marginTop: 4 }}>{delId} จะถูกลบถาวร</div>
              </div>
              <div style={{ display: "flex", gap: 8, padding: "14px 20px" }}>
                <button onClick={() => setDelId(null)} style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: `1px solid ${BORDER}`, background: "#fff", color: STEEL, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>ยกเลิก</button>
                <button onClick={() => deleteQ(delId!)} style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "none", background: "#f04d6a", color: "#fff", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>ลบ</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
