"use client";

import React, { useState } from "react";
import { Plus, X, ChevronDown, ChevronRight, Copy, Trash2, Play } from "lucide-react";

const PRIMARY = "#003366";
const STEEL   = "#2D2D2D";
const BORDER  = "#cfd4dc";
const MUTED   = "#6b7280";

type TemplateTask  = { id: number; text: string; };
type TemplateStage = { id: number; name: string; color: string; tasks: TemplateTask[]; };
type Template = {
  id: number; name: string; category: string; desc: string;
  color: string; stages: TemplateStage[];
};

const CAT_COLORS: Record<string, string> = {
  "โกดัง": "#4299e1", "โรงงาน": "#ed8936",
  "เกษตรกรรม": "#22c55e", "งานตามแบบ": "#0d9488",
};

const INIT_TEMPLATES: Template[] = [
  {
    id: 1, name: "โกดังสำเร็จรูปทั่วไป", category: "โกดัง", color: "#4299e1",
    desc: "แม่แบบสำหรับดีลโกดังสำเร็จรูปขนาดกลาง–ใหญ่ ครอบคลุมทุกขั้นตอนตั้งแต่ติดต่อจนปิดการขาย",
    stages: [
      { id: 1, name: "ติดต่อและสำรวจ", color: "#4299e1", tasks: [
        { id: 1, text: "โทรศัพท์ติดต่อผู้มีอำนาจตัดสินใจ" },
        { id: 2, text: "ส่งแคตตาล็อกสินค้า Benjamin" },
        { id: 3, text: "นัดเยี่ยมชมพื้นที่" },
        { id: 4, text: "สรุปความต้องการเบื้องต้น" },
      ]},
      { id: 2, name: "นำเสนอ Solution", color: "#ed8936", tasks: [
        { id: 5, text: "นำเสนอแบบโกดัง Easy Build" },
        { id: 6, text: "แสดง 3D Rendering" },
        { id: 7, text: "อธิบาย Spec และวัสดุ" },
        { id: 8, text: "เปรียบเทียบตัวเลือก" },
      ]},
      { id: 3, name: "เสนอราคา", color: "#f59e0b", tasks: [
        { id: 9,  text: "จัดทำ BOQ เบื้องต้น" },
        { id: 10, text: "สร้างใบเสนอราคาในระบบ" },
        { id: 11, text: "ส่งใบเสนอราคาให้ลูกค้า" },
      ]},
      { id: 4, name: "เจรจาปิดการขาย", color: "#22c55e", tasks: [
        { id: 12, text: "ติดตามผลใบเสนอราคา" },
        { id: 13, text: "เจรจาเงื่อนไขการชำระเงิน" },
        { id: 14, text: "เตรียมสัญญาและเซ็น" },
      ]},
    ],
  },
  {
    id: 2, name: "โรงงานอุตสาหกรรม PEB", category: "โรงงาน", color: "#ed8936",
    desc: "แม่แบบสำหรับดีลโรงงาน Pre-Engineered Building ขนาดใหญ่ เน้นการสำรวจพื้นที่และวิศวกรรม",
    stages: [
      { id: 1, name: "Qualify & สำรวจ", color: "#4299e1", tasks: [
        { id: 1, text: "ตรวจสอบคุณสมบัติลูกค้า" },
        { id: 2, text: "นัดประชุมทีมงานลูกค้า" },
        { id: 3, text: "สำรวจพื้นที่และรังวัด" },
      ]},
      { id: 2, name: "ออกแบบและนำเสนอ", color: "#ed8936", tasks: [
        { id: 4, text: "นำเสนอ Solution PEB" },
        { id: 5, text: "ออกแบบ Layout เบื้องต้น" },
        { id: 6, text: "คำนวณ Span & Load" },
        { id: 7, text: "นำเสนอวัสดุและ Spec" },
      ]},
      { id: 3, name: "ใบเสนอราคา", color: "#f59e0b", tasks: [
        { id: 8, text: "จัดทำ BOQ ละเอียด" },
        { id: 9, text: "ออกใบเสนอราคา" },
        { id: 10, text: "ส่งและติดตามผล" },
      ]},
      { id: 4, name: "ปิดการขาย", color: "#22c55e", tasks: [
        { id: 11, text: "เจรจาข้อสัญญา" },
        { id: 12, text: "ขออนุมัติสัญญา" },
        { id: 13, text: "เซ็นสัญญาและรับมัดจำ" },
      ]},
    ],
  },
  {
    id: 3, name: "อาคารเกษตรกรรม", category: "เกษตรกรรม", color: "#22c55e",
    desc: "แม่แบบสำหรับดีลอาคารเกษตรกรรม โรงเรือน คลังเก็บผลผลิต ขั้นตอนกระชับเน้นความคุ้มค่า",
    stages: [
      { id: 1, name: "ติดต่อ & ประเมิน", color: "#4299e1", tasks: [
        { id: 1, text: "ติดต่อเกษตรกร/สหกรณ์" },
        { id: 2, text: "ประเมินพื้นที่และความต้องการ" },
        { id: 3, text: "แนะนำโซลูชันที่เหมาะสม" },
        { id: 4, text: "ส่งข้อมูลเปรียบเทียบราคา" },
      ]},
      { id: 2, name: "เสนอราคา", color: "#f59e0b", tasks: [
        { id: 5, text: "คำนวณราคาเบื้องต้น" },
        { id: 6, text: "ออกใบเสนอราคา" },
        { id: 7, text: "อธิบาย Spec วัสดุ" },
      ]},
      { id: 3, name: "ปิดการขาย", color: "#22c55e", tasks: [
        { id: 8,  text: "เจรจาเงื่อนไขการชำระเงิน" },
        { id: 9,  text: "เตรียมสัญญา" },
        { id: 10, text: "เซ็นสัญญา" },
      ]},
    ],
  },
  {
    id: 4, name: "งานตามแบบพิเศษ", category: "งานตามแบบ", color: "#0d9488",
    desc: "แม่แบบยืดหยุ่นสำหรับงานก่อสร้างตามแบบพิเศษที่มีความซับซ้อนสูง",
    stages: [
      { id: 1, name: "รับ Brief & วิเคราะห์", color: "#4299e1", tasks: [
        { id: 1, text: "รับ Brief จากลูกค้า" },
        { id: 2, text: "วิเคราะห์ความเป็นไปได้" },
        { id: 3, text: "ประสาน Technical Team" },
      ]},
      { id: 2, name: "ออกแบบและนำเสนอ", color: "#ed8936", tasks: [
        { id: 4, text: "ออกแบบ Concept" },
        { id: 5, text: "นำเสนอ Design ให้ลูกค้า" },
        { id: 6, text: "แก้ไขตาม Feedback" },
        { id: 7, text: "อนุมัติ Design สุดท้าย" },
      ]},
      { id: 3, name: "เสนอราคา", color: "#f59e0b", tasks: [
        { id: 8,  text: "จัดทำ BOQ ละเอียด" },
        { id: 9,  text: "ออกใบเสนอราคา" },
        { id: 10, text: "นำเสนอใบเสนอราคา" },
        { id: 11, text: "ตอบคำถาม Technical" },
      ]},
      { id: 4, name: "ปิดการขาย", color: "#22c55e", tasks: [
        { id: 12, text: "เจรจาสัญญา" },
        { id: 13, text: "ขออนุมัติและเซ็นสัญญา" },
        { id: 14, text: "รับเงินมัดจำ" },
        { id: 15, text: "ส่งมอบแผนงาน" },
      ]},
    ],
  },
];

