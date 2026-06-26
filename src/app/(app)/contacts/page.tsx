"use client";

import React, { useState, useMemo } from "react";
import { contacts as INIT_CONTACTS, customers, ContactMock } from "@/lib/mock";
import {
  Plus, Search, Phone, Mail, Star, X, Edit2, Trash2,
  Building2, UserCheck, Users,
} from "lucide-react";

const PRIMARY = "#003366";
const BORDER  = "#cfd4dc";
const MUTED   = "#6b7280";
const CARD: React.CSSProperties = {
  background: "#fff", borderRadius: 16,
  border: `1px solid ${BORDER}`, boxShadow: "0 2px 14px rgba(0,51,102,.07)",
};
const LBL: React.CSSProperties = { fontSize: "0.72rem", fontWeight: 700, color: MUTED, marginBottom: 4, display: "block" };
const INP: React.CSSProperties = {
  width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${BORDER}`,
  fontSize: "0.84rem", outline: "none", boxSizing: "border-box",
};

const ROLES = ["กรรมการผู้จัดการ","เจ้าของกิจการ","ผู้จัดการโครงการ","ผู้จัดการทั่วไป","ฝ่ายจัดซื้อ","วิศวกรโครงการ","ผู้ช่วยผู้จัดการ","ผู้จัดการฝ่ายก่อสร้าง","Managing Director","Procurement Manager","อื่นๆ"];

function avatarColor(name: string) {
  const colors = ["#003366","#22c55e","#f59e0b","#f04d6a","#002244","#8fa3b8","#0d9488","#3b82f6"];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return colors[Math.abs(h) % colors.length];
}
function initials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

type CForm = Omit<ContactMock, "id">;
const blankForm = (): CForm => ({
  customerId: 0, company: "", name: "", role: "", phone: "", email: "", lineId: "", isPrimary: false,
});

export default function ContactsPage() {
  const [list, setList]       = useState<ContactMock[]>(INIT_CONTACTS);
  const [search, setSearch]   = useState("");
  const [filterCo, setFilter] = useState<string>("");
  const [selected, setSelected] = useState<ContactMock | null>(null);
  const [modal, setModal]     = useState<"add" | "edit" | null>(null);
  const [form, setForm]       = useState<CForm>(blankForm());
  const [editId, setEditId]   = useState<number | null>(null);

  const companies = useMemo(() => Array.from(new Set(list.map(c => c.company))).sort(), [list]);

  const filtered = useMemo(() => {
    let r = list;
    if (search) {
      const q = search.toLowerCase();
      r = r.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    }
    if (filterCo) r = r.filter(c => c.company === filterCo);
    return r;
  }, [list, search, filterCo]);

  const stats = useMemo(() => ({
    total: list.length,
    companies: companies.length,
    primary: list.filter(c => c.isPrimary).length,
  }), [list, companies]);

  function set(k: keyof CForm, v: string | number | boolean) {
    setForm(f => ({ ...f, [k]: v }));
  }

  function openAdd() {
    setForm(blankForm());
    setEditId(null);
    setModal("add");
  }
  function openEdit(c: ContactMock) {
    setForm({ customerId: c.customerId, company: c.company, name: c.name, role: c.role, phone: c.phone, email: c.email, lineId: c.lineId ?? "", isPrimary: c.isPrimary });
    setEditId(c.id);
    setModal("edit");
  }
  function save() {
    if (!form.name.trim() || !form.company.trim()) return;
    if (modal === "add") {
      const newId = Math.max(0, ...list.map(c => c.id)) + 1;
      // match customerId from company
      const cust = customers.find(cu => cu.company === form.company || cu.name === form.company);
      const entry: ContactMock = { ...form, id: newId, customerId: cust?.id ?? 0 };
      setList(l => [...l, entry]);
    } else if (modal === "edit" && editId !== null) {
      setList(l => l.map(c => c.id === editId ? { ...c, ...form } : c));
      if (selected?.id === editId) setSelected(prev => prev ? { ...prev, ...form } : prev);
    }
    setModal(null);
  }
  function remove(id: number) {
    setList(l => l.filter(c => c.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  return (
    <div style={{ display: "flex", gap: 16 }}>
      {/* Main */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#2D2D2D", marginBottom: 3 }}>ผู้ติดต่อ</h1>
            <p style={{ fontSize: "0.76rem", color: MUTED }}>รายชื่อผู้ติดต่อทั้งหมดในแต่ละบริษัท</p>
          </div>
          <button onClick={openAdd} style={{ display: "flex", alignItems: "center", gap: 7, background: PRIMARY, color: "#fff", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: "0.84rem", fontWeight: 700, cursor: "pointer" }}>
            <Plus size={15} /> เพิ่มผู้ติดต่อ
          </button>
        </div>

        {/* Stat cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
          {[
            { label: "ผู้ติดต่อทั้งหมด", value: stats.total, icon: <Users size={18} color={PRIMARY} />, color: PRIMARY },
            { label: "จำนวนบริษัท",      value: stats.companies, icon: <Building2 size={18} color="#f59e0b" />, color: "#f59e0b" },
            { label: "ผู้ติดต่อหลัก",   value: stats.primary,   icon: <UserCheck size={18} color="#22c55e" />, color: "#22c55e" },
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

        {/* Search + filter */}
        <div style={{ ...CARD, padding: "10px 14px", marginBottom: 12, display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search size={14} color={MUTED} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อ บริษัท ตำแหน่ง อีเมล..."
              style={{ ...INP, paddingLeft: 32, background: "#f8f9fb" }}
            />
          </div>
          <select value={filterCo} onChange={e => setFilter(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: "0.82rem", color: "#2D2D2D", cursor: "pointer", minWidth: 160 }}>
            <option value="">ทุกบริษัท</option>
            {companies.map(co => <option key={co} value={co}>{co}</option>)}
          </select>
        </div>

        {/* Table */}
        <div style={CARD}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}`, background: "#f8f9fb" }}>
                  {["ผู้ติดต่อ","ตำแหน่ง","บริษัท","โทรศัพท์","อีเมล",""].map((h, i) => (
                    <th key={i} style={{ padding: "10px 14px", fontSize: "0.67rem", fontWeight: 700, color: MUTED, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: "40px 0", color: MUTED, fontSize: "0.84rem" }}>ไม่พบผู้ติดต่อ</td></tr>
                )}
                {filtered.map(c => (
                  <tr key={c.id}
                    onClick={() => setSelected(c)}
                    style={{ borderBottom: `1px solid #f0f4f8`, cursor: "pointer", background: selected?.id === c.id ? "#f0f4fa" : undefined }}
                    onMouseEnter={e => { if (selected?.id !== c.id) (e.currentTarget as HTMLElement).style.background = "#f8f9fb"; }}
                    onMouseLeave={e => { if (selected?.id !== c.id) (e.currentTarget as HTMLElement).style.background = ""; }}
                  >
                    {/* Avatar + name */}
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: avatarColor(c.name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.72rem", fontWeight: 800, color: "#fff", flexShrink: 0 }}>
                          {initials(c.name)}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "#2D2D2D" }}>{c.name}</span>
                            {c.isPrimary && <Star size={11} color="#f59e0b" fill="#f59e0b" />}
                          </div>
                          {c.lineId && <div style={{ fontSize: "0.68rem", color: MUTED }}>LINE: {c.lineId}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: "0.8rem", color: MUTED }}>{c.role}</td>
                    <td style={{ padding: "11px 14px", fontSize: "0.8rem", fontWeight: 600, color: "#2D2D2D" }}>{c.company}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <a href={`tel:${c.phone}`} onClick={e => e.stopPropagation()}
                        style={{ fontSize: "0.8rem", color: PRIMARY, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                        <Phone size={12} />{c.phone}
                      </a>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <a href={`mailto:${c.email}`} onClick={e => e.stopPropagation()}
                        style={{ fontSize: "0.78rem", color: MUTED, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                        <Mail size={12} />{c.email}
                      </a>
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => openEdit(c)}
                          style={{ padding: "5px 10px", borderRadius: 7, background: "#f0f4fa", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", color: PRIMARY, fontWeight: 600 }}>
                          <Edit2 size={12} /> แก้ไข
                        </button>
                        <button onClick={() => remove(c.id)}
                          style={{ padding: "5px 8px", borderRadius: 7, background: "#fdeaed", border: "none", cursor: "pointer", color: "#f04d6a" }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "10px 16px", borderTop: `1px solid ${BORDER}`, fontSize: "0.72rem", color: MUTED }}>
            แสดง {filtered.length}/{list.length} รายการ
          </div>
        </div>
      </div>

      {/* Side panel */}
      {selected && (
        <>
          <div onClick={() => setSelected(null)} style={{position:"fixed",inset:0,background:"rgba(45,45,45,.38)",zIndex:300}} />
          <div style={{position:"fixed",right:0,top:0,height:"100vh",width:420,background:"#fff",overflowY:"auto",zIndex:301,boxShadow:"-6px 0 40px rgba(0,51,102,.16)"}}>
          <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.84rem", fontWeight: 700, color: "#2D2D2D" }}>ข้อมูลผู้ติดต่อ</span>
            <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED }}>
              <X size={16} />
            </button>
          </div>
          <div style={{ padding: "18px 16px" }}>
            {/* Avatar */}
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: avatarColor(selected.name), display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: 800, color: "#fff", margin: "0 auto 10px" }}>
                {initials(selected.name)}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <span style={{ fontSize: "1rem", fontWeight: 800, color: "#2D2D2D" }}>{selected.name}</span>
                {selected.isPrimary && <span style={{ background: "#fef3cd", color: "#f59e0b", fontSize: "0.65rem", fontWeight: 700, padding: "2px 8px", borderRadius: 99 }}>ผู้ติดต่อหลัก</span>}
              </div>
              <div style={{ fontSize: "0.78rem", color: MUTED, marginTop: 3 }}>{selected.role}</div>
            </div>

            {/* Company */}
            <div style={{ background: "#dce5f0", borderRadius: 10, padding: "10px 12px", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <Building2 size={15} color={PRIMARY} />
              <span style={{ fontSize: "0.84rem", fontWeight: 700, color: PRIMARY }}>{selected.company}</span>
            </div>

            {/* Contact info */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { label: "โทรศัพท์", value: selected.phone, href: `tel:${selected.phone}`, icon: <Phone size={13} color={PRIMARY} /> },
                { label: "อีเมล",    value: selected.email, href: `mailto:${selected.email}`, icon: <Mail size={13} color={PRIMARY} /> },
              ].map(row => (
                <div key={row.label}>
                  <div style={{ fontSize: "0.68rem", fontWeight: 700, color: MUTED, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.04em" }}>{row.label}</div>
                  <a href={row.href} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.84rem", color: PRIMARY, textDecoration: "none", fontWeight: 600 }}>
                    {row.icon}{row.value}
                  </a>
                </div>
              ))}
              {selected.lineId && (
                <div>
                  <div style={{ fontSize: "0.68rem", fontWeight: 700, color: MUTED, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.04em" }}>LINE ID</div>
                  <span style={{ fontSize: "0.84rem", color: "#06c755", fontWeight: 600 }}>{selected.lineId}</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => openEdit(selected)}
                style={{ width: "100%", padding: "9px 0", borderRadius: 9, background: PRIMARY, color: "#fff", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.84rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Edit2 size={13} /> แก้ไขข้อมูล
              </button>
              <button onClick={() => remove(selected.id)}
                style={{ width: "100%", padding: "9px 0", borderRadius: 9, background: "#fdeaed", color: "#f04d6a", border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.84rem", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <Trash2 size={13} /> ลบผู้ติดต่อ
              </button>
            </div>
          </div>
        </div>
        </>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 18, width: 480, maxHeight: "85vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,.25)" }}>
            <div style={{ padding: "18px 22px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "1rem", fontWeight: 800, color: "#2D2D2D" }}>{modal === "add" ? "เพิ่มผู้ติดต่อ" : "แก้ไขผู้ติดต่อ"}</span>
              <button onClick={() => setModal(null)} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED }}><X size={18} /></button>
            </div>
            <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={LBL}>ชื่อ-นามสกุล *</label>
                <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="คุณชื่อ นามสกุล" style={INP} />
              </div>
              <div>
                <label style={LBL}>บริษัท *</label>
                <select value={form.company} onChange={e => set("company", e.target.value)} style={{ ...INP, cursor: "pointer" }}>
                  <option value="">-- เลือกบริษัท --</option>
                  {customers.map(cu => <option key={cu.id} value={cu.company}>{cu.company}</option>)}
                  <option value="_new">+ เพิ่มบริษัทใหม่...</option>
                </select>
                {form.company === "_new" && (
                  <input value="" onChange={e => set("company", e.target.value)} placeholder="ชื่อบริษัท" style={{ ...INP, marginTop: 6 }} />
                )}
              </div>
              <div>
                <label style={LBL}>ตำแหน่ง</label>
                <select value={form.role} onChange={e => set("role", e.target.value)} style={{ ...INP, cursor: "pointer" }}>
                  <option value="">-- เลือกตำแหน่ง --</option>
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={LBL}>โทรศัพท์</label>
                  <input value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="08X-XXX-XXXX" style={INP} />
                </div>
                <div>
                  <label style={LBL}>LINE ID</label>
                  <input value={form.lineId ?? ""} onChange={e => set("lineId", e.target.value)} placeholder="line_id" style={INP} />
                </div>
              </div>
              <div>
                <label style={LBL}>อีเมล</label>
                <input type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="email@company.com" style={INP} />
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", background: "#f8f9fb", borderRadius: 9, border: `1px solid ${BORDER}` }}>
                <input type="checkbox" id="isPrimary" checked={form.isPrimary} onChange={e => set("isPrimary", e.target.checked)} style={{ width: 16, height: 16, cursor: "pointer" }} />
                <label htmlFor="isPrimary" style={{ fontSize: "0.84rem", color: "#2D2D2D", cursor: "pointer", fontWeight: 600 }}>
                  <Star size={13} color="#f59e0b" fill="#f59e0b" style={{ verticalAlign: "middle", marginRight: 4 }} />
                  ตั้งเป็นผู้ติดต่อหลักของบริษัทนี้
                </label>
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
