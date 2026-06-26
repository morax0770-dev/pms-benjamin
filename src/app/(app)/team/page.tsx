"use client";

import React, { useState, useMemo } from "react";
import {
  team as MOCK_TEAM, projects, leads,
  teamRoleLabel, type TeamMock,
} from "@/lib/mock";
import { Plus, Phone, Mail, X, Edit2, Trash2, Briefcase, FileText, Users, UserCheck } from "lucide-react";

const PRIMARY = "#003366";
const BORDER  = "#cfd4dc";
const MUTED   = "#6b7280";
const CARD: React.CSSProperties = {
  background: "#fff", borderRadius: 16,
  border: `1px solid ${BORDER}`, boxShadow: "0 2px 14px rgba(0,51,102,.07)",
};
const LBL: React.CSSProperties = { fontSize: "0.72rem", fontWeight: 700, color: MUTED, marginBottom: 4, display: "block" };
const INP: React.CSSProperties = {
  width: "100%", padding: "8px 12px", borderRadius: 8,
  border: `1px solid ${BORDER}`, fontSize: "0.84rem", outline: "none", boxSizing: "border-box",
};

const ROLE_COLOR: Record<string, { bg: string; text: string }> = {
  ผู้จัดการสาขา: { bg: "#dce5f0", text: PRIMARY },
  เซลส์:         { bg: "#e5faf0", text: "#15803d" },
};
const DEPT_OPTIONS = ["บริหาร", "ขาย", "สนับสนุน"];
const ROLE_OPTIONS = ["ผู้จัดการสาขา", "เซลส์"];

type MForm = { name: string; role: string; dept: string; phone: string };
const blank = (): MForm => ({ name: "", role: "เซลส์", dept: "ขาย", phone: "" });

