"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Phone, Mail, Users, MapPin, FileText, CalendarDays, CheckCircle2 } from "lucide-react";
import {
  leads, customers, quotations, projects,
  leadStatusLabel, quotationStatusLabel, quotationStatusColor,
  projectStatusLabel, projectStatusColor,
  type LeadStatus,
} from "@/lib/mock";

const CARD: React.CSSProperties = {
  background: "#fff", borderRadius: 16, border: "1px solid #cfd4dc",
  boxShadow: "0 2px 14px rgba(0,51,102,.07)",
};
const PRIMARY = "#003366"; const STEEL = "#2D2D2D";
const BORDER = "#cfd4dc"; const SUCCESS = "#22c55e";

const STATUS_COLOR: Record<LeadStatus, { bg: string; text: string }> = {
  NEW:       { bg: "#f0f0f5", text: "#6b7280" },
  WAITING:   { bg: "#e0f5fd", text: "#0284c7" },
  BULLET:    { bg: "#fff4eb", text: "#ea6c00" },
  QUOTED:    { bg: "#f0fdf4", text: "#15803d" },
  PAID:      { bg: "#e6faf7", text: "#0f766e" },
  CANCELLED: { bg: "#fdeaed", text: "#f04d6a" },
};
const STATUS_ORDER: LeadStatus[] = ["NEW","WAITING","BULLET","QUOTED","PAID","CANCELLED"];
const ACT_TYPES = ["call","email","meeting","note","visit","doc"] as const;

function ActivityIcon({ type }: { type: string }) {
  const s = 14;
  if (type === "call")    return <Phone size={s}/>;
  if (type === "email")   return <Mail size={s}/>;
  if (type === "meeting") return <Users size={s}/>;
  if (type === "visit")   return <MapPin size={s}/>;
  if (type === "doc")     return <FileText size={s}/>;
  return <FileText size={s}/>;
}

type ActivityEntry = { id:number; date:string; text:string; type:string };

const INIT_ACTS: ActivityEntry[] = [
  { id:1, date:"22 มิ.ย. 2569", text:"โทรติดตามลูกค้า — ยืนยันนัดสำรวจ", type:"call" },
  { id:2, date:"18 มิ.ย. 2569", text:"ส่งใบเสนอราคาเบื้องต้น", type:"doc" },
  { id:3, date:"10 มิ.ย. 2569", text:"สำรวจหน้างานพร้อมทีม", type:"visit" },
  { id:4, date:"2 มิ.ย. 2569",  text:"บันทึกลีดใหม่เข้าระบบ", type:"note" },
];

function InfoRow({ label, value }: { label:string; value:React.ReactNode }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"10px 0", borderBottom:"1px solid #f0f4f8" }}>
      <span style={{ fontSize:"0.73rem", color:"#6b7280", fontWeight:600, minWidth:110 }}>{label}</span>
      <span style={{ fontSize:"0.82rem", color:STEEL, fontWeight:500 }}>{value}</span>
    </div>
  );
}

