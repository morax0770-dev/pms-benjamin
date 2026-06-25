"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  customers, projects, quotations,
  projectStatusLabel, projectStatusColor,
  quotationStatusLabel, quotationStatusColor,
} from "@/lib/mock";

const CARD: React.CSSProperties = { background:"#fff", borderRadius:16, border:"1px solid #cfd4dc", boxShadow:"0 2px 14px rgba(0,51,102,.07)" };
const PRIMARY = "#003366"; const STEEL = "#2D2D2D"; const BORDER = "#cfd4dc";

const CONTACT_ICONS: Record<string,string> = { call:"📞", email:"📧", meeting:"🤝", visit:"📍", note:"📝" };

type ContactEntry = { id:number; date:string; icon:string; text:string; type:string };
const INIT_CONTACTS: ContactEntry[] = [
  { id:1, date:"20 มิ.ย. 2569", icon:"📞", text:"โทรติดตามสถานะโครงการ — ได้รับการยืนยัน", type:"call" },
  { id:2, date:"12 มิ.ย. 2569", icon:"📧", text:"ส่งอีเมลเอกสารสัญญาฉบับปรับปรุง", type:"email" },
  { id:3, date:"5 มิ.ย. 2569",  icon:"🤝", text:"ประชุมหน้างาน — ตกลงเงื่อนไขการส่งมอบ", type:"meeting" },
  { id:4, date:"28 พ.ค. 2569",  icon:"📄", text:"ส่งใบเสนอราคาเพิ่มเติม", type:"note" },
];

type TabKey = "projects" | "quotations" | "contacts";

type EditCustomer = { name:string; phone:string; email:string; province:string; company:string };