function AddTemplateModal({ onSave, onClose }: { onSave:(t:Template)=>void; onClose:()=>void }) {
  const [name, setName] = useState("");
  const [cat,  setCat]  = useState("โกดัง");
  const [desc, setDesc] = useState("");
  const INP: React.CSSProperties = { width:"100%",border:`1px solid ${BORDER}`,borderRadius:8,padding:"8px 10px",fontSize:"0.82rem",outline:"none",boxSizing:"border-box",color:STEEL };
  const LBL: React.CSSProperties = { fontSize:"0.67rem",fontWeight:700,color:MUTED,display:"block",marginBottom:4 };
  function save(){
    if(!name.trim()) return;
    const t: Template = {
      id: Date.now(), name: name.trim(), category: cat,
      color: CAT_COLORS[cat]??"#4299e1", desc: desc.trim(),
      stages: [{ id:1, name:"ติดต่อครั้งแรก", color:"#4299e1", tasks:[{id:1,text:"งานแรก"}] }],
    };
    onSave(t); onClose();
  }
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(45,45,45,.4)",zIndex:200}}/>
      <div style={{position:"fixed",inset:0,zIndex:210,display:"flex",alignItems:"center",justifyContent:"center",padding:24,pointerEvents:"none"}}>
        <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:18,border:`1px solid ${BORDER}`,width:"100%",maxWidth:420,pointerEvents:"auto",overflow:"hidden",boxShadow:"0 24px 80px rgba(0,51,102,.2)"}}>
          <div style={{background:PRIMARY,padding:"16px 20px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <span style={{fontSize:"0.9rem",fontWeight:800,color:"#fff"}}>สร้างแม่แบบใหม่</span>
            <button onClick={onClose} style={{width:28,height:28,borderRadius:8,border:"1px solid rgba(255,255,255,.2)",background:"rgba(255,255,255,.1)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={13}/></button>
          </div>
          <div style={{padding:"20px",display:"flex",flexDirection:"column",gap:12}}>
            <div><label style={LBL}>ชื่อแม่แบบ</label><input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="เช่น โกดังขนาดกลาง" style={INP}/></div>
            <div><label style={LBL}>ประเภทลูกค้าเป้าหมาย</label>
              <select value={cat} onChange={e=>setCat(e.target.value)} style={INP}>
                {Object.keys(CAT_COLORS).map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label style={LBL}>คำอธิบาย</label>
              <textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={3} placeholder="อธิบายแม่แบบนี้..." style={{...INP,resize:"vertical"}}/>
            </div>
          </div>
          <div style={{padding:"12px 20px",borderTop:`1px solid ${BORDER}`,display:"flex",gap:8,justifyContent:"flex-end",background:"#fafafa"}}>
            <button onClick={onClose} style={{padding:"8px 16px",borderRadius:8,border:`1px solid ${BORDER}`,background:"#fff",color:STEEL,fontSize:"0.78rem",fontWeight:600,cursor:"pointer"}}>ยกเลิก</button>
            <button onClick={save} style={{padding:"8px 20px",borderRadius:8,border:"none",background:PRIMARY,color:"#fff",fontSize:"0.78rem",fontWeight:700,cursor:"pointer"}}>สร้าง</button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>(INIT_TEMPLATES);
  const [expanded,  setExpanded]  = useState<Set<number>>(new Set([1]));
  const [addModal,  setAddModal]  = useState(false);
  const [toast,     setToast]     = useState("");

  function toggleExpand(id: number) {
    setExpanded(prev => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  function dupTemplate(t: Template) {
    const copy: Template = { ...t, id: Date.now(), name: `${t.name} (สำเนา)` };
    setTemplates(ts => [...ts, copy]);
    showToast("คัดลอกแม่แบบแล้ว");
  }

  function delTemplate(id: number) { setTemplates(ts => ts.filter(t => t.id !== id)); }

  function applyTemplate(t: Template) { showToast(`เปิดดีลใหม่ด้วยแม่แบบ "${t.name}" แล้ว`); }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  }

  const totalTasks = templates.reduce((s, t) => s + t.stages.reduce((ss, st) => ss + st.tasks.length, 0), 0);
  const avgStages  = templates.length > 0 ? (templates.reduce((s, t) => s + t.stages.length, 0) / templates.length).toFixed(1) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: STEEL, color: "#fff", padding: "10px 20px", borderRadius: 10, fontSize: "0.8rem", fontWeight: 600, zIndex: 9999, boxShadow: "0 4px 20px rgba(0,0,0,.25)" }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: "1.55rem", fontWeight: 800, color: STEEL, margin: 0 }}>แม่แบบการทำงาน</h1>
          <div style={{ fontSize: "0.76rem", color: MUTED, marginTop: 4 }}>ขั้นตอนและงานสำเร็จรูปสำหรับแต่ละประเภทดีล</div>
        </div>
        <button onClick={() => setAddModal(true)}
          style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: PRIMARY, color: "#fff", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, boxShadow: "0 4px 10px rgba(0,51,102,.22)" }}>
          <Plus size={13} /> สร้างแม่แบบ
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        {[
          { label: "แม่แบบทั้งหมด",     value: `${templates.length} แม่แบบ`, color: PRIMARY },
          { label: "ขั้นตอนเฉลี่ย",       value: `${avgStages} ขั้นตอน`,       color: STEEL },
          { label: "จำนวนงานรวม",         value: `${totalTasks} งาน`,           color: "#0d9488" },
        ].map((s, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 12, border: `1px solid ${BORDER}`, padding: "10px 16px" }}>
            <div style={{ fontSize: "0.63rem", color: MUTED, fontWeight: 600, marginBottom: 3 }}>{s.label}</div>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Template cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
        {templates.map(t => {
          const isOpen   = expanded.has(t.id);
          const taskCnt  = t.stages.reduce((s, st) => s + st.tasks.length, 0);
          const catColor = CAT_COLORS[t.category] ?? "#4299e1";
          return (
            <div key={t.id} style={{ background: "#fff", borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden", boxShadow: "0 1px 8px rgba(0,51,102,.05)", display: "flex", flexDirection: "column" }}>
              {/* Card header */}
              <div style={{ borderBottom: `3px solid ${catColor}`, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                      <span style={{ padding: "2px 9px", borderRadius: 99, fontSize: "0.6rem", fontWeight: 700, background: catColor + "18", color: catColor }}>{t.category}</span>
                    </div>
                    <div style={{ fontSize: "1rem", fontWeight: 800, color: STEEL, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name}</div>
                    <div style={{ fontSize: "0.73rem", color: MUTED, lineHeight: 1.5 }}>{t.desc}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 14, marginTop: 10 }}>
                  <div style={{ fontSize: "0.65rem", color: MUTED }}><span style={{ fontWeight: 700, color: STEEL }}>{t.stages.length}</span> ขั้นตอน</div>
                  <div style={{ fontSize: "0.65rem", color: MUTED }}><span style={{ fontWeight: 700, color: STEEL }}>{taskCnt}</span> งาน</div>
                </div>
              </div>

              {/* Stage pipeline preview */}
              <div style={{ padding: "10px 14px", background: "#fafbfc", borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ display: "flex", gap: 4, alignItems: "center", flexWrap: "wrap" }}>
                  {t.stages.map((s, i) => (
                    <React.Fragment key={s.id}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                        <span style={{ fontSize: "0.64rem", fontWeight: 600, color: STEEL, whiteSpace: "nowrap" }}>{s.name}</span>
                        <span style={{ fontSize: "0.58rem", color: MUTED }}>({s.tasks.length})</span>
                      </div>
                      {i < t.stages.length - 1 && <span style={{ color: "#d1d5db", fontSize: "0.6rem" }}>›</span>}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Expanded task list */}
              {isOpen && (
                <div style={{ padding: "10px 14px", background: "#fff", borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {t.stages.map(stage => (
                      <div key={stage.id}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: stage.color }} />
                          <span style={{ fontSize: "0.72rem", fontWeight: 700, color: STEEL }}>{stage.name}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingLeft: 12 }}>
                          {stage.tasks.map(task => (
                            <div key={task.id} style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
                              <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#d1d5db", marginTop: 5, flexShrink: 0 }} />
                              <span style={{ fontSize: "0.71rem", color: MUTED, lineHeight: 1.45 }}>{task.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Footer actions */}
              <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
                <button onClick={() => toggleExpand(t.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: PRIMARY, fontSize: "0.7rem", fontWeight: 600, padding: "4px 0" }}>
                  {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  {isOpen ? "ซ่อนรายละเอียด" : "ดูรายละเอียด"}
                </button>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => dupTemplate(t)} title="คัดลอก"
                    style={{ padding: "5px 10px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.68rem", color: MUTED, fontWeight: 600 }}>
                    <Copy size={11} /> คัดลอก
                  </button>
                  <button onClick={() => delTemplate(t.id)} title="ลบ"
                    style={{ padding: "5px 10px", borderRadius: 8, border: "1px solid #fde8eb", background: "#fff5f6", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.68rem", color: "#f04d6a", fontWeight: 600 }}>
                    <Trash2 size={11} />
                  </button>
                  <button onClick={() => applyTemplate(t)}
                    style={{ padding: "5px 12px", borderRadius: 8, border: "none", background: PRIMARY, color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontSize: "0.68rem", fontWeight: 700 }}>
                    <Play size={11} /> ใช้แม่แบบ
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {addModal && <AddTemplateModal onSave={t => setTemplates(ts => [...ts, t])} onClose={() => setAddModal(false)} />}
    </div>
  );
}
