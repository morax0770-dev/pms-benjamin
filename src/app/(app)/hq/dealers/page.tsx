"use client";

import { useState } from "react";
import { dealerLeaderboard, type DealerRow, type DealerCredentials } from "@/lib/mock";
import { useRole } from "@/context/RoleContext";
import { useRouter } from "next/navigation";
import { Plus, Search, X, Copy, Check, Key, LogIn, Pencil, Trash2, EyeOff, Eye } from "lucide-react";

const CARD: React.CSSProperties = { background: "#fff", borderRadius: 16, border: "1px solid #cfd4dc", boxShadow: "0 2px 14px rgba(0,51,102,.07)" };
const REGIONS = ["เหนือ", "กลาง", "ตะวันออก", "ตะวันตก", "ใต้", "อีสาน"];

// ── Sub-components ──────────────────────────────────────────────

function RevBar({ actual, target }: { actual: number; target: number }) {
  const pct = target > 0 ? Math.min(100, Math.round(actual / target * 100)) : 0;
  const color = pct >= 100 ? "#22c55e" : pct >= 75 ? "#3b82f6" : pct >= 50 ? "#f59e0b" : "#f04d6a";
  return (
    <div style={{ minWidth: 130 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", marginBottom: 3 }}>
        <span style={{ color: "#6b7280" }}>฿{(actual / 1_000_000).toFixed(1)}M</span>
        <span style={{ fontWeight: 700, color }}>{pct}%</span>
      </div>
      <div style={{ height: 6, background: "#f0f0f5", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 99 }} />
      </div>
      <div style={{ fontSize: "0.66rem", color: "#6b7280", marginTop: 2 }}>
        เป้า ฿{(target / 1_000_000).toFixed(0)}M
      </div>
    </div>
  );
}

function OnTimeBadge({ pct }: { pct: number }) {
  if (pct === 0) return <span style={{ color: "#C0C0C0", fontSize: "0.78rem" }}>—</span>;
  const color = pct >= 85 ? "#22c55e" : pct >= 70 ? "#f59e0b" : "#f04d6a";
  return (
    <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 99, background: color + "22", color, fontWeight: 700, fontSize: "0.75rem" }}>
      {pct}%
    </span>
  );
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  function doCopy() {
    navigator.clipboard.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: "0.7rem", color: "#6b7280", marginBottom: 4, fontWeight: 600 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f0f4f8", border: "1px solid #cfd4dc", borderRadius: 8, padding: "8px 11px" }}>
        <span style={{ flex: 1, fontFamily: "monospace", fontSize: "0.86rem", fontWeight: 700, color: "#2D2D2D", letterSpacing: "0.03em" }}>{value}</span>
        <button type="button" onClick={doCopy} style={{ background: "none", border: "none", cursor: "pointer", color: copied ? "#22c55e" : "#6b7280", padding: 0, display: "flex" }}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}

function InputField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: "0.72rem", color: "#6b7280", fontWeight: 600, display: "block", marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  );
}

