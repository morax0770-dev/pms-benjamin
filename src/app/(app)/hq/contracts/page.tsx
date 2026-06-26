"use client";

import React, { useState, useMemo } from "react";
import {
  contracts, contractStatusLabel, contractStatusColor,
  type ContractStatus, type ContractMock,
} from "@/lib/mock";
import { Search, FileSignature, Plus, Edit2, Trash2, X, ChevronDown } from "lucide-react";

const PRIMARY = "#003366";
const STEEL   = "#2D2D2D";
const BORDER  = "#e2e8f0";
const MUTED   = "#6b7280";
const BG      = "#f4f6f9";

const STATUS_ORDER: ContractStatus[] = ["draft", "active", "completed", "cancelled"];
const STATUS_DOT: Record<ContractStatus, string> = {
  draft: "#9ca3af", active: "#003366", completed: "#22c55e", cancelled: "#f04d6a",
};
const DEALER_NAMES = ["สาขานนทบุรี","สาขาราชบุรี","สาขาระยอง","สาขาเชียงใหม่","สาขาสมุทรปราการ"];

type CRow = ContractMock & { dealer: string };

const INIT_DATA: CRow[] = contracts.map((c, i) => ({
  ...c,
  dealer: DEALER_NAMES[i % DEALER_NAMES.length],
}));

type CForm = {
  client: string; contact: string; phone: string; project: string;
  value: number; deposit: number; agentName: string;
  signDate: string; transferDate: string; status: ContractStatus; dealer: string;
};

function blankForm(): CForm {
  const today = new Date().toISOString().slice(0, 10);
  return { client: "", contact: "", phone: "", project: "", value: 0, deposit: 0, agentName: "", signDate: today, transferDate: today, status: "draft", dealer: DEALER_NAMES[0] };
}

function fmtMoney(v: number) { return "฿" + v.toLocaleString("th-TH"); }
function fmtDate(d: string) {
  if (!d || d === "—") return "—";
  const [y, m, day] = d.split("-");
  if (!y || !m || !day) return d;
  const mo = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return `${parseInt(day)} ${mo[parseInt(m)-1]} ${parseInt(y)+543}`;
}