export default function LeadDetailPage() {
  const params = useParams();
  const numId = Number(params.id);
  const lead = leads.find(l => l.numId === numId);

  const [status,         setStatus]         = useState<LeadStatus>(lead?.status ?? "NEW");
  const [showStatusDrop, setShowStatusDrop] = useState(false);
  const [activities,     setActivities]     = useState<ActivityEntry[]>(INIT_ACTS);
  const [actText,        setActText]        = useState("");
  const [actType,        setActType]        = useState("note");
  const [phone,          setPhone]          = useState("089-123-4567");
  const [email,          setEmail]          = useState("customer@mail.com");
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [qName,          setQName]          = useState("");
  const [qValue,         setQValue]         = useState("");
  const [qProduct,       setQProduct]       = useState("");
  const [qProvince,      setQProvince]      = useState("");
  const [qNotes,         setQNotes]         = useState("");
  const [qSaved,         setQSaved]         = useState(false);
  const [editPhone,      setEditPhone]      = useState(false);
  const [editEmail,      setEditEmail]      = useState(false);

  if (!lead) {
    return (
      <div style={{ padding:40, textAlign:"center" }}>
        <p style={{ color:"#6b7280" }}>ไม่พบข้อมูลลีด</p>
        <Link href="/leads" style={{ color:PRIMARY, fontSize:"0.85rem" }}>← กลับ</Link>
      </div>
    );
  }

  const sc = STATUS_COLOR[status];
  const customer = lead.customerId ? customers.find(c => c.id === lead.customerId) : null;
  const relatedQuotations = lead.customerId ? quotations.filter(q => q.customerId === lead.customerId) : [];
  const relatedProjects = lead.customerId ? projects.filter(p => p.customerId === lead.customerId) : [];

  function addActivity() {
    if (!actText.trim()) return;
    setActivities(prev => [{
      id: Date.now(), date:"23 มิ.ย. 2569",
      text: actText.trim(), type: actType,
    }, ...prev]);
    setActText("");
  }

  return (
    <div style={{ maxWidth:1100 }}>
      {/* Back + Actions */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
        <Link href="/leads" style={{ fontSize:"0.82rem", color:PRIMARY, fontWeight:600, textDecoration:"none" }}>← กลับ</Link>
        <div style={{ display:"flex", gap:8 }}>
          <a href="/appointments"
            style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:10, border:`1px solid ${BORDER}`, background:"#fff", color:STEEL, fontSize:"0.78rem", fontWeight:600, textDecoration:"none" }}>
            <CalendarDays size={14}/> เพิ่มนัดหมาย
          </a>
          <button
            onClick={() => { setQName(lead.name); setQValue(lead.value); setQProduct(lead.product); setQProvince(lead.province); setQNotes(""); setQSaved(false); setShowQuoteModal(true); }}
            style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:10, background:PRIMARY, color:"#fff", fontSize:"0.78rem", fontWeight:700, border:"none", cursor:"pointer", boxShadow:"0 4px 12px rgba(0,51,102,.25)" }}>
            <FileText size={14}/> สร้างใบเสนอราคา
          </button>
        </div>
      </div>

      {/* Header */}
      <div style={{ ...CARD, padding:"20px 24px", marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
            <span style={{ fontSize:"0.72rem", fontWeight:700, color:"#6b7280", background:"#f0f0f5", borderRadius:8, padding:"4px 10px" }}>{lead.id}</span>
            <h1 style={{ fontSize:"1.4rem", fontWeight:800, color:STEEL, margin:0 }}>{lead.name}</h1>
            <div style={{ position:"relative" }}>
              <button onClick={() => setShowStatusDrop(p => !p)}
                style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 12px 4px 10px", borderRadius:99, fontSize:"0.72rem", fontWeight:700, background:sc.bg, color:sc.text, border:"none", cursor:"pointer" }}>
                {leadStatusLabel[status]} ▾
              </button>
              {showStatusDrop && (
                <>
                  <div onClick={() => setShowStatusDrop(false)} style={{ position:"fixed", inset:0, zIndex:9 }}/>
                  <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, zIndex:10, background:"#fff", border:`1px solid ${BORDER}`, borderRadius:12, boxShadow:"0 8px 24px rgba(0,51,102,.12)", minWidth:160, overflow:"hidden" }}>
                    {STATUS_ORDER.map(s => (
                      <button key={s} onClick={() => { setStatus(s); setShowStatusDrop(false); }}
                        style={{ display:"flex", alignItems:"center", gap:8, width:"100%", padding:"9px 14px", border:"none", background:s===status?"#f8f9fb":"transparent", cursor:"pointer", textAlign:"left" }}>
                        <span style={{ width:8, height:8, borderRadius:"50%", background:STATUS_COLOR[s].text, flexShrink:0 }}/>
                        <span style={{ fontSize:"0.78rem", color:s===status?PRIMARY:STEEL, fontWeight:s===status?700:400 }}>{leadStatusLabel[s]}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <div style={{ fontSize:"1.3rem", fontWeight:800, color:PRIMARY }}>{lead.value}</div>
        </div>
      </div>

      {/* Two columns */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
        {/* Left: Info */}
        <div style={{ ...CARD, padding:"20px 24px" }}>
          <div style={{ fontSize:"0.8rem", fontWeight:800, color:STEEL, marginBottom:14 }}>ข้อมูลลีด</div>
          <InfoRow label="จังหวัด" value={lead.province}/>
          <InfoRow label="สินค้า" value={
            <span style={{ background:"#dce5f0", color:PRIMARY, borderRadius:99, padding:"2px 10px", fontSize:"0.72rem", fontWeight:700 }}>{lead.product}</span>
          }/>
          <InfoRow label="มูลค่า" value={<span style={{ color:PRIMARY, fontWeight:700 }}>{lead.value}</span>}/>

          {/* Editable phone */}
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"1px solid #f0f4f8" }}>
            <span style={{ fontSize:"0.73rem", color:"#6b7280", fontWeight:600, minWidth:110 }}>โทรศัพท์</span>
            {editPhone ? (
              <div style={{ display:"flex", gap:6, flex:1 }}>
                <input value={phone} onChange={e => setPhone(e.target.value)} onKeyDown={e => e.key==="Enter"&&setEditPhone(false)}
                  style={{ flex:1, fontSize:"0.82rem", border:`1px solid ${BORDER}`, borderRadius:7, padding:"3px 8px", outline:"none", color:STEEL }}/>
                <button onClick={() => setEditPhone(false)}
                  style={{ padding:"3px 10px", borderRadius:7, border:"none", background:PRIMARY, color:"#fff", fontSize:"0.72rem", fontWeight:700, cursor:"pointer" }}>บันทึก</button>
              </div>
            ) : (
              <div style={{ display:"flex", alignItems:"center", gap:8, flex:1 }}>
                <span style={{ fontSize:"0.82rem", color:STEEL, fontWeight:500 }}>{phone}</span>
                <button onClick={() => setEditPhone(true)} style={{ fontSize:"0.67rem", color:"#9ca3af", background:"none", border:"none", cursor:"pointer" }}>แก้ไข</button>
                <a href={`tel:${phone}`} style={{ fontSize:"0.68rem", color:PRIMARY, background:"#dce5f0", borderRadius:99, padding:"2px 8px", fontWeight:600, textDecoration:"none", display:"inline-flex", alignItems:"center", gap:4 }}><Phone size={11}/> โทร</a>
              </div>
            )}
          </div>

          {/* Editable email */}
          <div style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"1px solid #f0f4f8" }}>
            <span style={{ fontSize:"0.73rem", color:"#6b7280", fontWeight:600, minWidth:110 }}>อีเมล</span>
            {editEmail ? (
              <div style={{ display:"flex", gap:6, flex:1 }}>
                <input value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key==="Enter"&&setEditEmail(false)}
                  style={{ flex:1, fontSize:"0.82rem", border:`1px solid ${BORDER}`, borderRadius:7, padding:"3px 8px", outline:"none", color:STEEL }}/>
                <button onClick={() => setEditEmail(false)}
                  style={{ padding:"3px 10px", borderRadius:7, border:"none", background:PRIMARY, color:"#fff", fontSize:"0.72rem", fontWeight:700, cursor:"pointer" }}>บันทึก</button>
              </div>
            ) : (
              <div style={{ display:"flex", alignItems:"center", gap:8, flex:1 }}>
                <span style={{ fontSize:"0.82rem", color:STEEL, fontWeight:500 }}>{email}</span>
                <button onClick={() => setEditEmail(true)} style={{ fontSize:"0.67rem", color:"#9ca3af", background:"none", border:"none", cursor:"pointer" }}>แก้ไข</button>
              </div>
            )}
          </div>

          {customer && (
            <div style={{ marginTop:16, paddingTop:16, borderTop:"1px solid #cfd4dc" }}>
              <Link href={`/customers/${customer.id}`}
                style={{ display:"inline-flex", alignItems:"center", gap:8, background:PRIMARY, color:"#fff", borderRadius:10, padding:"8px 16px", fontSize:"0.78rem", fontWeight:700, textDecoration:"none" }}>
                ดูโปรไฟล์ลูกค้า →
              </Link>
            </div>
          )}
        </div>

        {/* Right: Activity */}
        <div style={{ ...CARD, padding:"20px 24px" }}>
          <div style={{ fontSize:"0.8rem", fontWeight:800, color:STEEL, marginBottom:12 }}>ประวัติกิจกรรม</div>

          {/* Add activity */}
          <div style={{ marginBottom:16, padding:"12px 14px", background:"#f8f9fb", borderRadius:12, border:"1px solid #f0f0f5" }}>
            <div style={{ display:"flex", gap:6, marginBottom:8 }}>
              {ACT_TYPES.map(k => (
                <button key={k} onClick={() => setActType(k)}
                  style={{ width:30, height:30, borderRadius:8, border:actType===k?`2px solid ${PRIMARY}`:"1px solid #e2e8f0", background:actType===k?"#dce5f0":"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <ActivityIcon type={k}/>
                </button>
              ))}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <input value={actText} onChange={e => setActText(e.target.value)}
                onKeyDown={e => e.key==="Enter" && addActivity()}
                placeholder="บันทึกกิจกรรม..."
                style={{ flex:1, fontSize:"0.8rem", border:`1px solid ${BORDER}`, borderRadius:9, padding:"7px 12px", outline:"none", color:STEEL }}/>
              <button onClick={addActivity}
                style={{ padding:"7px 14px", borderRadius:9, border:"none", background:PRIMARY, color:"#fff", fontSize:"0.78rem", fontWeight:700, cursor:"pointer" }}>
                บันทึก
              </button>
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:0, maxHeight:260, overflowY:"auto" }}>
            {activities.map((a, i) => (
              <div key={a.id} style={{ display:"flex", gap:14, position:"relative", paddingBottom:i<activities.length-1?18:0 }}>
                {i < activities.length-1 && (
                  <div style={{ position:"absolute", left:14, top:30, bottom:0, width:2, background:"#cfd4dc" }}/>
                )}
                <div style={{ width:30, height:30, borderRadius:"50%", background:"#dce5f0", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, zIndex:1 }}>
                  <ActivityIcon type={a.type}/>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"0.82rem", color:STEEL, fontWeight:500, marginBottom:2 }}>{a.text}</div>
                  <div style={{ fontSize:"0.68rem", color:"#6b7280" }}>{a.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Quotations */}
      {relatedQuotations.length > 0 && (
        <div style={{ ...CARD, padding:"20px 24px", marginBottom:16 }}>
          <div style={{ fontSize:"0.8rem", fontWeight:800, color:STEEL, marginBottom:14 }}>ใบเสนอราคาที่เกี่ยวข้อง</div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:"1px solid #cfd4dc" }}>
                {["เลขที่","โครงการ","มูลค่า","สถานะ","วันที่"].map(h => (
                  <th key={h} style={{ fontSize:"0.65rem", fontWeight:700, color:"#6b7280", textTransform:"uppercase", padding:"8px 12px", textAlign:"left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {relatedQuotations.map(q => {
                const qc = quotationStatusColor[q.status];
                return (
                  <tr key={q.id} style={{ borderBottom:"1px solid #f0f4f8" }}>
                    <td style={{ padding:"9px 12px", fontSize:"0.78rem", fontWeight:700, color:STEEL }}>{q.id}</td>
                    <td style={{ padding:"9px 12px", fontSize:"0.78rem", color:"#6b7280" }}>{q.project}</td>
                    <td style={{ padding:"9px 12px", fontSize:"0.78rem", fontWeight:700, color:STEEL }}>{q.total}</td>
                    <td style={{ padding:"9px 12px" }}>
                      <span style={{ background:qc.bg, color:qc.text, borderRadius:99, padding:"2px 9px", fontSize:"0.68rem", fontWeight:700 }}>{quotationStatusLabel[q.status]}</span>
                    </td>
                    <td style={{ padding:"9px 12px", fontSize:"0.75rem", color:"#6b7280" }}>{q.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Quick Create Quotation Modal */}
      {showQuoteModal && (
        <>
          <div onClick={() => setShowQuoteModal(false)}
            style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", zIndex:100 }}/>
          <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", zIndex:101,
            background:"#fff", borderRadius:20, boxShadow:"0 20px 60px rgba(0,51,102,.22)",
            width:"100%", maxWidth:520, padding:"28px 32px" }}>
            {/* Modal header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:22 }}>
              <div>
                <div style={{ fontSize:"1rem", fontWeight:800, color:STEEL, display:"flex", alignItems:"center", gap:7 }}><FileText size={16}/> สร้างใบเสนอราคา</div>
                <div style={{ fontSize:"0.72rem", color:"#6b7280", marginTop:3 }}>จากลีด {lead.id} · {lead.company}</div>
              </div>
              <button onClick={() => setShowQuoteModal(false)}
                style={{ background:"none", border:"none", cursor:"pointer", color:"#9ca3af", fontSize:"1.2rem", lineHeight:1 }}>✕</button>
            </div>

            {qSaved ? (
              <div style={{ textAlign:"center", padding:"32px 0" }}>
                <div style={{ marginBottom:12, display:"flex", justifyContent:"center" }}><CheckCircle2 size={48} color="#15803d"/></div>
                <div style={{ fontSize:"1rem", fontWeight:700, color:"#15803d", marginBottom:6 }}>สร้างใบเสนอราคาสำเร็จ</div>
                <div style={{ fontSize:"0.78rem", color:"#6b7280", marginBottom:20 }}>ระบบบันทึก {qName} เรียบร้อยแล้ว</div>
                <button onClick={() => setShowQuoteModal(false)}
                  style={{ padding:"9px 28px", borderRadius:10, background:PRIMARY, color:"#fff", border:"none", fontWeight:700, fontSize:"0.82rem", cursor:"pointer" }}>
                  ปิด
                </button>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
                {/* Row 1: Project name */}
                <div>
                  <label style={{ fontSize:"0.72rem", fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>ชื่อโครงการ *</label>
                  <input value={qName} onChange={e => setQName(e.target.value)}
                    style={{ width:"100%", border:"1px solid #cfd4dc", borderRadius:10, padding:"9px 12px",
                      fontSize:"0.85rem", color:STEEL, outline:"none", boxSizing:"border-box" }}/>
                </div>

                {/* Row 2: Product + Province */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <div>
                    <label style={{ fontSize:"0.72rem", fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>ประเภทอาคาร</label>
                    <input value={qProduct} onChange={e => setQProduct(e.target.value)}
                      style={{ width:"100%", border:"1px solid #cfd4dc", borderRadius:10, padding:"9px 12px",
                        fontSize:"0.85rem", color:STEEL, outline:"none", boxSizing:"border-box" }}/>
                  </div>
                  <div>
                    <label style={{ fontSize:"0.72rem", fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>จังหวัด</label>
                    <input value={qProvince} onChange={e => setQProvince(e.target.value)}
                      style={{ width:"100%", border:"1px solid #cfd4dc", borderRadius:10, padding:"9px 12px",
                        fontSize:"0.85rem", color:STEEL, outline:"none", boxSizing:"border-box" }}/>
                  </div>
                </div>

                {/* Row 3: Estimated value */}
                <div>
                  <label style={{ fontSize:"0.72rem", fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>มูลค่าโครงการ (ประมาณการ)</label>
                  <input value={qValue} onChange={e => setQValue(e.target.value)}
                    style={{ width:"100%", border:"1px solid #cfd4dc", borderRadius:10, padding:"9px 12px",
                      fontSize:"0.85rem", color:STEEL, outline:"none", boxSizing:"border-box" }}/>
                </div>

                {/* Row 4: Notes */}
                <div>
                  <label style={{ fontSize:"0.72rem", fontWeight:700, color:"#374151", display:"block", marginBottom:5 }}>หมายเหตุ</label>
                  <textarea value={qNotes} onChange={e => setQNotes(e.target.value)} rows={3}
                    placeholder="รายละเอียดเพิ่มเติม เช่น ขนาดอาคาร, วัสดุ, เงื่อนไขพิเศษ..."
                    style={{ width:"100%", border:"1px solid #cfd4dc", borderRadius:10, padding:"9px 12px",
                      fontSize:"0.82rem", color:STEEL, outline:"none", resize:"vertical", fontFamily:"inherit", boxSizing:"border-box" }}/>
                </div>

                {/* Actions */}
                <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:4 }}>
                  <button onClick={() => setShowQuoteModal(false)}
                    style={{ padding:"9px 20px", borderRadius:10, border:"1px solid #cfd4dc", background:"#fff",
                      color:STEEL, fontSize:"0.82rem", fontWeight:600, cursor:"pointer" }}>
                    ยกเลิก
                  </button>
                  <button
                    onClick={() => {
                      if (!qName.trim()) return;
                      setActivities(prev => [{
                        id: Date.now(), date:"24 มิ.ย. 2569",
                        text:`สร้างใบเสนอราคา "${qName}" มูลค่า ${qValue}`, type:"doc",
                      }, ...prev]);
                      setQSaved(true);
                    }}
                    style={{ padding:"9px 24px", borderRadius:10, border:"none", background:PRIMARY,
                      color:"#fff", fontSize:"0.82rem", fontWeight:700, cursor:"pointer",
                      boxShadow:"0 4px 12px rgba(0,51,102,.25)" }}>
                    ✓ สร้างใบเสนอราคา
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Related Projects */}
      {relatedProjects.length > 0 && (
        <div style={{ ...CARD, padding:"20px 24px" }}>
          <div style={{ fontSize:"0.8rem", fontWeight:800, color:STEEL, marginBottom:14 }}>โครงการที่เกี่ยวข้อง</div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:"1px solid #cfd4dc" }}>
                {["ชื่อโครงการ","สถานะ","ความคืบหน้า","มูลค่า","กำหนดส่ง"].map(h => (
                  <th key={h} style={{ fontSize:"0.65rem", fontWeight:700, color:"#6b7280", textTransform:"uppercase", padding:"8px 12px", textAlign:"left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {relatedProjects.map(p => {
                const pc = projectStatusColor[p.status];
                return (
                  <tr key={p.id} style={{ borderBottom:"1px solid #f0f4f8", cursor:"pointer" }}
                    onClick={() => { window.location.href = `/projects/${p.id}`; }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f8f9fb"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}>
                    <td style={{ padding:"9px 12px", fontSize:"0.82rem", fontWeight:600, color:STEEL }}>{p.title}</td>
                    <td style={{ padding:"9px 12px" }}>
                      <span style={{ background:pc.bg, color:pc.text, borderRadius:99, padding:"2px 9px", fontSize:"0.68rem", fontWeight:700 }}>{projectStatusLabel[p.status]}</span>
                    </td>
                    <td style={{ padding:"9px 12px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:100 }}>
                        <div style={{ flex:1, height:5, background:"#f0f0f5", borderRadius:99, overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${p.progress}%`, background:p.progress===100?SUCCESS:PRIMARY, borderRadius:99 }}/>
                        </div>
                        <span style={{ fontSize:"0.68rem", color:"#6b7280", fontWeight:700 }}>{p.progress}%</span>
                      </div>
                    </td>
                    <td style={{ padding:"9px 12px", fontSize:"0.78rem", fontWeight:700, color:STEEL }}>{p.value}</td>
                    <td style={{ padding:"9px 12px", fontSize:"0.75rem", color:"#6b7280" }}>{p.due}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
