"use client";

import React, { useState, useMemo } from "react";
import { pipelineDeals, pipelineStages, customers, type PipelineDealMock } from "@/lib/mock";
import {
  Search, X, Workflow, Trophy, Plus, Edit2, Trash2,
  Paperclip, CheckSquare, ChevronDown, ChevronUp,
  Check, RotateCcw, ChevronLeft, ChevronRight,
} from "lucide-react";

const PRIMARY = "#003366";
const STEEL   = "#2D2D2D";
const BORDER  = "#e2e8f0";
const MUTED   = "#6b7280";
const BG      = "#f4f6f9";

const DEALER_COLORS: Record<string, string> = {
  "สาขาเชียงใหม่":   "#003366",
  "สาขานนทบุรี":     "#f59e0b",
  "สาขาระยอง":      "#22c55e",
  "สาขาราชบุรี":     "#f04d6a",
  "สาขาสมุทรปราการ": "#475569",
};
const DEALERS = Object.keys(DEALER_COLORS);
const OWNERS = ["สมชาย","วิภา","วิชัย","กาญจนา","ประสิทธิ์","สุดาวรรณ","ปรีดา","สายชล","มานิตย์"];

function fmtM(v: number) { return v >= 1e6 ? `฿${(v/1e6).toFixed(1)}M` : v >= 1000 ? `฿${(v/1000).toFixed(0)}K` : `฿${v.toLocaleString()}`; }

// ── Deal Modal (Add / Edit) ──────────────────────────────────────────
type DealForm = {
  customer: string; project: string; value: number;
  stageId: number; assigned: string; dealer: string; outcome: "active" | "won" | "lost";
};
function blankDealForm(): DealForm {
  return { customer: "", project: "", value: 0, stageId: 1, assigned: OWNERS[0], dealer: DEALERS[0], outcome: "active" };
}