function CModal({ title, initial, onSave, onClose }: {
  title: string; initial: CForm;
  onSave: (f: CForm) => void; onClose: () => void;
}) {
  const [form, setForm] = useState(initial);
  const INP: React.CSSProperties = { width: "100%", border: `1px solid ${BORDER}`, borderRadius: 9, padding: "8px 11px", fontSize: "0.82rem", outline: "none", color: STEEL, boxSizing: "border-box" };
  const LBL: React.CSSProperties = { fontSize: "0.68rem", fontWeight: 700, color: MUTED, display: "block", marginBottom: 5 };
  const remaining = Math.max(0, form.value - form.deposit);

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 200 }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 210, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, pointerEvents: "none" }}>
        <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, border: `1px solid ${BORDER}`, boxShadow: "0 24px 80px rgba(0,51,102,.22)", width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", pointerEvents: "auto", overflow: "hidden" }}>
          <div style={{ background: PRIMARY, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontWeight: 800, color: "#fff", fontSize: "0.9rem" }}>{title}</span>
            <button onClick={onClose} style={{ background: "rgba(255,255,255,.15)", border: "none", borderRadius: 7, width: 28, height: 28, cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={13} /></button>
          </div>
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 13 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={LBL}>ลูกค้า / บริษัท *</label>
                <input value={form.client} onChange={e => setForm(p => ({ ...p, client: e.target.value }))} placeholder="ชื่อบริษัท" style={INP} autoFocus />
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
              <input value={form.project} onChange={e => setForm(p => ({ ...p, project: e.target.value }))} placeholder="ชื่อโครงการ" style={INP} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={LBL}>ผู้ติดต่อ</label>
                <input value={form.contact} onChange={e => setForm(p => ({ ...p, contact: e.target.value }))} placeholder="ชื่อผู้ติดต่อ" style={INP} />
              </div>
              <div>
                <label style={LBL}>โทรศัพท์</label>
                <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="08x-xxx-xxxx" style={INP} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={LBL}>มูลค่าสัญญา (บาท) *</label>
                <input type="number" value={form.value || ""} onChange={e => setForm(p => ({ ...p, value: Number(e.target.value) }))} placeholder="0" style={INP} />
              </div>
              <div>
                <label style={LBL}>มัดจำ / รับแล้ว (บาท)</label>
                <input type="number" value={form.deposit || ""} onChange={e => setForm(p => ({ ...p, deposit: Number(e.target.value) }))} placeholder="0" style={INP} />
              </div>
            </div>
            {form.value > 0 && (
              <div style={{ background: BG, borderRadius: 9, padding: "10px 14px", display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.72rem", color: MUTED, fontWeight: 600 }}>ยอดค้างรับ</span>
                <span style={{ fontSize: "0.82rem", fontWeight: 800, color: remaining > 0 ? "#f59e0b" : "#22c55e" }}>{fmtMoney(remaining)}</span>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={LBL}>วันเซ็นสัญญา</label>
                <input type="date" value={form.signDate} onChange={e => setForm(p => ({ ...p, signDate: e.target.value }))} style={INP} />
              </div>
              <div>
                <label style={LBL}>กำหนดส่งมอบ</label>
                <input type="date" value={form.transferDate} onChange={e => setForm(p => ({ ...p, transferDate: e.target.value }))} style={INP} />
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={LBL}>สถานะ</label>
                <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as ContractStatus }))} style={INP}>
                  {STATUS_ORDER.map(s => <option key={s} value={s}>{contractStatusLabel[s]}</option>)}
                </select>
              </div>
              <div>
                <label style={LBL}>ผู้รับผิดชอบ</label>
                <input value={form.agentName} onChange={e => setForm(p => ({ ...p, agentName: e.target.value }))} placeholder="ชื่อเจ้าหน้าที่" style={INP} />
              </div>
            </div>
          </div>
          <div style={{ padding: "13px 20px", borderTop: `1px solid ${BORDER}`, display: "flex", gap: 8, justifyContent: "flex-end", background: "#fafafa" }}>
            <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 9, border: `1px solid ${BORDER}`, background: "#fff", color: STEEL, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>ยกเลิก</button>
            <button onClick={() => { if (form.client && form.project && form.value) { onSave(form); onClose(); } }}
              style={{ padding: "8px 22px", borderRadius: 9, border: "none", background: PRIMARY, color: "#fff", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>บันทึก</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function HQContractsPage() {
  const [data,         setData]         = useState<CRow[]>(INIT_DATA);
  const [query,        setQuery]        = useState("");
  const [filterStatus, setFilterStatus] = useState<ContractStatus | "ALL">("ALL");
  const [filterDealer, setFilterDealer] = useState("ALL");
  const [modal,        setModal]        = useState<"add" | CRow | null>(null);
  const [delId,        setDelId]        = useState<string | null>(null);
  const [statusPop,    setStatusPop]    = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return data.filter(c => {
      const matchQ = !q || c.id.toLowerCase().includes(q) || c.client.toLowerCase().includes(q) || c.project.toLowerCase().includes(q);
      const matchS = filterStatus === "ALL" || c.status === filterStatus;
      const matchD = filterDealer === "ALL" || c.dealer === filterDealer;
      return matchQ && matchS && matchD;
    });
  }, [data, query, filterStatus, filterDealer]);

  const totalValue   = data.reduce((s, c) => s + c.value, 0);
  const totalDeposit = data.reduce((s, c) => s + c.deposit, 0);
  const totalRemaining = data.reduce((s, c) => s + c.remaining, 0);
  const totalActive  = data.filter(c => c.status === "active").length;

  function addC(form: CForm) {
    const newId = `C-${new Date().getFullYear()}-${String(data.length + 1).padStart(3, "0")}`;
    const remaining = Math.max(0, form.value - form.deposit);
    setData(d => [...d, { id: newId, client: form.client, contact: form.contact, phone: form.phone, project: form.project, value: form.value, deposit: form.deposit, remaining, agentName: form.agentName, signDate: form.signDate, transferDate: form.transferDate, status: form.status, dealer: form.dealer }]);
  }
  function editC(id: string, form: CForm) {
    const remaining = Math.max(0, form.value - form.deposit);
    setData(d => d.map(c => c.id === id ? { ...c, client: form.client, contact: form.contact, phone: form.phone, project: form.project, value: form.value, deposit: form.deposit, remaining, agentName: form.agentName, signDate: form.signDate, transferDate: form.transferDate, status: form.status, dealer: form.dealer } : c));
  }
  function changeStatus(id: string, status: ContractStatus) {
    setData(d => d.map(c => c.id === id ? { ...c, status } : c));
    setStatusPop(null);
  }
  function deleteC(id: string) { setData(d => d.filter(c => c.id !== id)); setDelId(null); }

  return (
    <div onClick={() => setStatusPop(null)}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22 }}>
        <div>
          <h1 style={{ fontSize: "1.55rem", fontWeight: 800, color: STEEL, margin: 0 }}>สัญญา · ทุกสาขา</h1>
          <div style={{ fontSize: "0.74rem", color: MUTED, marginTop: 4 }}>HQ · จัดการสัญญาทุกสาขา</div>
        </div>
        <button onClick={() => setModal("add")}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, border: "none", background: PRIMARY, color: "#fff", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,51,102,.25)" }}>
          <Plus size={14} /> เพิ่มสัญญา
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 16 }}>
        {[
          { label: "สัญญาทั้งหมด",  value: data.length,          sub: "รายการ" },
          { label: "กำลังดำเนินการ", value: totalActive,           sub: "รายการ" },
          { label: "มูลค่ารวม",      value: fmtMoney(totalValue),  sub: "บาท", sm: true },
          { label: "ยอดค้างรับ",     value: fmtMoney(totalRemaining), sub: "บาท", sm: true },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, border: `1px solid ${BORDER}`, padding: "18px 20px" }}>
            <div style={{ fontSize: "0.68rem", color: MUTED, fontWeight: 600, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: s.sm ? "1.1rem" : "2rem", fontWeight: 900, color: STEEL, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: "0.65rem", color: MUTED, marginTop: 6 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Summary bar */}
      <div style={{ background: PRIMARY, borderRadius: 12, padding: "14px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,.6)", fontWeight: 600, marginBottom: 3 }}>เงินมัดจำที่รับแล้ว</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#fff" }}>{fmtMoney(totalDeposit)}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,.6)", fontWeight: 600, marginBottom: 3 }}>ยอดค้างรับรวม</div>
          <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#C0C0C0" }}>{fmtMoney(totalRemaining)}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ background: "#fff", borderRadius: "12px 12px 0 0", border: `1px solid ${BORDER}`, borderBottom: "none", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "7px 12px", flex: 1, minWidth: 220 }}>
          <Search size={13} color={MUTED} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="ค้นหาเลขที่ / ลูกค้า / โครงการ..."
            style={{ border: "none", outline: "none", fontSize: "0.78rem", color: STEEL, background: "transparent", flex: 1 }} />
          {query && <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, display: "flex", padding: 0 }}><X size={11} /></button>}
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as "ALL" | ContractStatus)}
          style={{ padding: "7px 12px", borderRadius: 10, border: `1px solid ${BORDER}`, background: "#fff", fontSize: "0.78rem", color: "#374151", outline: "none" }}>
          <option value="ALL">ทุกสถานะ</option>
          {STATUS_ORDER.map(s => <option key={s} value={s}>{contractStatusLabel[s]}</option>)}
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
                {["สาขา","ลูกค้า / โครงการ","เลขสัญญา","มูลค่า","มัดจำ","ค้างรับ","วันเซ็น","สถานะ",""].map((h, i) => (
                  <th key={i} style={{ fontSize: "0.62rem", fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", padding: "11px 14px", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={9} style={{ textAlign: "center", padding: "52px 0", color: MUTED, fontSize: "0.82rem" }}>
                  <FileSignature size={30} color="#e5e7eb" style={{ display: "block", margin: "0 auto 10px" }} />
                  ไม่พบข้อมูล
                </td></tr>
              )}
              {filtered.map(c => {
                const sc = contractStatusColor[c.status];
                return (
                  <tr key={c.id} style={{ borderBottom: "1px solid #f3f4f6" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = BG; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "0.7rem", fontWeight: 600, color: PRIMARY, padding: "3px 9px", borderRadius: 99, background: "#dce5f0" }}>{c.dealer}</span>
                    </td>
                    <td style={{ padding: "12px 14px", minWidth: 180 }}>
                      <div style={{ fontSize: "0.8rem", fontWeight: 700, color: STEEL }}>{c.client}</div>
                      <div style={{ fontSize: "0.68rem", color: MUTED, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{c.project}</div>
                    </td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "0.74rem", fontWeight: 700, color: STEEL, fontFamily: "monospace" }}>{c.id}</span>
                    </td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "0.82rem", fontWeight: 800, color: STEEL }}>{fmtMoney(c.value)}</span>
                    </td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#22c55e" }}>{fmtMoney(c.deposit)}</span>
                    </td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: c.remaining > 0 ? "#f59e0b" : MUTED }}>{fmtMoney(c.remaining)}</span>
                    </td>
                    <td style={{ padding: "12px 14px", whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: "0.72rem", color: MUTED }}>{fmtDate(c.signDate)}</span>
                    </td>
                    {/* Status dropdown */}
                    <td style={{ padding: "12px 14px", position: "relative" }}>
                      <button onClick={e => { e.stopPropagation(); setStatusPop(p => p === c.id ? null : c.id); }}
                        style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, fontSize: "0.68rem", fontWeight: 700, background: sc.bg, color: sc.text, border: "none", cursor: "pointer", whiteSpace: "nowrap" }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: STATUS_DOT[c.status] }} />
                        {contractStatusLabel[c.status]}
                        <ChevronDown size={10} />
                      </button>
                      {statusPop === c.id && (
                        <div onClick={e => e.stopPropagation()} style={{ position: "absolute", top: "calc(100% - 4px)", left: 14, zIndex: 50, background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,.12)", overflow: "hidden", minWidth: 150 }}>
                          {STATUS_ORDER.map(s => (
                            <button key={s} onClick={() => changeStatus(c.id, s)}
                              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "8px 14px", border: "none", background: c.status === s ? BG : "#fff", cursor: "pointer", fontSize: "0.75rem", color: c.status === s ? PRIMARY : STEEL, fontWeight: c.status === s ? 700 : 400, textAlign: "left" }}>
                              <span style={{ width: 7, height: 7, borderRadius: "50%", background: STATUS_DOT[s], flexShrink: 0 }} />
                              {contractStatusLabel[s]}
                            </button>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", gap: 5 }}>
                        <button onClick={() => setModal(c)} style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${BORDER}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: PRIMARY }}>
                          <Edit2 size={12} />
                        </button>
                        <button onClick={() => setDelId(c.id)} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #fdeaed", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#f04d6a" }}>
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
        <CModal
          title={modal === "add" ? "เพิ่มสัญญาใหม่" : "แก้ไขสัญญา"}
          initial={modal === "add" ? blankForm() : {
            client: modal.client, contact: modal.contact, phone: modal.phone,
            project: modal.project, value: modal.value, deposit: modal.deposit,
            agentName: modal.agentName, signDate: modal.signDate === "—" ? "" : modal.signDate,
            transferDate: modal.transferDate === "—" ? "" : modal.transferDate,
            status: modal.status, dealer: modal.dealer,
          }}
          onSave={form => { if (modal === "add") addC(form); else editC(modal.id, form); }}
          onClose={() => setModal(null)}
        />
      )}
      {delId !== null && (
        <>
          <div onClick={() => setDelId(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", zIndex: 200 }} />
          <div style={{ position: "fixed", inset: 0, zIndex: 210, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, border: `1px solid ${BORDER}`, boxShadow: "0 20px 60px rgba(0,0,0,.15)", width: 300, pointerEvents: "auto", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px 14px", borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: STEEL }}>ยืนยันการลบสัญญา</div>
                <div style={{ fontSize: "0.74rem", color: MUTED, marginTop: 4 }}>{delId} จะถูกลบถาวร</div>
              </div>
              <div style={{ display: "flex", gap: 8, padding: "14px 20px" }}>
                <button onClick={() => setDelId(null)} style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: `1px solid ${BORDER}`, background: "#fff", color: STEEL, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>ยกเลิก</button>
                <button onClick={() => deleteC(delId!)} style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "none", background: "#f04d6a", color: "#fff", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>ลบ</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