const INPUT_STYLE: React.CSSProperties = { width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #cfd4dc", fontSize: "0.82rem", color: "#2D2D2D", outline: "none", background: "#fafafa", boxSizing: "border-box" };

function genCredentials(code: string): DealerCredentials {
  const digits = String(1000 + ((code.charCodeAt(0) * 37 + code.charCodeAt(1) * 17) % 9000));
  return { email: `${code.toLowerCase()}@benjamin.co.th`, password: `PEB-${code}-${digits}` };
}

// ── Main page ───────────────────────────────────────────────────

export default function HQDealersPage() {
  const { login } = useRole();
  const router = useRouter();

  const [dealers, setDealers] = useState<DealerRow[]>(dealerLeaderboard);
  const [q, setQ] = useState("");
  const [regionFilter, setRegionFilter] = useState("ทั้งหมด");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<DealerRow | null>(null);
  const [form, setForm] = useState({ code: "", name: "", region: "กลาง", revenueTarget: 0, status: "active" as "active" | "inactive" });
  const [formErr, setFormErr] = useState("");
  const [credsModal, setCredsModal] = useState<{ name: string; creds: DealerCredentials } | null>(null);
  const [viewCredsDealer, setViewCredsDealer] = useState<DealerRow | null>(null);
  const [entering, setEntering] = useState<string | null>(null);

  // Stats
  const active = dealers.filter(d => d.status === "active");
  const totalRevenue = dealers.reduce((s, d) => s + d.revenueActual, 0);
  const totalTarget = dealers.reduce((s, d) => s + d.revenueTarget, 0);
  const totalProjects = dealers.reduce((s, d) => s + d.activeProjects, 0);
  const avgOnTime = active.length > 0 ? Math.round(active.reduce((s, d) => s + d.onTimePct, 0) / active.length) : 0;
  const totalPct = totalTarget > 0 ? Math.round(totalRevenue / totalTarget * 100) : 0;

  // Filter + sort
  const filtered = dealers.filter(d => {
    if (regionFilter !== "ทั้งหมด" && d.region !== regionFilter) return false;
    if (statusFilter === "active" && d.status !== "active") return false;
    if (statusFilter === "inactive" && d.status !== "inactive") return false;
    if (q && !`${d.code} ${d.name} ${d.region}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }).sort((a, b) => b.revenueActual - a.revenueActual);

  function openAdd() { setEditTarget(null); setForm({ code: "", name: "", region: "กลาง", revenueTarget: 0, status: "active" }); setFormErr(""); setShowForm(true); }
  function openEdit(d: DealerRow) { setEditTarget(d); setForm({ code: d.code, name: d.name, region: d.region, revenueTarget: d.revenueTarget, status: d.status }); setFormErr(""); setShowForm(true); }

  function save() {
    const code = form.code.trim().toUpperCase();
    if (!code) { setFormErr("ต้องระบุรหัสสาขา"); return; }
    if (!form.name.trim()) { setFormErr("ต้องระบุชื่อสาขา"); return; }
    const dupe = dealers.find(d => d.code === code && d.id !== editTarget?.id);
    if (dupe) { setFormErr(`รหัส "${code}" มีอยู่แล้ว`); return; }

    if (editTarget) {
      setDealers(prev => prev.map(d => d.id === editTarget.id ? { ...d, name: form.name.trim(), region: form.region, revenueTarget: form.revenueTarget, status: form.status } : d));
      setShowForm(false);
    } else {
      const creds = genCredentials(code);
      setDealers(prev => [...prev, { id: code, code, name: form.name.trim(), region: form.region, revenueActual: 0, revenueTarget: form.revenueTarget, winRate: 0, activeProjects: 0, onTimePct: 0, status: form.status, credentials: creds }]);
      setShowForm(false);
      setCredsModal({ name: form.name.trim(), creds });
    }
  }

  function remove(d: DealerRow) {
    if (!confirm(`ลบ "${d.name}" ออกจากระบบ?\nการกระทำนี้ไม่สามารถย้อนกลับได้`)) return;
    setDealers(prev => prev.filter(x => x.id !== d.id));
  }

  function toggleStatus(d: DealerRow) {
    setDealers(prev => prev.map(x => x.id === d.id ? { ...x, status: x.status === "active" ? "inactive" : "active" } : x));
  }

  function enterDealer(d: DealerRow) {
    setEntering(d.id);
    login("dealer");
    router.push("/dashboard");
  }

  const selectStyle: React.CSSProperties = { border: "1px solid #cfd4dc", borderRadius: 10, padding: "8px 12px", fontSize: "0.78rem", color: "#6b7280", background: "#fff", cursor: "pointer", outline: "none" };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#2D2D2D", marginBottom: 3 }}>สาขา</h1>
        <p style={{ fontSize: "0.76rem", color: "#6b7280" }}>จัดการและติดตามผลการดำเนินงานของทุกสาขา</p>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 16 }}>
        <div style={{ ...CARD, padding: "14px 16px" }}>
          <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 600, marginBottom: 6 }}>สาขาทั้งหมด</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#003366" }}>{dealers.length} สาขา</div>
          <div style={{ fontSize: "0.7rem", color: "#22c55e", fontWeight: 600, marginTop: 4 }}>เปิดใช้งาน {active.length} สาขา</div>
        </div>
        <div style={{ ...CARD, padding: "14px 16px" }}>
          <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 600, marginBottom: 6 }}>รายได้รวม</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#22c55e" }}>฿{(totalRevenue / 1_000_000).toFixed(1)}M</div>
          <div style={{ fontSize: "0.7rem", color: totalPct >= 100 ? "#22c55e" : "#f59e0b", fontWeight: 600, marginTop: 4 }}>
            {totalPct}% ของเป้า ฿{(totalTarget / 1_000_000).toFixed(0)}M
          </div>
        </div>
        <div style={{ ...CARD, padding: "14px 16px" }}>
          <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 600, marginBottom: 6 }}>โครงการทั้งหมด</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#f59e0b" }}>{totalProjects} โครงการ</div>
          <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 600, marginTop: 4 }}>
            {active.filter(d => d.activeProjects > 0).length} สาขามีงาน
          </div>
        </div>
        <div style={{ ...CARD, padding: "14px 16px" }}>
          <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 600, marginBottom: 6 }}>ส่งมอบตรงเวลา</div>
          <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#003366" }}>{avgOnTime}%</div>
          <div style={{ fontSize: "0.7rem", color: avgOnTime >= 85 ? "#22c55e" : avgOnTime >= 70 ? "#f59e0b" : "#f04d6a", fontWeight: 600, marginTop: 4 }}>
            {avgOnTime >= 85 ? "↑ ดี" : avgOnTime >= 70 ? "— พอใช้" : "↓ ต้องปรับปรุง"} เฉลี่ยทุกสาขา
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={CARD}>
        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid #cfd4dc", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fafafa", border: "1px solid #cfd4dc", borderRadius: 10, padding: "8px 12px", minWidth: 200 }}>
              <Search size={13} color="#6b7280" />
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="ค้นหาสาขา..." style={{ border: "none", outline: "none", fontSize: "0.8rem", color: "#2D2D2D", background: "transparent", flex: 1 }} />
            </div>
            <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)} style={selectStyle}>
              {["ทั้งหมด", ...REGIONS].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)} style={selectStyle}>
              <option value="all">ทั้งหมด</option>
              <option value="active">ใช้งาน</option>
              <option value="inactive">ปิดใช้งาน</option>
            </select>
          </div>
          <button onClick={openAdd} style={{ display: "flex", alignItems: "center", gap: 6, background: "#2D2D2D", color: "#fff", border: "none", borderRadius: 10, padding: "8px 16px", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(45,45,45,.2)" }}>
            <Plus size={14} /> เพิ่มสาขา
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #cfd4dc", background: "#f8f9fb" }}>
                {["#", "รหัส", "ชื่อสาขา", "ภาค", "ยอด / เป้า", "โครงการ", "ส่งตรงเวลา", "สถานะ", ""].map(h => (
                  <th key={h} style={{ fontSize: "0.67rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", padding: "10px 14px", textAlign: "left", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={9} style={{ padding: "32px", textAlign: "center", fontSize: "0.82rem", color: "#6b7280" }}>ไม่พบข้อมูล</td></tr>
              ) : filtered.map((d, i) => (
                <tr key={d.id} style={{ borderBottom: "1px solid #f0f4f8", opacity: d.status === "inactive" ? 0.55 : 1 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f8f9fb"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}>
                  <td style={{ padding: "12px 14px", fontSize: "0.72rem", color: "#6b7280", fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ fontWeight: 800, color: "#003366", fontSize: "0.82rem", letterSpacing: "0.05em" }}>{d.code}</span>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: "0.86rem", fontWeight: 700, color: "#2D2D2D", whiteSpace: "nowrap" }}>{d.name}</td>
                  <td style={{ padding: "12px 14px" }}>
                    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 99, fontSize: "0.68rem", fontWeight: 700, background: "#f0f0f5", color: "#6b7280" }}>{d.region}</span>
                  </td>
                  <td style={{ padding: "12px 14px" }}><RevBar actual={d.revenueActual} target={d.revenueTarget} /></td>
                  <td style={{ padding: "12px 14px" }}>
                    {d.activeProjects > 0
                      ? <span style={{ fontWeight: 700, color: "#2D2D2D", fontSize: "0.84rem" }}>{d.activeProjects}<span style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 500 }}> โครงการ</span></span>
                      : <span style={{ color: "#C0C0C0", fontSize: "0.78rem" }}>—</span>}
                  </td>
                  <td style={{ padding: "12px 14px" }}><OnTimeBadge pct={d.onTimePct} /></td>
                  <td style={{ padding: "12px 14px" }}>
                    {d.status === "active"
                      ? <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 99, background: "#e5faf0", color: "#22c55e", fontWeight: 700, fontSize: "0.7rem" }}>ใช้งาน</span>
                      : <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 99, background: "#f0f0f5", color: "#6b7280", fontWeight: 700, fontSize: "0.7rem" }}>ปิดใช้งาน</span>}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <button onClick={() => enterDealer(d)} disabled={entering === d.id} title="เข้าระบบสาขา"
                        style={{ display: "flex", alignItems: "center", gap: 5, background: "#003366", color: "#fff", border: "none", borderRadius: 7, padding: "5px 11px", fontSize: "0.73rem", fontWeight: 700, cursor: "pointer", opacity: entering === d.id ? 0.6 : 1, whiteSpace: "nowrap" }}>
                        <LogIn size={12} /> {entering === d.id ? "..." : "เข้าระบบ"}
                      </button>
                      <button onClick={() => setViewCredsDealer(d)} title="รหัสเข้าระบบ"
                        style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f4f8", border: "1px solid #cfd4dc", borderRadius: 7, color: "#003366", cursor: "pointer" }}>
                        <Key size={12} />
                      </button>
                      <button onClick={() => openEdit(d)} title="แก้ไข"
                        style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", border: "1px solid #cfd4dc", borderRadius: 7, color: "#6b7280", cursor: "pointer" }}>
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => toggleStatus(d)} title={d.status === "active" ? "ปิดใช้งาน" : "เปิดใช้งาน"}
                        style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", border: "1px solid #cfd4dc", borderRadius: 7, color: "#6b7280", cursor: "pointer" }}>
                        {d.status === "active" ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                      <button onClick={() => remove(d)} title="ลบ"
                        style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", border: "1px solid #fdeaed", borderRadius: 7, color: "#f04d6a", cursor: "pointer" }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ padding: "11px 16px", borderTop: "1px solid #cfd4dc" }}>
          <span style={{ fontSize: "0.73rem", color: "#6b7280" }}>แสดง {filtered.length} จาก {dealers.length} สาขา Benjamin</span>
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      {showForm && (
        <div onClick={() => setShowForm(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.42)", zIndex: 1050, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ ...CARD, width: 460, maxWidth: "100%" }}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid #cfd4dc", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#2D2D2D" }}>{editTarget ? "แก้ไขข้อมูลสาขา" : "เพิ่มสาขาใหม่"}</h2>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", display: "flex" }}><X size={18} /></button>
            </div>
            <div style={{ padding: "18px 20px" }}>
              {formErr && <div style={{ background: "#fdeaed", border: "1px solid #f04d6a30", borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: "0.78rem", color: "#f04d6a", fontWeight: 600 }}>{formErr}</div>}

              {!editTarget && (
                <div style={{ background: "#dce5f0", border: "1px solid #C0C0C0", borderRadius: 8, padding: "8px 12px", marginBottom: 14, fontSize: "0.75rem", color: "#003366", fontWeight: 600 }}>
                  ระบบจะสร้างรหัสเข้าสู่ระบบอัตโนมัติหลังบันทึก
                </div>
              )}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
                <InputField label="รหัสสาขา *">
                  <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase().slice(0, 6) }))} placeholder="เช่น BKK" disabled={!!editTarget}
                    style={{ ...INPUT_STYLE, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.06em", opacity: editTarget ? 0.6 : 1 }} />
                  {editTarget && <div style={{ fontSize: "0.66rem", color: "#6b7280", marginTop: 3 }}>แก้ไขรหัสไม่ได้</div>}
                </InputField>
                <InputField label="ชื่อสาขา *">
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Benjamin สาขา..." style={INPUT_STYLE} />
                </InputField>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <InputField label="ภาค">
                  <select value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} style={{ ...INPUT_STYLE, cursor: "pointer" }}>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </InputField>
                <InputField label="เป้ายอดขาย (บาท/ปี)">
                  <input type="number" value={form.revenueTarget || ""} onChange={e => setForm(f => ({ ...f, revenueTarget: Number(e.target.value) || 0 }))} placeholder="0" style={INPUT_STYLE} />
                </InputField>
              </div>

              <InputField label="สถานะ">
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))} style={{ ...INPUT_STYLE, cursor: "pointer" }}>
                  <option value="active">เปิดใช้งาน</option>
                  <option value="inactive">ปิดใช้งาน</option>
                </select>
              </InputField>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
                <button onClick={() => setShowForm(false)} style={{ padding: "9px 18px", borderRadius: 10, border: "1px solid #cfd4dc", background: "#fff", color: "#6b7280", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>ยกเลิก</button>
                <button onClick={save} style={{ padding: "9px 20px", borderRadius: 10, border: "none", background: "#2D2D2D", color: "#fff", fontSize: "0.8rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 10px rgba(45,45,45,.2)" }}>
                  {editTarget ? "บันทึกการแก้ไข" : "สร้างสาขา"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── New Dealer Credentials Modal ── */}
      {credsModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.52)", zIndex: 1060, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ ...CARD, width: 400, maxWidth: "100%" }}>
            <div style={{ padding: "24px 20px 18px", textAlign: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#e5faf0", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                <Check size={22} color="#22c55e" />
              </div>
              <h3 style={{ margin: "0 0 4px", fontWeight: 800, color: "#2D2D2D" }}>สร้างสาขาสำเร็จ!</h3>
              <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: 0 }}>{credsModal.name}</p>
            </div>
            <div style={{ padding: "0 20px 20px" }}>
              <div style={{ background: "#f0f4f8", border: "1px solid #cfd4dc", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
                <div style={{ fontSize: "0.68rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>รหัสเข้าสู่ระบบสาขา</div>
                <CopyField label="อีเมล" value={credsModal.creds.email} />
                <CopyField label="รหัสผ่านเริ่มต้น" value={credsModal.creds.password} />
              </div>
              <div style={{ background: "#fef3cd", border: "1px solid #f59e0b30", borderRadius: 8, padding: "8px 12px", marginBottom: 16, fontSize: "0.73rem", color: "#f59e0b", fontWeight: 600 }}>
                แจ้งรหัสผ่านให้สาขาและแนะนำให้เปลี่ยนรหัสหลังเข้าครั้งแรก
              </div>
              <button onClick={() => setCredsModal(null)} style={{ width: "100%", padding: "10px", borderRadius: 10, border: "none", background: "#2D2D2D", color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: "0.82rem" }}>
                รับทราบ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Credentials Modal ── */}
      {viewCredsDealer && (
        <div onClick={() => setViewCredsDealer(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.42)", zIndex: 1060, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div onClick={e => e.stopPropagation()} style={{ ...CARD, width: 380, maxWidth: "100%" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #cfd4dc", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "0.96rem", fontWeight: 800, color: "#2D2D2D" }}>รหัสเข้าระบบ</h3>
                <div style={{ fontSize: "0.72rem", color: "#6b7280", marginTop: 2 }}>{viewCredsDealer.name}</div>
              </div>
              <button onClick={() => setViewCredsDealer(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", display: "flex" }}><X size={16} /></button>
            </div>
            <div style={{ padding: "16px 20px" }}>
              <CopyField label="อีเมล" value={viewCredsDealer.credentials.email} />
              <CopyField label="รหัสผ่าน" value={viewCredsDealer.credentials.password} />
              <div style={{ fontSize: "0.72rem", color: "#6b7280", background: "#f0f4f8", borderRadius: 8, padding: "8px 12px", marginTop: 4 }}>
                สาขาใช้อีเมลนี้เข้าสู่ระบบที่หน้า Login ของดีลเลอร์
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
