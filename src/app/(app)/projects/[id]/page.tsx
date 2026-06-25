"use client";

import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  projects, customers, quotations, invoices as allInvoices,
  projectStatusLabel, projectStatusColor,
  quotationStatusLabel, quotationStatusColor,
  invoiceStatusLabel, invoiceStatusColor,
} from "@/lib/mock";
import { Plus, X, CheckCircle2, Clock, Circle, Receipt, ChevronDown, ExternalLink } from "lucide-react";

// ── Tokens ─────────────────────────────────────────────────────
const PRIMARY = "#003366";
const STEEL   = "#2D2D2D";
const BORDER  = "#cfd4dc";
const MUTED   = "#6b7280";
const CARD: React.CSSProperties = {
  background: "#fff", borderRadius: 16, border: `1px solid ${BORDER}`,
  boxShadow: "0 2px 14px rgba(0,51,102,.07)",
};
const AVATAR_COLORS = [PRIMARY, "#22c55e", "#f59e0b", "#f04d6a", "#3b82f6", "#8fa3b8"];

// ── Milestone types ────────────────────────────────────────────
type MilestoneStatus = "upcoming" | "in_progress" | "done";
type Milestone = {
  id: number;
  name: string;
  due: string;
  status: MilestoneStatus;
  installment: number;
  percent: number;
  invoiceCreated: boolean;
};

const MS_COLOR: Record<MilestoneStatus, { label: string; color: string; bg: string }> = {
  upcoming:    { label: "รอดำเนินการ",    color: "#6b7280", bg: "#f0f0f5" },
  in_progress: { label: "กำลังดำเนินการ", color: PRIMARY,   bg: "#dce5f0" },
  done:        { label: "เสร็จแล้ว",      color: "#22c55e", bg: "#e5faf0" },
};

const INIT_MILESTONES: Milestone[] = [
  { id: 1, name: "เซ็นสัญญา / มัดจำ",   due: "2026-05-01", status: "done",        installment: 1, percent: 30, invoiceCreated: true  },
  { id: 2, name: "ออกแบบแล้วเสร็จ",      due: "2026-06-15", status: "done",        installment: 2, percent: 20, invoiceCreated: false },
  { id: 3, name: "ส่งมอบงวดกลาง",        due: "2026-08-30", status: "in_progress", installment: 3, percent: 30, invoiceCreated: false },
  { id: 4, name: "ส่งมอบสมบูรณ์ / ปิดงาน", due: "2026-10-31", status: "upcoming",  installment: 4, percent: 20, invoiceCreated: false },
];

// ── Helpers ────────────────────────────────────────────────────
function fmtDate(d: string | null) {
  if (!d || d === "—") return "—";
  const [y, m, day] = d.split("-");
  const mo = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return `${parseInt(day)} ${mo[parseInt(m) - 1]} ${parseInt(y) + 543}`;
}

function Avatar({ name, i }: { name: string; i: number }) {
  return (
    <span title={name} style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 26, height: 26, borderRadius: "50%",
      background: AVATAR_COLORS[i % AVATAR_COLORS.length],
      color: "#fff", fontSize: "0.6rem", fontWeight: 700,
      border: "2px solid #fff", marginLeft: i === 0 ? 0 : -8, flexShrink: 0,
    }}>
      {name.substring(0, 1)}
    </span>
  );
}

// ── Milestone Status Icon ──────────────────────────────────────
function MsIcon({ status }: { status: MilestoneStatus }) {
  if (status === "done")        return <CheckCircle2 size={16} color="#22c55e" />;
  if (status === "in_progress") return <Clock size={16} color={PRIMARY} />;
  return <Circle size={16} color="#9ca3af" />;
}

type Tab = "overview" | "milestones" | "documents" | "notes";
type Note = { id: number; text: string; date: string };

