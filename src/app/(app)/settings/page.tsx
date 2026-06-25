"use client";

import { useState, useRef } from "react";
import { Building2, GitBranch, Percent, Users, Plus, Pencil, Trash2, GripVertical, X, Check, Save } from "lucide-react";

const CARD: React.CSSProperties = {
  background: "#fff",
  borderRadius: 16,
  border: "1px solid #cfd4dc",
  boxShadow: "0 2px 14px rgba(0,51,102,.07)",
};

type SettingTab = "company" | "stages" | "taxes" | "departments";

const TABS: { key: SettingTab; label: string; icon: React.ReactNode }[] = [
  { key: "company", label: "บริษัท", icon: <Building2 size={15} /> },
  { key: "stages", label: "ขั้นตอนการขาย", icon: <GitBranch size={15} /> },
  { key: "taxes", label: "ภาษี", icon: <Percent size={15} /> },
  { key: "departments", label: "แผนก", icon: <Users size={15} /> },
];

// ---------- shared style helpers ----------
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 11px",
  borderRadius: 9,
  border: "1px solid #cfd4dc",
  fontSize: "0.81rem",
  color: "#2D2D2D",
  outline: "none",
  boxSizing: "border-box",
  background: "#fafafa",
  fontFamily: "inherit",
};

function StyledInput({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={inputStyle}
      onFocus={e => { e.currentTarget.style.borderColor = "#003366"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,51,102,.10)"; }}
      onBlur={e => { e.currentTarget.style.borderColor = "#cfd4dc"; e.currentTarget.style.background = "#fafafa"; e.currentTarget.style.boxShadow = "none"; }}
    />
  );
}

function BtnPrimary({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#003366", color: "#fff", border: "none", borderRadius: 9, padding: "8px 16px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 3px 8px rgba(0,51,102,.22)", fontFamily: "inherit" }}>
      {children}
    </button>
  );
}

function BtnGhost({ onClick, children, danger }: { onClick?: () => void; children: React.ReactNode; danger?: boolean }) {
  return (
    <button onClick={onClick}
      style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "transparent", color: danger ? "#f04d6a" : "#6b7280", border: `1px solid ${danger ? "#f04d6a" : "#cfd4dc"}`, borderRadius: 8, padding: "5px 10px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
      {children}
    </button>
  );
}

// ---------- COMPANY TAB ----------
function CompanyTab() {
  const [form, setForm] = useState({
    name: "Master Builder Co., Ltd.",
    email: "info@masterbld.co.th",
    phone: "053-234-5678",
    address: "99 ถ.นิมมานเหมินท์ เชียงใหม่ 50200",
    vatId: "0105555000001",
  });
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div>
      <div style={{ padding: "18px 24px", borderBottom: "1px solid #f0f4f8" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#2D2D2D", margin: 0 }}>ข้อมูลบริษัท</h2>
        <p style={{ fontSize: "0.73rem", color: "#6b7280", margin: "3px 0 0" }}>กำหนดรายละเอียดบริษัทที่ใช้ในเอกสาร</p>
      </div>
      <div style={{ padding: "20px 24px" }}>
        {/* Logo placeholder */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6b7280", marginBottom: 8 }}>โลโก้บริษัท</div>
          <div style={{ width: 100, height: 100, borderRadius: 12, border: "2px dashed #cfd4dc", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", color: "#6b7280" }}>
            <Building2 size={28} style={{ color: "#C0C0C0" }} />
            <span style={{ fontSize: "0.68rem" }}>อัปโหลดโลโก้</span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6b7280", marginBottom: 5 }}>ชื่อบริษัท</div>
            <StyledInput value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
          </div>
          <div>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6b7280", marginBottom: 5 }}>เลขประจำตัวผู้เสียภาษี (VAT ID)</div>
            <StyledInput value={form.vatId} onChange={v => setForm(f => ({ ...f, vatId: v }))} />
          </div>
          <div>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6b7280", marginBottom: 5 }}>อีเมล</div>
            <StyledInput value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} type="email" />
          </div>
          <div>
            <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6b7280", marginBottom: 5 }}>โทรศัพท์</div>
            <StyledInput value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} />
          </div>
        </div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#6b7280", marginBottom: 5 }}>ที่อยู่</div>
          <textarea
            value={form.address}
            onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            rows={3}
            style={{ ...inputStyle, resize: "vertical" }}
            onFocus={e => { e.currentTarget.style.borderColor = "#003366"; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,51,102,.10)"; }}
            onBlur={e => { e.currentTarget.style.borderColor = "#cfd4dc"; e.currentTarget.style.background = "#fafafa"; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <BtnPrimary onClick={handleSave}>
            {saved ? <><Check size={14} /> บันทึกแล้ว</> : <><Save size={14} /> บันทึก</>}
          </BtnPrimary>
        </div>
      </div>
    </div>
  );
}

// ---------- LEAD STAGES TAB ----------
type Stage = { id: number; name: string; color: string; pos: number };

const DEFAULT_STAGES: Stage[] = [
  { id: 1, name: "ผู้สนใจ", color: "#3b82f6", pos: 1 },
  { id: 2, name: "ติดต่อแล้ว", color: "#f59e0b", pos: 2 },
  { id: 3, name: "สำรวจหน้างาน", color: "#14b8a6", pos: 3 },
  { id: 4, name: "ส่งใบเสนอราคา", color: "#003366", pos: 4 },
  { id: 5, name: "เจรจาราคา", color: "#f97316", pos: 5 },
  { id: 6, name: "ปิดการขาย", color: "#22c55e", pos: 6 },
  { id: 7, name: "ไม่สนใจ", color: "#f04d6a", pos: 7 },
];

const STAGE_COLORS = ["#003366", "#3b82f6", "#22c55e", "#f59e0b", "#f04d6a", "#14b8a6", "#f97316", "#0d9488", "#C0C0C0"];

function StagesTab() {
  const [stages, setStages] = useState<Stage[]>(DEFAULT_STAGES);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#3b82f6");
  const [dragId, setDragId] = useState<number | null>(null);
  const [dragOverId, setDragOverId] = useState<number | null>(null);
  const nextId = useRef(100);

  function startEdit(s: Stage) {
    setEditId(s.id);
    setEditName(s.name);
    setEditColor(s.color);
  }
  function saveEdit() {
    setStages(prev => prev.map(s => s.id === editId ? { ...s, name: editName, color: editColor } : s));
    setEditId(null);
  }
  function deleteStage(id: number) {
    setStages(prev => prev.filter(s => s.id !== id));
  }
  function addStage() {
    if (!newName.trim()) return;
    const maxPos = stages.reduce((m, s) => Math.max(m, s.pos), 0);
    setStages(prev => [...prev, { id: nextId.current++, name: newName.trim(), color: newColor, pos: maxPos + 1 }]);
    setNewName("");
    setNewColor("#3b82f6");
    setAdding(false);
  }

  function handleDragStart(id: number) { setDragId(id); }
  function handleDragOver(e: React.DragEvent, id: number) { e.preventDefault(); setDragOverId(id); }
  function handleDrop(id: number) {
    if (dragId === null || dragId === id) { setDragId(null); setDragOverId(null); return; }
    const sorted = [...stages].sort((a, b) => a.pos - b.pos);
    const fromIdx = sorted.findIndex(s => s.id === dragId);
    const toIdx = sorted.findIndex(s => s.id === id);
    const moved = sorted.splice(fromIdx, 1)[0];
    sorted.splice(toIdx, 0, moved);
    setStages(sorted.map((s, i) => ({ ...s, pos: i + 1 })));
    setDragId(null);
    setDragOverId(null);
  }

  const sorted = [...stages].sort((a, b) => a.pos - b.pos);

  return (
    <div>
      <div style={{ padding: "18px 24px", borderBottom: "1px solid #f0f4f8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#2D2D2D", margin: 0 }}>ขั้นตอนการขาย</h2>
          <p style={{ fontSize: "0.73rem", color: "#6b7280", margin: "3px 0 0" }}>กำหนด stage ของลีดและลำดับการไหล</p>
        </div>
        <BtnPrimary onClick={() => setAdding(true)}><Plus size={14} /> เพิ่ม Stage</BtnPrimary>
      </div>
      <div style={{ padding: "16px 24px" }}>
        {/* Add form */}
        {adding && (
          <div style={{ background: "#f4f6f9", borderRadius: 12, border: "1px solid #cfd4dc", padding: "14px 16px", marginBottom: 12, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <StyledInput value={newName} onChange={setNewName} placeholder="ชื่อ stage" />
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 600 }}>สี:</span>
              {STAGE_COLORS.map(c => (
                <button key={c} onClick={() => setNewColor(c)}
                  style={{ width: 20, height: 20, borderRadius: "50%", background: c, border: newColor === c ? "2px solid #2D2D2D" : "2px solid transparent", cursor: "pointer", outline: "none" }} />
              ))}
            </div>
            <BtnPrimary onClick={addStage}><Check size={13} /> บันทึก</BtnPrimary>
            <BtnGhost onClick={() => { setAdding(false); setNewName(""); }}><X size={13} /> ยกเลิก</BtnGhost>
          </div>
        )}

        {/* Table */}
        <div style={{ borderRadius: 12, border: "1px solid #cfd4dc", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.81rem" }}>
            <thead>
              <tr style={{ background: "#f4f6f9" }}>
                <th style={{ padding: "10px 14px", textAlign: "left", color: "#6b7280", fontWeight: 600, width: 36 }}></th>
                <th style={{ padding: "10px 14px", textAlign: "left", color: "#6b7280", fontWeight: 600, width: 40 }}>ลำดับ</th>
                <th style={{ padding: "10px 14px", textAlign: "left", color: "#6b7280", fontWeight: 600 }}>ชื่อ Stage</th>
                <th style={{ padding: "10px 14px", textAlign: "left", color: "#6b7280", fontWeight: 600, width: 80 }}>สี</th>
                <th style={{ padding: "10px 14px", textAlign: "right", color: "#6b7280", fontWeight: 600, width: 120 }}>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s, idx) => (
                <tr key={s.id}
                  draggable
                  onDragStart={() => handleDragStart(s.id)}
                  onDragOver={e => handleDragOver(e, s.id)}
                  onDrop={() => handleDrop(s.id)}
                  onDragEnd={() => { setDragId(null); setDragOverId(null); }}
                  style={{ borderTop: "1px solid #f0f4f8", background: dragOverId === s.id ? "#dce5f0" : (dragId === s.id ? "#f4f6f9" : "#fff"), transition: "background .1s" }}>
                  <td style={{ padding: "10px 14px", cursor: "grab", color: "#C0C0C0" }}><GripVertical size={16} /></td>
                  <td style={{ padding: "10px 14px", color: "#6b7280" }}>{s.pos}</td>
                  <td style={{ padding: "10px 14px" }}>
                    {editId === s.id ? (
                      <StyledInput value={editName} onChange={setEditName} />
                    ) : (
                      <span style={{ fontWeight: 600, color: "#2D2D2D" }}>{s.name}</span>
                    )}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    {editId === s.id ? (
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {STAGE_COLORS.map(c => (
                          <button key={c} onClick={() => setEditColor(c)}
                            style={{ width: 18, height: 18, borderRadius: "50%", background: c, border: editColor === c ? "2px solid #2D2D2D" : "2px solid transparent", cursor: "pointer", outline: "none" }} />
                        ))}
                      </div>
                    ) : (
                      <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: "50%", background: s.color, verticalAlign: "middle" }} />
                    )}
                  </td>
                  <td style={{ padding: "10px 14px", textAlign: "right" }}>
                    {editId === s.id ? (
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <BtnPrimary onClick={saveEdit}><Check size={13} /> บันทึก</BtnPrimary>
                        <BtnGhost onClick={() => setEditId(null)}><X size={13} /></BtnGhost>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <BtnGhost onClick={() => startEdit(s)}><Pencil size={13} /> แก้ไข</BtnGhost>
                        <BtnGhost danger onClick={() => deleteStage(s.id)}><Trash2 size={13} /></BtnGhost>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ fontSize: "0.71rem", color: "#C0C0C0", marginTop: 8 }}>ลาก ⠿ เพื่อเรียงลำดับ stage</p>
      </div>
    </div>
  );
}

// ---------- TAXES TAB ----------
type TaxRate = { id: number; name: string; rate: number; active: boolean };

const DEFAULT_TAXES: TaxRate[] = [
  { id: 1, name: "VAT", rate: 7, active: true },
  { id: 2, name: "Withholding Tax", rate: 3, active: true },
];

function TaxesTab() {
  const [taxes, setTaxes] = useState<TaxRate[]>(DEFAULT_TAXES);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editRate, setEditRate] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRate, setNewRate] = useState("");
  const nextId = useRef(200);

  function startEdit(t: TaxRate) { setEditId(t.id); setEditName(t.name); setEditRate(String(t.rate)); }
  function saveEdit() {
    setTaxes(prev => prev.map(t => t.id === editId ? { ...t, name: editName, rate: parseFloat(editRate) || 0 } : t));
    setEditId(null);
  }
  function toggleActive(id: number) { setTaxes(prev => prev.map(t => t.id === id ? { ...t, active: !t.active } : t)); }
  function deleteTax(id: number) { setTaxes(prev => prev.filter(t => t.id !== id)); }
  function addTax() {
    if (!newName.trim()) return;
    setTaxes(prev => [...prev, { id: nextId.current++, name: newName.trim(), rate: parseFloat(newRate) || 0, active: true }]);
    setNewName(""); setNewRate(""); setAdding(false);
  }

  return (
    <div>
      <div style={{ padding: "18px 24px", borderBottom: "1px solid #f0f4f8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#2D2D2D", margin: 0 }}>ภาษี</h2>
          <p style={{ fontSize: "0.73rem", color: "#6b7280", margin: "3px 0 0" }}>กำหนดอัตราภาษีที่ใช้ในใบเสนอราคา</p>
        </div>
        <BtnPrimary onClick={() => setAdding(true)}><Plus size={14} /> เพิ่มภาษี</BtnPrimary>
      </div>
      <div style={{ padding: "16px 24px" }}>
        {adding && (
          <div style={{ background: "#f4f6f9", borderRadius: 12, border: "1px solid #cfd4dc", padding: "14px 16px", marginBottom: 12, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <StyledInput value={newName} onChange={setNewName} placeholder="ชื่อภาษี" />
            </div>
            <div style={{ width: 100 }}>
              <StyledInput value={newRate} onChange={setNewRate} placeholder="อัตรา %" type="number" />
            </div>
            <BtnPrimary onClick={addTax}><Check size={13} /> บันทึก</BtnPrimary>
            <BtnGhost onClick={() => { setAdding(false); setNewName(""); setNewRate(""); }}><X size={13} /> ยกเลิก</BtnGhost>
          </div>
        )}

        <div style={{ borderRadius: 12, border: "1px solid #cfd4dc", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.81rem" }}>
            <thead>
              <tr style={{ background: "#f4f6f9" }}>
                <th style={{ padding: "10px 16px", textAlign: "left", color: "#6b7280", fontWeight: 600 }}>ชื่อภาษี</th>
                <th style={{ padding: "10px 16px", textAlign: "left", color: "#6b7280", fontWeight: 600, width: 120 }}>อัตรา (%)</th>
                <th style={{ padding: "10px 16px", textAlign: "left", color: "#6b7280", fontWeight: 600, width: 100 }}>สถานะ</th>
                <th style={{ padding: "10px 16px", textAlign: "right", color: "#6b7280", fontWeight: 600, width: 140 }}>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {taxes.map(t => (
                <tr key={t.id} style={{ borderTop: "1px solid #f0f4f8", background: "#fff" }}>
                  <td style={{ padding: "10px 16px" }}>
                    {editId === t.id
                      ? <StyledInput value={editName} onChange={setEditName} />
                      : <span style={{ fontWeight: 600, color: "#2D2D2D" }}>{t.name}</span>}
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    {editId === t.id
                      ? <StyledInput value={editRate} onChange={setEditRate} type="number" />
                      : <span style={{ color: "#2D2D2D" }}>{t.rate}%</span>}
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <button onClick={() => toggleActive(t.id)}
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, border: "none", cursor: "pointer", background: t.active ? "#e5faf0" : "#fdeaed", color: t.active ? "#22c55e" : "#f04d6a", fontSize: "0.73rem", fontWeight: 700, fontFamily: "inherit" }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: t.active ? "#22c55e" : "#f04d6a", display: "inline-block" }} />
                      {t.active ? "ใช้งาน" : "ไม่ใช้งาน"}
                    </button>
                  </td>
                  <td style={{ padding: "10px 16px", textAlign: "right" }}>
                    {editId === t.id ? (
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <BtnPrimary onClick={saveEdit}><Check size={13} /> บันทึก</BtnPrimary>
                        <BtnGhost onClick={() => setEditId(null)}><X size={13} /></BtnGhost>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <BtnGhost onClick={() => startEdit(t)}><Pencil size={13} /> แก้ไข</BtnGhost>
                        <BtnGhost danger onClick={() => deleteTax(t.id)}><Trash2 size={13} /></BtnGhost>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------- DEPARTMENTS TAB ----------
type Department = { id: number; name: string; color: string; active: boolean };

const DEPT_COLORS = ["#003366", "#3b82f6", "#22c55e", "#f59e0b", "#14b8a6", "#f04d6a", "#0d9488", "#C0C0C0"];

const DEFAULT_DEPTS: Department[] = [
  { id: 1, name: "ฝ่ายขาย", color: "#003366", active: true },
  { id: 2, name: "วิศวกรรม", color: "#3b82f6", active: true },
  { id: 3, name: "การเงิน", color: "#22c55e", active: true },
  { id: 4, name: "ปฏิบัติการ", color: "#f59e0b", active: true },
];

function DepartmentsTab() {
  const [depts, setDepts] = useState<Department[]>(DEFAULT_DEPTS);
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("#003366");
  const nextId = useRef(300);

  function startEdit(d: Department) { setEditId(d.id); setEditName(d.name); setEditColor(d.color); }
  function saveEdit() {
    setDepts(prev => prev.map(d => d.id === editId ? { ...d, name: editName, color: editColor } : d));
    setEditId(null);
  }
  function toggleActive(id: number) { setDepts(prev => prev.map(d => d.id === id ? { ...d, active: !d.active } : d)); }
  function deleteDept(id: number) { setDepts(prev => prev.filter(d => d.id !== id)); }
  function addDept() {
    if (!newName.trim()) return;
    setDepts(prev => [...prev, { id: nextId.current++, name: newName.trim(), color: newColor, active: true }]);
    setNewName(""); setNewColor("#003366"); setAdding(false);
  }

  return (
    <div>
      <div style={{ padding: "18px 24px", borderBottom: "1px solid #f0f4f8", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#2D2D2D", margin: 0 }}>แผนก</h2>
          <p style={{ fontSize: "0.73rem", color: "#6b7280", margin: "3px 0 0" }}>จัดการแผนกภายในองค์กร</p>
        </div>
        <BtnPrimary onClick={() => setAdding(true)}><Plus size={14} /> เพิ่มแผนก</BtnPrimary>
      </div>
      <div style={{ padding: "16px 24px" }}>
        {adding && (
          <div style={{ background: "#f4f6f9", borderRadius: 12, border: "1px solid #cfd4dc", padding: "14px 16px", marginBottom: 12, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 160 }}>
              <StyledInput value={newName} onChange={setNewName} placeholder="ชื่อแผนก" />
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 600 }}>สี:</span>
              {DEPT_COLORS.map(c => (
                <button key={c} onClick={() => setNewColor(c)}
                  style={{ width: 20, height: 20, borderRadius: "50%", background: c, border: newColor === c ? "2px solid #2D2D2D" : "2px solid transparent", cursor: "pointer", outline: "none" }} />
              ))}
            </div>
            <BtnPrimary onClick={addDept}><Check size={13} /> บันทึก</BtnPrimary>
            <BtnGhost onClick={() => { setAdding(false); setNewName(""); }}><X size={13} /> ยกเลิก</BtnGhost>
          </div>
        )}

        <div style={{ borderRadius: 12, border: "1px solid #cfd4dc", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.81rem" }}>
            <thead>
              <tr style={{ background: "#f4f6f9" }}>
                <th style={{ padding: "10px 16px", textAlign: "left", color: "#6b7280", fontWeight: 600 }}>ชื่อแผนก</th>
                <th style={{ padding: "10px 16px", textAlign: "left", color: "#6b7280", fontWeight: 600, width: 80 }}>สี</th>
                <th style={{ padding: "10px 16px", textAlign: "left", color: "#6b7280", fontWeight: 600, width: 110 }}>สถานะ</th>
                <th style={{ padding: "10px 16px", textAlign: "right", color: "#6b7280", fontWeight: 600, width: 140 }}>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {depts.map(d => (
                <tr key={d.id} style={{ borderTop: "1px solid #f0f4f8", background: "#fff" }}>
                  <td style={{ padding: "10px 16px" }}>
                    {editId === d.id
                      ? <StyledInput value={editName} onChange={setEditName} />
                      : <span style={{ fontWeight: 600, color: "#2D2D2D" }}>{d.name}</span>}
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    {editId === d.id ? (
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {DEPT_COLORS.map(c => (
                          <button key={c} onClick={() => setEditColor(c)}
                            style={{ width: 18, height: 18, borderRadius: "50%", background: c, border: editColor === c ? "2px solid #2D2D2D" : "2px solid transparent", cursor: "pointer", outline: "none" }} />
                        ))}
                      </div>
                    ) : (
                      <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: "50%", background: d.color, verticalAlign: "middle" }} />
                    )}
                  </td>
                  <td style={{ padding: "10px 16px" }}>
                    <button onClick={() => toggleActive(d.id)}
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, border: "none", cursor: "pointer", background: d.active ? "#e5faf0" : "#fdeaed", color: d.active ? "#22c55e" : "#f04d6a", fontSize: "0.73rem", fontWeight: 700, fontFamily: "inherit" }}>
                      <span style={{ width: 7, height: 7, borderRadius: "50%", background: d.active ? "#22c55e" : "#f04d6a", display: "inline-block" }} />
                      {d.active ? "ใช้งาน" : "ไม่ใช้งาน"}
                    </button>
                  </td>
                  <td style={{ padding: "10px 16px", textAlign: "right" }}>
                    {editId === d.id ? (
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <BtnPrimary onClick={saveEdit}><Check size={13} /> บันทึก</BtnPrimary>
                        <BtnGhost onClick={() => setEditId(null)}><X size={13} /></BtnGhost>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                        <BtnGhost onClick={() => startEdit(d)}><Pencil size={13} /> แก้ไข</BtnGhost>
                        <BtnGhost danger onClick={() => deleteDept(d.id)}><Trash2 size={13} /></BtnGhost>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ---------- ROOT PAGE ----------
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingTab>("company");

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#2D2D2D", marginBottom: 3 }}>ตั้งค่าระบบ</h1>
        <p style={{ fontSize: "0.76rem", color: "#6b7280" }}>จัดการข้อมูลบริษัท ขั้นตอนการขาย ภาษี และแผนก</p>
      </div>

      {/* Tab bar */}
      <div style={{ ...CARD, marginBottom: 18, padding: "0 8px", display: "flex", gap: 0, overflowX: "auto" }}>
        {TABS.map(t => {
          const active = activeTab === t.key;
          return (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              style={{
                display: "flex", alignItems: "center", gap: 7, padding: "14px 20px",
                border: "none", borderBottom: active ? "2.5px solid #003366" : "2.5px solid transparent",
                background: "transparent",
                color: active ? "#003366" : "#6b7280",
                fontWeight: active ? 700 : 500,
                fontSize: "0.82rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "color .15s",
                fontFamily: "inherit",
              }}>
              {t.icon}
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div style={CARD}>
        {activeTab === "company" && <CompanyTab />}
        {activeTab === "stages" && <StagesTab />}
        {activeTab === "taxes" && <TaxesTab />}
        {activeTab === "departments" && <DepartmentsTab />}
      </div>
    </div>
  );
}