function avatarColor(name: string) {
  const colors = ["#003366", "#22c55e", "#f59e0b", "#f04d6a", "#002244", "#8fa3b8", "#0d9488", "#3b82f6"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return colors[Math.abs(h) % colors.length];
}
function initials(name: string) {
  const parts = name.trim().split(" ");
  return parts.length >= 2 ? (parts[0][0] + parts[1][0]) : name.slice(0, 2);
}

// Get first name (for matching assigned[])
function firstName(name: string) { return name.split(" ")[0]; }

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMock[]>(MOCK_TEAM);
  const [selected, setSelected] = useState<TeamMock | null>(null);
  const [modal, setModal]       = useState<"add" | "edit" | null>(null);
  const [form, setForm]         = useState<MForm>(blank());
  const [editId, setEditId]     = useState<number | null>(null);

  function set(k: keyof MForm, v: string) { setForm(f => ({ ...f, [k]: v })); }

  function openAdd() { setForm(blank()); setEditId(null); setModal("add"); }
  function openEdit(m: TeamMock) {
    setForm({ name: m.name, role: m.role, dept: m.dept, phone: m.phone });
    setEditId(m.id); setModal("edit");
  }
  function save() {
    if (!form.name.trim()) return;
    if (modal === "add") {
      const newId = Math.max(0, ...members.map(m => m.id)) + 1;
      const color = avatarColor(form.name);
      const ini = initials(form.name);
      setMembers(l => [...l, { id: newId, name: form.name, role: form.role, dept: form.dept, initials: ini, color, tasks: 0, projects: 0, phone: form.phone }]);
    } else if (modal === "edit" && editId !== null) {
      setMembers(l => l.map(m => m.id === editId ? { ...m, name: form.name, role: form.role, dept: form.dept, phone: form.phone } : m));
      if (selected?.id === editId) setSelected(prev => prev ? { ...prev, name: form.name, role: form.role, dept: form.dept, phone: form.phone } : prev);
    }
    setModal(null);
  }
  function remove(id: number) {
    setMembers(l => l.filter(m => m.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  const stats = useMemo(() => ({
    total:   members.length,
    admin:   members.filter(m => m.role === "ผู้จัดการสาขา").length,
    sales:   members.filter(m => m.role === "เซลส์").length,
  }), [members]);

  const [deptFilter, setDeptFilter] = useState<string>("ALL");

  function memberStats(m: TeamMock) {
    const fn = firstName(m.name);
    return {
      projects: projects.filter(p => p.assigned.includes(fn)),
      leads:    leads.filter(l => l.assigned === fn),
    };
  }

  const filteredMembers = useMemo(() =>
    deptFilter === "ALL" ? members : members.filter(m => m.dept === deptFilter),
  [members, deptFilter]);

  const selStats = useMemo(() => selected ? memberStats(selected) : null, [selected, members]);

  return (
    <div style={{ display: "flex", gap: 16 }}>
      {/* Main */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#2D2D2D", marginBottom: 3 }}>ทีมงาน</h1>
            <p style={{ fontSize: "0.76rem", color: MUTED }}>สมาชิกทีมและผู้รับผิดชอบงาน</p>
          </div>
          <button onClick={openAdd}
            style={{ display: "flex", alignItems: "center", gap: 7, background: PRIMARY, color: "#fff", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: "0.84rem", fontWeight: 700, cursor: "pointer" }}>
            <Plus size={15} /> เพิ่มสมาชิก
          </button>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
          {[
            { label: "สมาชิกทั้งหมด", value: stats.total, color: PRIMARY,   icon: <Users size={16} color={PRIMARY} /> },
            { label: "ผู้จัดการสาขา", value: stats.admin, color: PRIMARY,   icon: <UserCheck size={16} color={PRIMARY} /> },
            { label: "เซลส์",         value: stats.sales, color: "#22c55e", icon: <Briefcase size={16} color="#22c55e" /> },
          ].map((s, i) => (
            <div key={i} style={{ ...CARD, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ background: `${s.color}14`, borderRadius: 10, padding: 8 }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#2D2D2D", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: "0.7rem", color: MUTED, fontWeight: 600, marginTop: 3 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Dept filter pills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {["ALL", ...DEPT_OPTIONS].map(d => (
            <button key={d} onClick={() => setDeptFilter(d)}
              style={{ padding: "5px 14px", borderRadius: 99, border: `1px solid ${deptFilter === d ? PRIMARY : BORDER}`, background: deptFilter === d ? "#dce5f0" : "#fff", color: deptFilter === d ? PRIMARY : MUTED, fontSize: "0.72rem", fontWeight: 600, cursor: "pointer" }}>
              {d === "ALL" ? `ทั้งหมด (${members.length})` : d}
            </button>
          ))}
        </div>

        {/* Member grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {filteredMembers.map(m => {
            const rc = ROLE_COLOR[m.role] ?? { bg: "#f0f0f5", text: MUTED };
            const fn = firstName(m.name);
            const myProjects = projects.filter(p => p.assigned.includes(fn));
            const myLeads    = leads.filter(l => l.assigned === fn);
            const isSel = selected?.id === m.id;
            return (
              <div key={m.id} onClick={() => setSelected(m)}
                style={{ ...CARD, padding: "18px 16px", cursor: "pointer", minHeight: 170, borderColor: isSel ? PRIMARY : BORDER, boxShadow: isSel ? `0 0 0 2px rgba(0,51,102,.2), 0 2px 14px rgba(0,51,102,.07)` : undefined, transition: "all .15s" }}
                onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(0,51,102,.1)"; }}
                onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 14px rgba(0,51,102,.07)"; }}>

                {/* Avatar + name */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 46, height: 46, borderRadius: "50%", background: avatarColor(m.name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                    {initials(m.name)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#2D2D2D", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.name}</div>
                    <div style={{ marginTop: 4 }}>
                      <span style={{ display: "inline-block", padding: "2px 9px", borderRadius: 99, fontSize: "0.65rem", fontWeight: 700, background: rc.bg, color: rc.text }}>
                        {teamRoleLabel[m.role] ?? m.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                  {[
                    { label: "โครงการ",  value: myProjects.length },
                    { label: "ลีดที่รับ", value: myLeads.length },
                  ].map((s, i) => (
                    <div key={i} style={{ background: "#f8f9fb", borderRadius: 9, padding: "8px 10px", textAlign: "center" }}>
                      <div style={{ fontSize: "1.1rem", fontWeight: 800, color: PRIMARY }}>{s.value}</div>
                      <div style={{ fontSize: "0.62rem", color: MUTED, fontWeight: 600, marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Phone + actions */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 10, borderTop: `1px solid #f0f4f8` }}>
                  {m.phone ? (
                    <a href={`tel:${m.phone}`} onClick={e => e.stopPropagation()}
                      style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: PRIMARY, textDecoration: "none", fontWeight: 600 }}>
                      <Phone size={12} />{m.phone}
                    </a>
                  ) : <span style={{ fontSize: "0.75rem", color: MUTED }}>—</span>}
                  <div style={{ display: "flex", gap: 5 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => openEdit(m)}
                      style={{ padding: "4px 10px", borderRadius: 7, background: "#f0f4fa", border: "none", cursor: "pointer", fontSize: "0.72rem", color: PRIMARY, fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                      <Edit2 size={11} /> แก้ไข
                    </button>
                    <button onClick={() => remove(m.id)}
                      style={{ padding: "4px 8px", borderRadius: 7, background: "#fdeaed", border: "none", cursor: "pointer", color: "#f04d6a" }}>
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Side panel */}
      {selected && (
        <>
          <div onClick={() => setSelected(null)} style={{position:"fixed",inset:0,background:"rgba(45,45,45,.38)",zIndex:300}} />
          <div style={{position:"fixed",right:0,top:0,height:"100vh",width:420,background:"#fff",overflowY:"auto",zIndex:301,boxShadow:"-6px 0 40px rgba(0,51,102,.16)"}}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "#2D2D2D" }}>ข้อมูลสมาชิก</span>
            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED }}><X size={16} /></button>
          </div>
          <div style={{ padding: "18px 16px" }}>
            {/* Avatar */}
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: avatarColor(selected.name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", fontWeight: 800, color: "#fff", margin: "0 auto 10px" }}>
                {initials(selected.name)}
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "#2D2D2D" }}>{selected.name}</div>
              <div style={{ marginTop: 6 }}>
                {(() => { const rc = ROLE_COLOR[selected.role] ?? { bg: "#f0f0f5", text: MUTED }; return (
                  <span style={{ display: "inline-block", padding: "3px 12px", borderRadius: 99, fontSize: "0.68rem", fontWeight: 700, background: rc.bg, color: rc.text }}>
                    {teamRoleLabel[selected.role] ?? selected.role}
                  </span>
                ); })()}
              </div>
              <div style={{ fontSize: "0.75rem", color: MUTED, marginTop: 6 }}>{selected.dept}</div>
            </div>

            {/* Contact */}
            {selected.phone && (
              <div style={{ background: "#f8f9fb", borderRadius: 10, padding: "10px 12px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <Phone size={14} color={PRIMARY} />
                <a href={`tel:${selected.phone}`} style={{ fontSize: "0.84rem", color: PRIMARY, fontWeight: 700, textDecoration: "none" }}>{selected.phone}</a>
              </div>
            )}

            {/* Project list */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: "0.68rem", fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>โครงการที่รับผิดชอบ</div>
              {selStats && selStats.projects.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {selStats.projects.map(p => (
                    <div key={p.id} style={{ background: "#f8f9fb", borderRadius: 9, padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
                      <Briefcase size={12} color={PRIMARY} style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: "0.78rem", color: "#2D2D2D", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: "0.76rem", color: MUTED, textAlign: "center", padding: "10px 0" }}>ยังไม่มีโครงการ</div>
              )}
            </div>

            {/* Lead list */}
            {selStats && selStats.leads.length > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>ลีดที่รับผิดชอบ</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {selStats.leads.map(l => (
                    <div key={l.id} style={{ background: "#f8f9fb", borderRadius: 9, padding: "8px 10px", display: "flex", alignItems: "center", gap: 8 }}>
                      <FileText size={12} color="#22c55e" style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: "0.78rem", color: "#2D2D2D", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.company}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => openEdit(selected)}
                style={{ width: "100%", padding: "9px 0", borderRadius: 9, background: PRIMARY, color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.84rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Edit2 size={13} /> แก้ไขข้อมูล
              </button>
              <button onClick={() => remove(selected.id)}
                style={{ width: "100%", padding: "9px 0", borderRadius: 9, background: "#fdeaed", color: "#f04d6a", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.84rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Trash2 size={13} /> ลบออกจากทีม
              </button>
            </div>
          </div>
        </div>
        </>
      )}

      {/* Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 18, width: 440, boxShadow: "0 20px 60px rgba(0,0,0,.25)", overflow: "hidden" }}>
            <div style={{ padding: "18px 22px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "1rem", fontWeight: 800, color: "#2D2D2D" }}>{modal === "add" ? "เพิ่มสมาชิก" : "แก้ไขสมาชิก"}</span>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED }}><X size={18} /></button>
            </div>
            <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={LBL}>ชื่อ-นามสกุล *</label>
                <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="ชื่อ นามสกุล" style={INP} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={LBL}>บทบาท</label>
                  <select value={form.role} onChange={e => set("role", e.target.value)} style={{ ...INP, cursor: "pointer" }}>
                    {ROLE_OPTIONS.map(r => <option key={r} value={r}>{teamRoleLabel[r] ?? r}</option>)}
                  </select>
                </div>
                <div>
                  <label style={LBL}>แผนก</label>
                  <select value={form.dept} onChange={e => set("dept", e.target.value)} style={{ ...INP, cursor: "pointer" }}>
                    {DEPT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={LBL}>เบอร์โทรศัพท์</label>
                <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="08X-XXX-XXXX" style={INP} />
              </div>
            </div>
            <div style={{ padding: "14px 22px", borderTop: `1px solid ${BORDER}`, display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setModal(null)} style={{ padding: "9px 20px", borderRadius: 9, border: `1px solid ${BORDER}`, background: "#fff", cursor: "pointer", fontSize: "0.84rem", color: "#2D2D2D", fontWeight: 600 }}>ยกเลิก</button>
              <button onClick={save} style={{ padding: "9px 20px", borderRadius: 9, background: PRIMARY, color: "#fff", border: "none", cursor: "pointer", fontSize: "0.84rem", fontWeight: 700 }}>
                {modal === "add" ? "เพิ่ม" : "บันทึก"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