// ── Main Page ──────────────────────────────────────────────────
export default function ProjectDetailPage() {
  const params    = useParams();
  const projectId = Number(params.id);
  const project   = projects.find(p => p.id === projectId);

  const [tab,          setTab]          = useState<Tab>("overview");
  const [milestones,   setMilestones]   = useState<Milestone[]>(INIT_MILESTONES);
  const [notes,        setNotes]        = useState<Note[]>([]);
  const [noteText,     setNoteText]     = useState("");
  const [showAddMS,    setShowAddMS]    = useState(false);
  const [msName,       setMsName]       = useState("");
  const [msDue,        setMsDue]        = useState("");
  const [msPercent,    setMsPercent]    = useState("");
  const [invoiceFlash, setInvoiceFlash] = useState<number | null>(null);
  const [openStatus,   setOpenStatus]   = useState<number | null>(null);

  const progress = useMemo(() =>
    milestones.length === 0 ? 0 :
    Math.round(milestones.filter(m => m.status === "done").length / milestones.length * 100)
  , [milestones]);

  if (!project) {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <p style={{ color: MUTED }}>ไม่พบข้อมูลโครงการ</p>
        <Link href="/projects" style={{ color: PRIMARY, fontSize: "0.85rem" }}>← กลับ</Link>
      </div>
    );
  }

  const pc         = projectStatusColor[project.status];
  const customer   = customers.find(c => c.id === project.customerId);
  const relQ       = project.quotationId ? quotations.find(q => q.id === project.quotationId) : null;
  const projectInvoices = allInvoices.filter(inv => inv.projectId === projectId);

  function setMilestoneStatus(id: number, status: MilestoneStatus) {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    setOpenStatus(null);
  }
  function createInvoice(id: number) {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, invoiceCreated: true } : m));
    setInvoiceFlash(id);
    setTimeout(() => setInvoiceFlash(null), 2800);
  }
  function addMilestone() {
    if (!msName.trim()) return;
    const nextInstallment = Math.max(...milestones.map(m => m.installment), 0) + 1;
    setMilestones(prev => [...prev, {
      id: Date.now(), name: msName.trim(), due: msDue,
      status: "upcoming", installment: nextInstallment,
      percent: parseFloat(msPercent) || 0, invoiceCreated: false,
    }]);
    setMsName(""); setMsDue(""); setMsPercent("");
    setShowAddMS(false);
  }
  function addNote() {
    if (!noteText.trim()) return;
    setNotes(prev => [{ id: Date.now(), text: noteText.trim(), date: "24 มิ.ย. 2569" }, ...prev]);
    setNoteText("");
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: "overview",   label: "ภาพรวม" },
    { key: "milestones", label: `Milestone (${milestones.length})` },
    { key: "documents",  label: "เอกสาร" },
    { key: "notes",      label: `บันทึก${notes.length ? ` (${notes.length})` : ""}` },
  ];

  const INP: React.CSSProperties = {
    width: "100%", border: `1px solid ${BORDER}`, borderRadius: 9,
    padding: "8px 12px", fontSize: "0.82rem", outline: "none",
    color: STEEL, boxSizing: "border-box",
  };
  const LBL: React.CSSProperties = {
    fontSize: "0.67rem", fontWeight: 700, color: MUTED,
    display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em",
  };

  return (
    <div style={{ maxWidth: 1060 }}>

      {/* Back link */}
      <div style={{ marginBottom: 14 }}>
        <Link href="/projects" style={{ fontSize: "0.82rem", color: PRIMARY, fontWeight: 600, textDecoration: "none" }}>
          ← กลับสู่โครงการทั้งหมด
        </Link>
      </div>

      {/* ── Project header card ─────────────────────────────── */}
      <div style={{ ...CARD, padding: "22px 26px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontSize: "1.25rem", fontWeight: 800, color: STEEL, margin: 0 }}>{project.title}</h1>
              <span style={{ padding: "4px 12px", borderRadius: 99, fontSize: "0.7rem", fontWeight: 700, background: pc.bg, color: pc.text }}>
                {projectStatusLabel[project.status]}
              </span>
            </div>
            <div style={{ fontSize: "0.82rem", color: MUTED }}>{project.client}</div>
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 800, color: PRIMARY }}>{project.value}</div>
        </div>

        {/* Info grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10, marginTop: 16, paddingTop: 16, borderTop: "1px solid #eef0f4" }}>
          {[
            { label: "ลูกค้า", value: customer
              ? <Link href={`/customers/${customer.id}`} style={{ fontSize: "0.82rem", fontWeight: 700, color: PRIMARY, textDecoration: "none" }}>{project.client}</Link>
              : <span style={{ fontSize: "0.82rem", fontWeight: 700, color: STEEL }}>{project.client}</span>
            },
            { label: "วันเริ่ม",  value: <span style={{ fontSize: "0.82rem", fontWeight: 700, color: STEEL }}>{fmtDate(project.start)}</span> },
            { label: "กำหนดส่ง", value: <span style={{ fontSize: "0.82rem", fontWeight: 700, color: STEEL }}>{fmtDate(project.due)}</span> },
            { label: "ทีม", value: project.assigned.length === 0
              ? <span style={{ fontSize: "0.78rem", color: "#C0C0C0" }}>—</span>
              : <div style={{ display: "flex" }}>{project.assigned.map((a, i) => <Avatar key={a} name={a} i={i} />)}</div>
            },
          ].map((item, i) => (
            <div key={i} style={{ background: "#f8f9fb", borderRadius: 10, padding: "10px 14px", border: "1px solid #f0f0f5" }}>
              <div style={{ fontSize: "0.63rem", color: MUTED, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{item.label}</div>
              <div>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Milestone progress bar */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
            <span style={{ fontSize: "0.76rem", fontWeight: 600, color: STEEL }}>ความคืบหน้า (Milestone)</span>
            <span style={{ fontSize: "0.92rem", fontWeight: 800, color: progress === 100 ? "#22c55e" : PRIMARY }}>{progress}%</span>
          </div>
          <div style={{ height: 9, background: "#f0f0f5", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress}%`, background: progress === 100 ? "#22c55e" : PRIMARY, borderRadius: 99, transition: "width .3s" }} />
          </div>
          <div style={{ fontSize: "0.65rem", color: "#9ca3af", marginTop: 4 }}>
            {milestones.filter(m => m.status === "done").length}/{milestones.length} milestone เสร็จแล้ว
          </div>
        </div>
      </div>

      {/* ── Tabs card ─────────────────────────────────────────── */}
      <div style={{ ...CARD, overflow: "hidden" }}>
        {/* Tab strip */}
        <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, background: "#fff" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ padding: "12px 20px", border: "none", background: "none", cursor: "pointer", fontSize: "0.8rem", fontWeight: tab === t.key ? 700 : 500, color: tab === t.key ? PRIMARY : MUTED, borderBottom: tab === t.key ? `2px solid ${PRIMARY}` : "2px solid transparent", marginBottom: -1, whiteSpace: "nowrap" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab: ภาพรวม ────────────────────────────────────── */}
        {tab === "overview" && (
          <div style={{ padding: "24px 26px" }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 800, color: STEEL, marginBottom: 18 }}>ไมล์สโตน — ภาพรวม</div>

            {/* Horizontal milestone timeline */}
            <div style={{ display: "flex", alignItems: "flex-start", overflowX: "auto", paddingBottom: 8 }}>
              {milestones.map((m, i) => {
                const c = MS_COLOR[m.status];
                return (
                  <div key={m.id} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 120, padding: "0 4px" }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: m.status === "done" ? "#22c55e" : m.status === "in_progress" ? "#dce5f0" : "#f0f0f5", border: `2px solid ${m.status === "done" ? "#22c55e" : m.status === "in_progress" ? PRIMARY : BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <MsIcon status={m.status} />
                      </div>
                      <span style={{ fontSize: "0.7rem", color: c.color, fontWeight: m.status === "done" ? 700 : 400, textAlign: "center", lineHeight: 1.3 }}>
                        {m.name}
                      </span>
                      <span style={{ fontSize: "0.6rem", color: "#9ca3af" }}>{m.percent}%</span>
                      <span style={{ display: "inline-block", padding: "2px 7px", borderRadius: 99, fontSize: "0.58rem", fontWeight: 700, background: c.bg, color: c.color }}>
                        {c.label}
                      </span>
                    </div>
                    {i < milestones.length - 1 && (
                      <div style={{ flex: 1, height: 2, background: m.status === "done" ? "#22c55e" : BORDER, minWidth: 32, margin: "0 4px", marginBottom: 48 }} />
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid #f0f4f8` }}>
              <button onClick={() => setTab("milestones")}
                style={{ fontSize: "0.78rem", color: PRIMARY, fontWeight: 600, background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                จัดการ Milestone ทั้งหมด →
              </button>
            </div>
          </div>
        )}

        {/* ── Tab: Milestones ─────────────────────────────────── */}
        {tab === "milestones" && (
          <div style={{ padding: "20px 24px" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: "0.82rem", fontWeight: 800, color: STEEL }}>Milestone ทั้งหมด</div>
                <div style={{ fontSize: "0.7rem", color: MUTED, marginTop: 2 }}>แต่ละ milestone เชื่อมกับการออก Invoice ตามงวด</div>
              </div>
              <button onClick={() => setShowAddMS(true)}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 9, border: "none", background: PRIMARY, color: "#fff", fontSize: "0.76rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(0,51,102,.2)" }}>
                <Plus size={13} /> เพิ่ม Milestone
              </button>
            </div>

            {/* Milestone list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {milestones.map(m => {
                const c = MS_COLOR[m.status];
                const isFlash = invoiceFlash === m.id;
                const linkedInv = projectInvoices.find(inv => inv.installmentNo === m.installment);
                const invColor = linkedInv ? invoiceStatusColor[linkedInv.status] : null;
                return (
                  <div key={m.id} style={{ background: isFlash ? "#e5faf0" : "#f8f9fb", borderRadius: 12, padding: "14px 18px", border: `1px solid ${isFlash ? "#22c55e" : m.status === "in_progress" ? "#bcd0e8" : BORDER}`, transition: "background .3s, border-color .3s" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>

                      {/* Icon + Name */}
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 180 }}>
                        <MsIcon status={m.status} />
                        <div>
                          <div style={{ fontSize: "0.85rem", fontWeight: 700, color: STEEL }}>{m.name}</div>
                          <div style={{ fontSize: "0.67rem", color: MUTED, marginTop: 2 }}>
                            กำหนดส่ง: {fmtDate(m.due)} · งวดที่ {m.installment} ({m.percent}%)
                          </div>
                        </div>
                      </div>

                      {/* Status badge + dropdown */}
                      <div style={{ position: "relative" }}>
                        <button onClick={() => setOpenStatus(openStatus === m.id ? null : m.id)}
                          style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 99, fontSize: "0.7rem", fontWeight: 700, background: c.bg, color: c.color, border: "none", cursor: "pointer" }}>
                          {c.label} <ChevronDown size={11} />
                        </button>
                        {openStatus === m.id && (
                          <>
                            <div onClick={() => setOpenStatus(null)} style={{ position: "fixed", inset: 0, zIndex: 9 }} />
                            <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 10, background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 10, boxShadow: "0 8px 24px rgba(0,51,102,.12)", minWidth: 160, overflow: "hidden" }}>
                              {(["upcoming", "in_progress", "done"] as MilestoneStatus[]).map(s => (
                                <button key={s} onClick={() => setMilestoneStatus(m.id, s)}
                                  style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "9px 14px", border: "none", background: s === m.status ? "#f0f4f8" : "transparent", cursor: "pointer", textAlign: "left" }}>
                                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: MS_COLOR[s].color, flexShrink: 0 }} />
                                  <span style={{ fontSize: "0.78rem", color: s === m.status ? PRIMARY : STEEL, fontWeight: s === m.status ? 700 : 400 }}>{MS_COLOR[s].label}</span>
                                  {s === m.status && <span style={{ marginLeft: "auto", fontSize: "0.65rem", color: PRIMARY }}>✓</span>}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Invoice status */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {linkedInv ? (
                          <Link href="/invoices"
                            style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 9, textDecoration: "none", border: `1px solid ${invColor!.text}22`, background: invColor!.bg }}>
                            <Receipt size={12} color={invColor!.text} />
                            <span style={{ fontSize: "0.7rem", fontWeight: 700, color: invColor!.text }}>{linkedInv.id}</span>
                            <span style={{ fontSize: "0.65rem", color: invColor!.text, opacity: 0.8 }}>· {invoiceStatusLabel[linkedInv.status]}</span>
                            <ExternalLink size={10} color={invColor!.text} />
                          </Link>
                        ) : m.status === "done" && !m.invoiceCreated ? (
                          <button onClick={() => createInvoice(m.id)}
                            style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 14px", borderRadius: 9, border: "none", background: "#003366", color: "#fff", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 3px 8px rgba(0,51,102,.25)" }}>
                            <Receipt size={12} /> ออก Invoice งวด {m.installment}
                          </button>
                        ) : m.invoiceCreated ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "0.7rem", fontWeight: 700, color: "#22c55e" }}>
                            <CheckCircle2 size={12} /> Invoice ออกแล้ว
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Invoice flash message */}
            {invoiceFlash !== null && (
              <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 10, background: "#e5faf0", border: "1px solid #22c55e", fontSize: "0.78rem", fontWeight: 600, color: "#15803d", display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={15} color="#22c55e" />
                ออก Invoice สำเร็จ — ไปที่หน้า ใบแจ้งหนี้ เพื่อดูรายละเอียด
              </div>
            )}

            {/* Summary */}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid #f0f4f8`, display: "flex", gap: 20 }}>
              {[
                { label: "เสร็จแล้ว",      count: milestones.filter(m => m.status === "done").length,        color: "#22c55e" },
                { label: "กำลังดำเนินการ", count: milestones.filter(m => m.status === "in_progress").length, color: PRIMARY   },
                { label: "รอดำเนินการ",    count: milestones.filter(m => m.status === "upcoming").length,    color: "#9ca3af" },
                { label: "Invoice แล้ว",   count: milestones.filter(m => m.invoiceCreated).length,           color: "#0f766e" },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.4rem", fontWeight: 800, color: s.color }}>{s.count}</div>
                  <div style={{ fontSize: "0.62rem", color: MUTED, fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab: เอกสาร ─────────────────────────────────────── */}
        {tab === "documents" && (
          <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 10 }}>
            {relQ && (() => {
              const qc = quotationStatusColor[relQ.status];
              return (
                <div style={{ background: "#f8f9fb", borderRadius: 10, padding: "12px 16px", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: "1.1rem" }}>📄</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, color: STEEL }}>{relQ.id}</div>
                    <div style={{ fontSize: "0.7rem", color: MUTED }}>ใบเสนอราคา · {relQ.total}</div>
                  </div>
                  <span style={{ background: qc.bg, color: qc.text, borderRadius: 99, padding: "3px 10px", fontSize: "0.65rem", fontWeight: 700 }}>{quotationStatusLabel[relQ.status]}</span>
                  <Link href="/quotations" style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", color: PRIMARY, fontSize: "0.72rem", fontWeight: 600, textDecoration: "none" }}>ดู</Link>
                </div>
              );
            })()}
            {[
              { id: `CONTRACT-${projectId}`, label: "สัญญาโครงการ",     type: "สัญญา",      status: "ลงนามแล้ว", icon: "📋", color: "#22c55e", bg: "#e5faf0" },
              { id: `INV-${projectId}-001`,  label: "ใบแจ้งหนี้ งวดที่ 1", type: "ใบแจ้งหนี้", status: "ชำระแล้ว",  icon: "🧾", color: "#22c55e", bg: "#e5faf0" },
            ].map(doc => (
              <div key={doc.id} style={{ background: "#f8f9fb", borderRadius: 10, padding: "12px 16px", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: "1.1rem" }}>{doc.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: STEEL }}>{doc.id}</div>
                  <div style={{ fontSize: "0.7rem", color: MUTED }}>{doc.type} · {doc.label}</div>
                </div>
                <span style={{ background: doc.bg, color: doc.color, borderRadius: 99, padding: "3px 10px", fontSize: "0.65rem", fontWeight: 700 }}>{doc.status}</span>
                <button style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", color: PRIMARY, fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}>ดู</button>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab: บันทึก ──────────────────────────────────────── */}
        {tab === "notes" && (
          <div style={{ padding: "20px 22px" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input value={noteText} onChange={e => setNoteText(e.target.value)} onKeyDown={e => e.key === "Enter" && addNote()}
                placeholder="เพิ่มบันทึก..." style={{ flex: 1, fontSize: "0.82rem", border: `1px solid ${BORDER}`, borderRadius: 9, padding: "9px 14px", outline: "none", color: STEEL }} />
              <button onClick={addNote} style={{ padding: "9px 20px", borderRadius: 9, border: "none", background: PRIMARY, color: "#fff", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>บันทึก</button>
            </div>
            {notes.length === 0
              ? <div style={{ textAlign: "center", color: "#9ca3af", fontSize: "0.78rem", padding: "28px 0" }}>ยังไม่มีบันทึก</div>
              : <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {notes.map(n => (
                    <div key={n.id} style={{ background: "#f8f9fb", borderRadius: 10, padding: "12px 16px", border: `1px solid ${BORDER}` }}>
                      <div style={{ fontSize: "0.82rem", color: STEEL, marginBottom: 4 }}>{n.text}</div>
                      <div style={{ fontSize: "0.67rem", color: "#9ca3af" }}>{n.date}</div>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}
      </div>

      {/* ── Add Milestone Modal ──────────────────────────────────── */}
      {showAddMS && (
        <>
          <div onClick={() => setShowAddMS(false)} style={{ position: "fixed", inset: 0, background: "rgba(45,45,45,.4)", zIndex: 200 }} />
          <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", zIndex: 210, ...CARD, width: "100%", maxWidth: 420, boxShadow: "0 24px 80px rgba(0,51,102,.2)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", borderBottom: `1px solid ${BORDER}`, background: PRIMARY }}>
              <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "#fff" }}>เพิ่ม Milestone ใหม่</div>
              <button onClick={() => setShowAddMS(false)} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.1)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={13} />
              </button>
            </div>
            <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={LBL}>ชื่อ Milestone *</label>
                <input value={msName} onChange={e => setMsName(e.target.value)} placeholder="เช่น ส่งมอบงวด 3" style={INP} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={LBL}>กำหนดส่ง</label>
                  <input type="date" value={msDue} onChange={e => setMsDue(e.target.value)} style={INP} />
                </div>
                <div>
                  <label style={LBL}>% ของมูลค่าโครงการ</label>
                  <input type="number" value={msPercent} onChange={e => setMsPercent(e.target.value)} placeholder="20" min="0" max="100" style={INP} />
                </div>
              </div>
            </div>
            <div style={{ padding: "13px 22px", borderTop: `1px solid ${BORDER}`, display: "flex", gap: 8, justifyContent: "flex-end", background: "#fafafa" }}>
              <button onClick={() => setShowAddMS(false)} style={{ padding: "8px 18px", borderRadius: 9, border: `1px solid ${BORDER}`, background: "#fff", color: STEEL, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>ยกเลิก</button>
              <button onClick={addMilestone} style={{ padding: "8px 22px", borderRadius: 9, border: "none", background: PRIMARY, color: "#fff", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,51,102,.3)" }}>บันทึก</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