export default function CustomerDetailPage() {
  const params = useParams();
  const customerId = Number(params.id);
  const [tab, setTab]             = useState<TabKey>("projects");
  const [contacts, setContacts]   = useState<ContactEntry[]>(INIT_CONTACTS);
  const [contactText, setContactText] = useState("");
  const [contactType, setContactType] = useState("call");
  const [showEdit, setShowEdit]   = useState(false);

  const base = customers.find(c => c.id === customerId);
  const [editForm, setEditForm]   = useState<EditCustomer|null>(null);
  const [saved,    setSaved]      = useState<Partial<EditCustomer>>({});

  if (!base) {
    return (
      <div style={{ padding:40, textAlign:"center" }}>
        <p style={{ color:"#6b7280" }}>ไม่พบข้อมูลลูกค้า</p>
        <Link href="/customers" style={{ color:PRIMARY, fontSize:"0.85rem" }}>← กลับ</Link>
      </div>
    );
  }

  const customer = { ...base, ...saved };
  const relatedProjects   = projects.filter(p => p.customerId === customer.id);
  const relatedQuotations = quotations.filter(q => q.customerId === customer.id);
  const totalValue = relatedQuotations.reduce((s,q) => s + parseInt((q.total||"0").replace(/[^0-9]/g,"")||"0"), 0);

  const tabs: { key:TabKey; label:string }[] = [
    { key:"projects",   label:`โครงการ (${relatedProjects.length})`   },
    { key:"quotations", label:`ใบเสนอราคา (${relatedQuotations.length})` },
    { key:"contacts",   label:`การติดต่อ (${contacts.length})`       },
  ];

  function addContact() {
    if (!contactText.trim()) return;
    setContacts(prev => [{
      id:Date.now(), date:"23 มิ.ย. 2569",
      icon: CONTACT_ICONS[contactType] ?? "📝",
      text: contactText.trim(), type: contactType,
    }, ...prev]);
    setContactText("");
  }

  function openEdit() {
    setEditForm({ name:customer.name, phone:customer.phone, email:customer.email, province:customer.province, company:customer.company });
    setShowEdit(true);
  }

  function saveEdit() {
    if (editForm) { setSaved({ name:editForm.name, phone:editForm.phone, email:editForm.email, province:editForm.province, company:editForm.company }); }
    setShowEdit(false);
  }

  return (
    <div style={{ maxWidth:1100 }}>
      {/* Back */}
      <div style={{ marginBottom:18 }}>
        <Link href="/customers" style={{ fontSize:"0.82rem", color:PRIMARY, fontWeight:600, textDecoration:"none" }}>← กลับ</Link>
      </div>

      {/* Header card */}
      <div style={{ ...CARD, padding:"24px 28px", marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
          <div style={{ width:64, height:64, borderRadius:18, background:customer.color, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:"1.3rem", flexShrink:0 }}>
            {customer.initials}
          </div>
          <div style={{ flex:1 }}>
            <h1 style={{ fontSize:"1.4rem", fontWeight:800, color:STEEL, margin:"0 0 4px 0" }}>{customer.name}</h1>
            <div style={{ fontSize:"0.82rem", color:"#6b7280", marginBottom:8 }}>{customer.company}</div>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {customer.tags.map((tag:string) => (
                <span key={tag} style={{ padding:"3px 10px", borderRadius:99, fontSize:"0.68rem", fontWeight:700, background:tag==="VIP"?"#fef3cd":tag==="Enterprise"?"#dce5f0":"#f0f0f5", color:tag==="VIP"?"#f59e0b":tag==="Enterprise"?PRIMARY:"#6b7280" }}>
                  {tag}
                </span>
              ))}
              <span style={{ padding:"3px 10px", borderRadius:99, fontSize:"0.68rem", fontWeight:700, background:"#dce5f0", color:PRIMARY }}>{customer.category}</span>
            </div>
          </div>
          <button onClick={openEdit}
            style={{ padding:"8px 18px", borderRadius:10, border:`1px solid ${BORDER}`, background:"#fff", color:STEEL, fontSize:"0.78rem", fontWeight:600, cursor:"pointer", flexShrink:0 }}>
            แก้ไขข้อมูล
          </button>
        </div>

        {/* Info row */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px,1fr))", gap:12, marginTop:20, paddingTop:20, borderTop:"1px solid #cfd4dc" }}>
          {[
            { label:"โทรศัพท์", value:`📞 ${customer.phone}` },
            { label:"อีเมล",    value:`📧 ${customer.email}` },
            { label:"จังหวัด",  value:`📍 ${customer.province}` },
            { label:"มูลค่ารวม",value:`฿${totalValue.toLocaleString()}` },
          ].map(item => (
            <div key={item.label} style={{ background:"#f8f9fb", borderRadius:10, padding:"12px 14px", border:"1px solid #f0f0f5" }}>
              <div style={{ fontSize:"0.67rem", color:"#6b7280", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.05em", marginBottom:4 }}>{item.label}</div>
              <div style={{ fontSize:"0.82rem", color:STEEL, fontWeight:600 }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:2, marginBottom:16, background:"#f0f4f8", borderRadius:12, padding:4, width:"fit-content" }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{ padding:"8px 18px", borderRadius:9, border:"none", background:tab===t.key?"#fff":"transparent", color:tab===t.key?PRIMARY:"#6b7280", fontSize:"0.78rem", fontWeight:700, cursor:"pointer", boxShadow:tab===t.key?"0 1px 4px rgba(0,51,102,.12)":"none", transition:"all .12s", whiteSpace:"nowrap" }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Projects */}
      {tab === "projects" && (
        <div>
          {relatedProjects.length === 0 ? (
            <div style={{ ...CARD, padding:32, textAlign:"center", color:"#6b7280", fontSize:"0.82rem" }}>ยังไม่มีโครงการ</div>
          ) : (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:12 }}>
              {relatedProjects.map(p => {
                const pc = projectStatusColor[p.status];
                return (
                  <Link key={p.id} href={`/projects/${p.id}`} style={{ textDecoration:"none" }}>
                    <div style={{ ...CARD, padding:"18px 20px", cursor:"pointer", transition:"transform .12s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}>
                      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:10 }}>
                        <div style={{ fontSize:"0.88rem", fontWeight:700, color:STEEL, flex:1, marginRight:8 }}>{p.title}</div>
                        <span style={{ padding:"3px 9px", borderRadius:99, fontSize:"0.65rem", fontWeight:700, background:pc.bg, color:pc.text, whiteSpace:"nowrap" }}>{projectStatusLabel[p.status]}</span>
                      </div>
                      <div style={{ marginBottom:10 }}>
                        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                          <span style={{ fontSize:"0.68rem", color:"#6b7280" }}>ความคืบหน้า</span>
                          <span style={{ fontSize:"0.68rem", fontWeight:700, color:STEEL }}>{p.progress}%</span>
                        </div>
                        <div style={{ height:6, background:"#f0f0f5", borderRadius:99, overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${p.progress}%`, background:p.progress===100?"#22c55e":PRIMARY, borderRadius:99 }}/>
                        </div>
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between" }}>
                        <span style={{ fontSize:"0.78rem", fontWeight:700, color:PRIMARY }}>{p.value}</span>
                        <span style={{ fontSize:"0.72rem", color:"#6b7280" }}>ส่ง {p.due}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Quotations */}
      {tab === "quotations" && (
        <div style={CARD}>
          {relatedQuotations.length === 0 ? (
            <div style={{ padding:32, textAlign:"center", color:"#6b7280", fontSize:"0.82rem" }}>ยังไม่มีใบเสนอราคา</div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead>
                  <tr style={{ borderBottom:"1px solid #cfd4dc", background:"#f8f9fb" }}>
                    {["เลขที่ใบเสนอราคา","โครงการ","มูลค่า","สถานะ","วันที่"].map(h => (
                      <th key={h} style={{ fontSize:"0.67rem", fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.05em", padding:"10px 14px", textAlign:"left", whiteSpace:"nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {relatedQuotations.map(q => {
                    const qc = quotationStatusColor[q.status];
                    return (
                      <tr key={q.id} style={{ borderBottom:"1px solid #f0f4f8" }}>
                        <td style={{ padding:"11px 14px", fontSize:"0.82rem", fontWeight:700, color:STEEL }}>{q.id}</td>
                        <td style={{ padding:"11px 14px", fontSize:"0.78rem", color:"#6b7280" }}>{q.project}</td>
                        <td style={{ padding:"11px 14px", fontSize:"0.84rem", fontWeight:800, color:STEEL }}>{q.total}</td>
                        <td style={{ padding:"11px 14px" }}>
                          <span style={{ background:qc.bg, color:qc.text, borderRadius:99, padding:"3px 10px", fontSize:"0.68rem", fontWeight:700 }}>{quotationStatusLabel[q.status]}</span>
                        </td>
                        <td style={{ padding:"11px 14px", fontSize:"0.78rem", color:"#6b7280" }}>{q.date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Contact history */}
      {tab === "contacts" && (
        <div style={{ ...CARD, padding:"20px 24px" }}>
          {/* Add contact form */}
          <div style={{ marginBottom:18, padding:"14px 16px", background:"#f8f9fb", borderRadius:12, border:"1px solid #f0f0f5" }}>
            <div style={{ fontSize:"0.74rem", fontWeight:700, color:STEEL, marginBottom:10 }}>บันทึกการติดต่อใหม่</div>
            <div style={{ display:"flex", gap:6, marginBottom:8 }}>
              {Object.entries(CONTACT_ICONS).map(([k,icon]) => (
                <button key={k} onClick={() => setContactType(k)}
                  style={{ width:32, height:32, borderRadius:8, border:contactType===k?`2px solid ${PRIMARY}`:"1px solid #e2e8f0", background:contactType===k?"#dce5f0":"#fff", cursor:"pointer", fontSize:"0.9rem" }}>
                  {icon}
                </button>
              ))}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              <input value={contactText} onChange={e => setContactText(e.target.value)}
                onKeyDown={e => e.key==="Enter" && addContact()}
                placeholder="รายละเอียดการติดต่อ..."
                style={{ flex:1, fontSize:"0.82rem", border:`1px solid ${BORDER}`, borderRadius:9, padding:"8px 12px", outline:"none", color:STEEL }}/>
              <button onClick={addContact}
                style={{ padding:"8px 16px", borderRadius:9, border:"none", background:PRIMARY, color:"#fff", fontSize:"0.78rem", fontWeight:700, cursor:"pointer" }}>
                บันทึก
              </button>
            </div>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {contacts.map((a, i) => (
              <div key={a.id} style={{ display:"flex", gap:14, position:"relative", paddingBottom:i<contacts.length-1?20:0 }}>
                {i < contacts.length-1 && (
                  <div style={{ position:"absolute", left:14, top:30, bottom:0, width:2, background:"#cfd4dc" }}/>
                )}
                <div style={{ width:30, height:30, borderRadius:"50%", background:"#dce5f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.85rem", flexShrink:0, zIndex:1 }}>
                  {a.icon}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"0.84rem", color:STEEL, fontWeight:500, marginBottom:2 }}>{a.text}</div>
                  <div style={{ fontSize:"0.68rem", color:"#6b7280" }}>{a.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit modal */}
      {showEdit && editForm && (
        <>
          <div onClick={() => setShowEdit(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.3)", zIndex:200 }}/>
          <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", zIndex:201,
            ...CARD, padding:"24px 28px", width:420, boxShadow:"0 16px 48px rgba(0,51,102,.18)" }}>
            <div style={{ fontSize:"0.9rem", fontWeight:800, color:STEEL, marginBottom:18 }}>แก้ไขข้อมูลลูกค้า</div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {([
                { key:"name" as const,     label:"ชื่อ",       ph:"ชื่อลูกค้า" },
                { key:"company" as const,  label:"บริษัท",     ph:"ชื่อบริษัท" },
                { key:"phone" as const,    label:"โทรศัพท์",   ph:"08x-xxx-xxxx" },
                { key:"email" as const,    label:"อีเมล",      ph:"email@example.com" },
                { key:"province" as const, label:"จังหวัด",    ph:"จังหวัด" },
              ]).map(f => (
                <div key={f.key}>
                  <label style={{ fontSize:"0.72rem", fontWeight:700, color:"#6b7280", display:"block", marginBottom:5 }}>{f.label}</label>
                  <input value={editForm[f.key]} onChange={e => setEditForm(p => p?{...p,[f.key]:e.target.value}:null)}
                    placeholder={f.ph}
                    style={{ width:"100%", fontSize:"0.84rem", border:`1px solid ${BORDER}`, borderRadius:9, padding:"8px 12px", outline:"none", color:STEEL, boxSizing:"border-box" }}/>
                </div>
              ))}
              <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:4 }}>
                <button onClick={() => setShowEdit(false)}
                  style={{ padding:"8px 18px", borderRadius:9, border:`1px solid ${BORDER}`, background:"#fff", color:STEEL, fontSize:"0.78rem", fontWeight:600, cursor:"pointer" }}>ยกเลิก</button>
                <button onClick={saveEdit}
                  style={{ padding:"8px 22px", borderRadius:9, border:"none", background:PRIMARY, color:"#fff", fontSize:"0.78rem", fontWeight:700, cursor:"pointer" }}>บันทึก</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