function DealModal({ title, initial, onSave, onClose }: {
  title: string; initial: DealForm;
  onSave: (f: DealForm) => void; onClose: () => void;
}) {
  const [form, setForm] = useState(initial);
  const INP: React.CSSProperties = { width: "100%", border: `1px solid ${BORDER}`, borderRadius: 9, padding: "8px 11px", fontSize: "0.82rem", outline: "none", color: STEEL, boxSizing: "border-box" };
  const LBL: React.CSSProperties = { fontSize: "0.68rem", fontWeight: 700, color: MUTED, display: "block", marginBottom: 5 };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", zIndex: 200 }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 210, display: "flex", alignItems: "center", justifyContent: "center", padding: 20, pointerEvents: "none" }}>
        <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, border: `1px solid ${BORDER}`, boxShadow: "0 24px 80px rgba(0,51,102,.22)", width: "100%", maxWidth: 500, pointerEvents: "auto", overflow: "hidden" }}>
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
                <select value={form.dealer} onChange={e => setForm(p => ({ ...p, dealer: e.target.value, dealerColor: DEALER_COLORS[e.target.value] ?? PRIMARY } as DealForm & {dealerColor:string}))} style={INP}>
                  {DEALERS.map(d => <option key={d} value={d}>{d}</option>)}
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
                <input type="number" value={form.value || ""} onChange={e => setForm(p => ({ ...p, value: Number(e.target.value) }))} placeholder="0" style={INP} />
              </div>
              <div>
                <label style={LBL}>ผู้รับผิดชอบ</label>
                <select value={form.assigned} onChange={e => setForm(p => ({ ...p, assigned: e.target.value }))} style={INP}>
                  {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={LBL}>ขั้นตอน</label>
                <select value={form.stageId} onChange={e => setForm(p => ({ ...p, stageId: Number(e.target.value) }))} style={INP}>
                  {pipelineStages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label style={LBL}>สถานะ</label>
                <select value={form.outcome} onChange={e => setForm(p => ({ ...p, outcome: e.target.value as "active"|"won"|"lost" }))} style={INP}>
                  <option value="active">กำลังดำเนินการ</option>
                  <option value="won">ปิดการขาย (Won)</option>
                  <option value="lost">ไม่ได้งาน (Lost)</option>
                </select>
              </div>
            </div>
          </div>
          <div style={{ padding: "13px 20px", borderTop: `1px solid ${BORDER}`, display: "flex", gap: 8, justifyContent: "flex-end", background: "#fafafa" }}>
            <button onClick={onClose} style={{ padding: "8px 18px", borderRadius: 9, border: `1px solid ${BORDER}`, background: "#fff", color: STEEL, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>ยกเลิก</button>
            <button onClick={() => { if (form.customer && form.project && form.value) { onSave(form); onClose(); } }}
              style={{ padding: "8px 22px", borderRadius: 9, border: "none", background: PRIMARY, color: "#fff", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>บันทึก</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Deal Card ────────────────────────────────────────────────────────
function DealCard({ deal, stageColor, isLast, expanded, onToggle, onEdit, onDelete, onWon, onLost, onReopen, onMoveStage }: {
  deal: PipelineDealMock; stageColor: string; isLast: boolean;
  expanded: boolean;
  onToggle: () => void; onEdit: () => void; onDelete: () => void;
  onWon: () => void; onLost: () => void; onReopen: () => void;
  onMoveStage: (dir: -1 | 1) => void;
}) {
  const [hov, setHov] = useState(false);
  const done  = deal.tasks.filter(t => t.done).length;
  const total = deal.tasks.length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
  const isWonLost = deal.outcome !== "active";

  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: "#fff", borderRadius: 10, border: `1px solid ${BORDER}`, borderLeft: `4px solid ${deal.dealerColor}`, boxShadow: "0 1px 4px rgba(0,0,0,.04)", overflow: "hidden", opacity: isWonLost ? 0.85 : 1 }}>
      <div style={{ padding: "10px 12px" }}>
        {/* Name + controls */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 4 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: "0.76rem", fontWeight: 700, color: STEEL, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{deal.customer}</div>
            {deal.project && <div style={{ fontSize: "0.61rem", color: MUTED, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginTop: 1 }}>{deal.project}</div>}
          </div>
          {hov && (
            <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
              {!isWonLost && (
                <>
                  <button onClick={e => { e.stopPropagation(); onMoveStage(-1); }} title="ย้อนขั้นตอน"
                    style={{ width: 20, height: 20, borderRadius: 5, border: `1px solid ${BORDER}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: MUTED }}>
                    <ChevronLeft size={10} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); onMoveStage(1); }} title="เลื่อนขั้นตอน"
                    style={{ width: 20, height: 20, borderRadius: 5, border: `1px solid ${BORDER}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: MUTED }}>
                    <ChevronRight size={10} />
                  </button>
                </>
              )}
              <button onClick={e => { e.stopPropagation(); onEdit(); }} title="แก้ไข"
                style={{ width: 20, height: 20, borderRadius: 5, border: `1px solid ${BORDER}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: PRIMARY }}>
                <Edit2 size={9} />
              </button>
              <button onClick={e => { e.stopPropagation(); onDelete(); }} title="ลบ"
                style={{ width: 20, height: 20, borderRadius: 5, border: "1px solid #fdeaed", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#f04d6a" }}>
                <Trash2 size={9} />
              </button>
            </div>
          )}
          {deal.outcome === "won" && !hov && <Trophy size={12} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} />}
          {deal.outcome === "lost" && !hov && <span style={{ fontSize: "0.52rem", color: "#f04d6a", fontWeight: 700, flexShrink: 0, marginTop: 3 }}>LOST</span>}
        </div>
        <div style={{ fontSize: "0.9rem", fontWeight: 900, color: PRIMARY, margin: "6px 0" }}>{fmtM(deal.value)}</div>

        {/* Progress */}
        {total > 0 && (
          <div style={{ marginBottom: 6 }}>
            <div style={{ height: 4, borderRadius: 99, background: "#f0f4f8", overflow: "hidden", marginBottom: 2 }}>
              <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#22c55e" : stageColor, borderRadius: 99 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "0.56rem", color: MUTED }}>{done}/{total} งาน</span>
              <span style={{ fontSize: "0.57rem", fontWeight: 700, color: pct === 100 ? "#22c55e" : MUTED }}>{pct}%</span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: deal.dealerColor }} />
            <span style={{ fontSize: "0.57rem", color: MUTED }}>{deal.dealer}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {deal.files.length > 0 && <span style={{ fontSize: "0.55rem", color: PRIMARY, display: "flex", alignItems: "center", gap: 2 }}><Paperclip size={9} />{deal.files.length}</span>}
            {total > 0 && <span style={{ fontSize: "0.55rem", color: MUTED, display: "flex", alignItems: "center", gap: 2 }}><CheckSquare size={9} />{done}/{total}</span>}
            <span style={{ fontSize: "0.56rem", color: MUTED }}>{deal.assigned}</span>
            <button onClick={onToggle} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, display: "flex", padding: 0 }}>
              {expanded ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            </button>
          </div>
        </div>

        {/* Won/Lost / Reopen buttons */}
        {!isWonLost && isLast && (
          <div style={{ display: "flex", gap: 5, marginTop: 8 }}>
            <button onClick={e => { e.stopPropagation(); onWon(); }}
              style={{ flex: 1, padding: "4px 0", borderRadius: 7, border: "none", background: "#dcfce7", color: "#15803d", fontSize: "0.62rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
              <Check size={9} /> Won
            </button>
            <button onClick={e => { e.stopPropagation(); onLost(); }}
              style={{ flex: 1, padding: "4px 0", borderRadius: 7, border: "none", background: "#fee2e2", color: "#dc2626", fontSize: "0.62rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
              <X size={9} /> Lost
            </button>
          </div>
        )}
        {isWonLost && (
          <button onClick={e => { e.stopPropagation(); onReopen(); }}
            style={{ width: "100%", marginTop: 7, padding: "4px 0", borderRadius: 7, border: `1px solid ${BORDER}`, background: "#fff", color: MUTED, fontSize: "0.62rem", fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
            <RotateCcw size={9} /> เปิดใหม่
          </button>
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${BORDER}`, padding: "8px 12px", background: "#fafbfc" }}>
          {deal.tasks.length > 0 && (
            <div style={{ marginBottom: deal.files.length > 0 ? 8 : 0 }}>
              <div style={{ fontSize: "0.57rem", fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>งานย่อย</div>
              {deal.tasks.map(t => (
                <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 3, border: `1.5px solid ${t.done ? "#22c55e" : BORDER}`, background: t.done ? "#22c55e" : "#fff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {t.done && <span style={{ color: "#fff", fontSize: 8, lineHeight: 1 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: "0.64rem", color: t.done ? MUTED : STEEL, textDecoration: t.done ? "line-through" : "none" }}>{t.text}</span>
                </div>
              ))}
            </div>
          )}
          {deal.files.length > 0 && (
            <div>
              <div style={{ fontSize: "0.57rem", fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>ไฟล์แนบ</div>
              {deal.files.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, padding: "2px 0" }}>
                  <Paperclip size={9} color={MUTED} />
                  <span style={{ fontSize: "0.62rem", color: STEEL, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</span>
                  <span style={{ fontSize: "0.57rem", color: MUTED, flexShrink: 0 }}>{f.size}</span>
                </div>
              ))}
            </div>
          )}
          {deal.tasks.length === 0 && deal.files.length === 0 && (
            <div style={{ fontSize: "0.64rem", color: "#c0c8d4", textAlign: "center", padding: "4px 0" }}>ยังไม่มีงานย่อยหรือไฟล์</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────
export default function HQPipelinePage() {
  const [deals,        setDeals]        = useState<PipelineDealMock[]>(pipelineDeals);
  const [query,        setQuery]        = useState("");
  const [filterDealer, setFilterDealer] = useState("ALL");
  const [expanded,     setExpanded]     = useState<Set<number>>(new Set());
  const [modal,        setModal]        = useState<"add" | PipelineDealMock | null>(null);
  const [delId,        setDelId]        = useState<number | null>(null);

  function toggleExpand(id: number) {
    setExpanded(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  }

  function addDeal(form: DealForm) {
    const newId = Math.max(0, ...deals.map(d => d.id)) + 1;
    setDeals(d => [...d, {
      id: newId, customerId: 0, customer: form.customer, project: form.project,
      value: form.value, stageId: form.stageId, assigned: form.assigned,
      dealer: form.dealer, dealerColor: DEALER_COLORS[form.dealer] ?? PRIMARY,
      tasks: [], files: [], outcome: form.outcome, createdAt: new Date().toISOString().slice(0, 10),
    }]);
  }
  function editDeal(id: number, form: DealForm) {
    setDeals(d => d.map(x => x.id === id ? {
      ...x, customer: form.customer, project: form.project, value: form.value,
      stageId: form.stageId, assigned: form.assigned, dealer: form.dealer,
      dealerColor: DEALER_COLORS[form.dealer] ?? PRIMARY, outcome: form.outcome,
    } : x));
  }
  function deleteDeal(id: number) { setDeals(d => d.filter(x => x.id !== id)); setDelId(null); }
  function closeDeal(id: number, outcome: "won" | "lost") {
    setDeals(d => d.map(x => x.id === id ? { ...x, outcome, stageId: pipelineStages[pipelineStages.length - 1].id } : x));
  }
  function reopenDeal(id: number) {
    setDeals(d => d.map(x => x.id === id ? { ...x, outcome: "active" } : x));
  }
  function moveDeal(id: number, dir: -1 | 1) {
    const stages = pipelineStages;
    setDeals(d => d.map(x => {
      if (x.id !== id) return x;
      const idx = stages.findIndex(s => s.id === x.stageId);
      const next = stages[idx + dir];
      return next ? { ...x, stageId: next.id } : x;
    }));
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return deals.filter(d => {
      const matchQ = !q || d.customer.toLowerCase().includes(q) || d.project.toLowerCase().includes(q) || d.dealer.toLowerCase().includes(q);
      const matchD = filterDealer === "ALL" || d.dealer === filterDealer;
      return matchQ && matchD;
    });
  }, [deals, query, filterDealer]);

  const activeDeals = filtered.filter(d => d.outcome === "active");
  const wonDeals    = filtered.filter(d => d.outcome === "won");
  const totalValue  = activeDeals.reduce((s, d) => s + d.value, 0);
  const wonValue    = wonDeals.reduce((s, d) => s + d.value, 0);
  const winRate     = filtered.length > 0 ? Math.round((wonDeals.length / filtered.length) * 100) : 0;

  const dealerStats = DEALERS.map(name => ({
    name, count: filtered.filter(d => d.dealer === name).length, color: DEALER_COLORS[name],
  })).filter(d => d.count > 0);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 22, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: PRIMARY, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Workflow size={17} color="#fff" />
            </div>
            <h1 style={{ fontSize: "1.45rem", fontWeight: 800, color: STEEL, margin: 0 }}>Pipeline รวมทุกสาขา</h1>
          </div>
          <div style={{ fontSize: "0.72rem", color: MUTED, marginLeft: 44 }}>HQ · จัดการ Pipeline ทุก Dealer</div>
        </div>
        <button onClick={() => setModal("add")}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 10, border: "none", background: PRIMARY, color: "#fff", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,51,102,.25)" }}>
          <Plus size={14} /> เพิ่มดีล
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "ดีลทั้งหมด",   value: filtered.length,  sub: "รายการ",   color: STEEL   },
          { label: "มูลค่า Active", value: fmtM(totalValue), sub: "บาท",     color: PRIMARY  },
          { label: "Win Rate",      value: `${winRate}%`,    sub: "อัตราปิด", color: "#22c55e" },
          { label: "ยอดปิดการขาย", value: fmtM(wonValue),   sub: "Won",      color: "#003366" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, border: `1px solid ${BORDER}`, padding: "16px 18px" }}>
            <div style={{ fontSize: "0.67rem", color: MUTED, fontWeight: 600, marginBottom: 7 }}>{s.label}</div>
            <div style={{ fontSize: "1.8rem", fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: "0.63rem", color: MUTED, marginTop: 5 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Dealer chips */}
      {dealerStats.length > 1 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          {dealerStats.map(d => (
            <div key={d.name} onClick={() => setFilterDealer(f => f === d.name ? "ALL" : d.name)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 12px", borderRadius: 99, border: `1px solid ${filterDealer === d.name ? d.color : BORDER}`, background: filterDealer === d.name ? d.color + "14" : "#fff", cursor: "pointer" }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: d.color }} />
              <span style={{ fontSize: "0.7rem", fontWeight: 600, color: filterDealer === d.name ? d.color : STEEL }}>{d.name}</span>
              <span style={{ fontSize: "0.65rem", color: MUTED }}>{d.count}</span>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar */}
      <div style={{ background: "#fff", borderRadius: "12px 12px 0 0", border: `1px solid ${BORDER}`, borderBottom: "none", padding: "11px 16px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "7px 12px", flex: 1, minWidth: 200 }}>
          <Search size={13} color={MUTED} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="ค้นหาลูกค้า / โครงการ / สาขา..."
            style={{ border: "none", outline: "none", fontSize: "0.78rem", color: STEEL, background: "transparent", flex: 1 }} />
          {query && <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED, display: "flex", padding: 0 }}><X size={11} /></button>}
        </div>
        <select value={filterDealer} onChange={e => setFilterDealer(e.target.value)}
          style={{ padding: "7px 12px", borderRadius: 10, border: `1px solid ${BORDER}`, background: "#fff", fontSize: "0.78rem", color: "#374151", outline: "none" }}>
          <option value="ALL">ทุกสาขา</option>
          {DEALERS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <span style={{ fontSize: "0.7rem", color: MUTED, marginLeft: "auto" }}>{filtered.length} ดีล</span>
      </div>

      {/* Kanban */}
      <div style={{ background: "#fff", border: `1px solid ${BORDER}`, borderTop: "none", borderRadius: "0 0 14px 14px", padding: "16px", overflowX: "auto" }}>
        <div style={{ display: "flex", gap: 12, minWidth: 950 }}>
          {pipelineStages.map((stage, stageIdx) => {
            const stageDeals = filtered.filter(d => d.outcome === "active" && d.stageId === stage.id);
            const stageVal   = stageDeals.reduce((s, d) => s + d.value, 0);
            const isLast     = stageIdx === pipelineStages.length - 1;
            return (
              <div key={stage.id} style={{ flex: 1, minWidth: 160 }}>
                <div style={{ borderTop: `3px solid ${stage.color}`, borderRadius: "8px 8px 0 0", background: "#f8f9fb", padding: "9px 12px", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: stage.color }}>{stage.name}</span>
                    <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "#fff", background: stage.color, borderRadius: 99, padding: "2px 7px" }}>{stageDeals.length}</span>
                  </div>
                  {stageVal > 0 && <div style={{ fontSize: "0.63rem", color: MUTED }}>{fmtM(stageVal)}</div>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {stageDeals.map(deal => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      stageColor={stage.color}
                      isLast={isLast}
                      expanded={expanded.has(deal.id)}
                      onToggle={() => toggleExpand(deal.id)}
                      onEdit={() => setModal(deal)}
                      onDelete={() => setDelId(deal.id)}
                      onWon={() => closeDeal(deal.id, "won")}
                      onLost={() => closeDeal(deal.id, "lost")}
                      onReopen={() => reopenDeal(deal.id)}
                      onMoveStage={dir => moveDeal(deal.id, dir)}
                    />
                  ))}
                  {stageDeals.length === 0 && (
                    <div style={{ padding: "18px 0", textAlign: "center", fontSize: "0.7rem", color: "#d1d5db" }}>ไม่มีดีล</div>
                  )}
                  <button onClick={() => setModal("add")}
                    style={{ background: "none", border: `1px dashed ${BORDER}`, borderRadius: 8, padding: "6px 0", color: MUTED, fontSize: "0.65rem", cursor: "pointer", width: "100%", marginTop: 4 }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = PRIMARY; (e.currentTarget as HTMLElement).style.color = PRIMARY; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = BORDER; (e.currentTarget as HTMLElement).style.color = MUTED; }}>
                    + เพิ่มดีล
                  </button>
                </div>
              </div>
            );
          })}

          {/* Won column */}
          <div style={{ minWidth: 155, flex: 1 }}>
            <div style={{ borderTop: "3px solid #22c55e", borderRadius: "8px 8px 0 0", background: "#f8f9fb", padding: "9px 12px", marginBottom: 10 }}>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "#22c55e" }}>ปิดแล้ว (Won)</span>
              <div style={{ fontSize: "0.63rem", color: MUTED }}>{fmtM(wonValue)}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.filter(d => d.outcome === "won").map(deal => (
                <DealCard
                  key={deal.id}
                  deal={deal}
                  stageColor="#22c55e"
                  isLast={false}
                  expanded={expanded.has(deal.id)}
                  onToggle={() => toggleExpand(deal.id)}
                  onEdit={() => setModal(deal)}
                  onDelete={() => setDelId(deal.id)}
                  onWon={() => {}}
                  onLost={() => {}}
                  onReopen={() => reopenDeal(deal.id)}
                  onMoveStage={() => {}}
                />
              ))}
              {filtered.filter(d => d.outcome === "won").length === 0 && (
                <div style={{ padding: "18px 0", textAlign: "center", fontSize: "0.7rem", color: "#d1d5db" }}>ไม่มี</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: "0.63rem", color: MUTED, fontWeight: 600 }}>สีซ้าย = สาขา:</span>
        {DEALERS.map(d => (
          <div key={d} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: DEALER_COLORS[d] }} />
            <span style={{ fontSize: "0.63rem", color: MUTED }}>{d}</span>
          </div>
        ))}
      </div>

      {/* Modals */}
      {modal !== null && (
        <DealModal
          title={modal === "add" ? "เพิ่มดีลใหม่" : "แก้ไขดีล"}
          initial={modal === "add" ? blankDealForm() : {
            customer: modal.customer, project: modal.project, value: modal.value,
            stageId: modal.stageId, assigned: modal.assigned,
            dealer: modal.dealer, outcome: modal.outcome,
          }}
          onSave={form => { if (modal === "add") addDeal(form); else editDeal(modal.id, form); }}
          onClose={() => setModal(null)}
        />
      )}
      {delId !== null && (
        <>
          <div onClick={() => setDelId(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.35)", zIndex: 200 }} />
          <div style={{ position: "fixed", inset: 0, zIndex: 210, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 14, border: `1px solid ${BORDER}`, boxShadow: "0 20px 60px rgba(0,0,0,.15)", width: 300, pointerEvents: "auto", overflow: "hidden" }}>
              <div style={{ padding: "16px 20px 14px", borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: "0.88rem", fontWeight: 700, color: STEEL }}>ยืนยันการลบดีล</div>
                <div style={{ fontSize: "0.74rem", color: MUTED, marginTop: 4 }}>
                  {deals.find(d => d.id === delId)?.customer} · {deals.find(d => d.id === delId)?.project}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, padding: "14px 20px" }}>
                <button onClick={() => setDelId(null)} style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: `1px solid ${BORDER}`, background: "#fff", color: STEEL, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>ยกเลิก</button>
                <button onClick={() => deleteDeal(delId!)} style={{ flex: 1, padding: "9px 0", borderRadius: 9, border: "none", background: "#f04d6a", color: "#fff", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>ลบดีล</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
