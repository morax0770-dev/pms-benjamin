"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, ChevronDown, ChevronRight, Copy, Trash2, Play, CheckCircle2, ArrowRight } from "lucide-react";
import { leads } from "@/lib/mock";

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
type CreatedTask = { stage: string; stageColor: string; text: string; };

const CAT_COLORS: Record<string, string> = {
  "โกดังสินค้า":     "#4299e1",
  "อาคารโรงงาน":    "#ed8936",
  "อาคารสำเร็จรูป": "#003366",
  "อาคารสำนักงาน":  "#0d9488",
  "อาคารเชิงพาณิชย์": "#f59e0b",
  "สนามกีฬาในร่ม":  "#22c55e",
};

const OWNERS = ["สมชาย", "วิภา", "วิชัย", "กาญจนา", "ประสิทธิ์", "สุดาวรรณ"];

const INIT_TEMPLATES: Template[] = [
  {
    id: 1, name: "โกดังสินค้าสำเร็จรูป", category: "โกดังสินค้า", color: "#4299e1",
    desc: "แม่แบบสำหรับดีลโกดังสำเร็จรูปขนาดกลาง–ใหญ่ ครอบคลุมทุกขั้นตอนตั้งแต่ติดต่อจนปิดการขาย",
    stages: [
      { id: 1, name: "ติดต่อและสำรวจ", color: "#4299e1", tasks: [
        { id: 1, text: "โทรศัพท์ติดต่อผู้มีอำนาจตัดสินใจ" },
        { id: 2, text: "ส่งแคตตาล็อกสินค้า Benjamin" },
        { id: 3, text: "นัดเยี่ยมชมพื้นที่" },
        { id: 4, text: "สรุปความต้องการเบื้องต้น" },
      ]},
      { id: 2, name: "นำเสนอ Solution", color: "#ed8936", tasks: [
        { id: 5, text: "นำเสนอแบบโกดังสินค้า Benjamin" },
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
    id: 2, name: "อาคารโรงงาน PEB", category: "อาคารโรงงาน", color: "#ed8936",
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
    id: 3, name: "อาคารสำเร็จรูปมาตรฐาน", category: "อาคารสำเร็จรูป", color: "#003366",
    desc: "แม่แบบสำหรับดีลอาคารสำเร็จรูปสายการผลิตมาตรฐาน Benjamin ติดตั้งเร็ว ราคาคุ้มค่า",
    stages: [
      { id: 1, name: "ติดต่อและนัดดูงาน", color: "#4299e1", tasks: [
        { id: 1, text: "ติดต่อและคัดกรองลูกค้า" },
        { id: 2, text: "นัดชมตัวอย่างอาคารสำเร็จรูป" },
        { id: 3, text: "อธิบายข้อดีและระยะเวลาติดตั้ง" },
      ]},
      { id: 2, name: "กำหนด Spec", color: "#ed8936", tasks: [
        { id: 4, text: "เลือก Model และขนาด" },
        { id: 5, text: "กำหนด Option เสริม" },
        { id: 6, text: "ยืนยัน Layout กับลูกค้า" },
      ]},
      { id: 3, name: "เสนอราคาและปิดการขาย", color: "#f59e0b", tasks: [
        { id: 7, text: "ออกใบเสนอราคา" },
        { id: 8, text: "ชี้แจงเงื่อนไขการชำระเงิน" },
        { id: 9, text: "เจรจาและปิดดีล" },
        { id: 10, text: "เซ็นสัญญาและรับมัดจำ" },
      ]},
    ],
  },
  {
    id: 4, name: "อาคารสำนักงานพาณิชย์", category: "อาคารสำนักงาน", color: "#0d9488",
    desc: "แม่แบบสำหรับดีลอาคารสำนักงาน เน้น Fit-out และระบบ M&E ครบถ้วน เหมาะกับลูกค้าองค์กร",
    stages: [
      { id: 1, name: "รับ Brief & วิเคราะห์", color: "#4299e1", tasks: [
        { id: 1, text: "รับ Brief ความต้องการสำนักงาน" },
        { id: 2, text: "วิเคราะห์จำนวนผู้ใช้งาน" },
        { id: 3, text: "ประเมิน Load ระบบไฟฟ้าและน้ำ" },
        { id: 4, text: "ประสานทีมออกแบบ" },
      ]},
      { id: 2, name: "ออกแบบและนำเสนอ", color: "#ed8936", tasks: [
        { id: 5, text: "ออกแบบ Floor Plan" },
        { id: 6, text: "นำเสนอ 3D Interior" },
        { id: 7, text: "เลือกวัสดุตกแต่งและ Fit-out" },
        { id: 8, text: "แก้ไขตาม Feedback" },
      ]},
      { id: 3, name: "เสนอราคา", color: "#f59e0b", tasks: [
        { id: 9,  text: "จัดทำ BOQ งานระบบ" },
        { id: 10, text: "ออกใบเสนอราคารวม" },
        { id: 11, text: "ตอบคำถาม Technical" },
      ]},
      { id: 4, name: "ปิดการขาย", color: "#22c55e", tasks: [
        { id: 12, text: "เจรจาสัญญา" },
        { id: 13, text: "ขออนุมัติและเซ็นสัญญา" },
        { id: 14, text: "รับเงินมัดจำ" },
      ]},
    ],
  },
  {
    id: 5, name: "อาคารเชิงพาณิชย์ Strip Mall", category: "อาคารเชิงพาณิชย์", color: "#f59e0b",
    desc: "แม่แบบสำหรับดีลอาคารพาณิชย์หลายคูหา เน้นการออกแบบหน้าร้านและระบบสาธารณูปโภค",
    stages: [
      { id: 1, name: "สำรวจและประเมินทำเล", color: "#4299e1", tasks: [
        { id: 1, text: "สำรวจทำเลและโซนนิ่ง" },
        { id: 2, text: "ประเมินจำนวนคูหาและขนาด" },
        { id: 3, text: "ตรวจสอบข้อกำหนดท้องถิ่น" },
      ]},
      { id: 2, name: "ออกแบบและนำเสนอ", color: "#ed8936", tasks: [
        { id: 4, text: "ออกแบบ Facade และผังพื้น" },
        { id: 5, text: "นำเสนอ Rendering" },
        { id: 6, text: "วางแผนระบบไฟฟ้า ประปา" },
        { id: 7, text: "แก้ไขตาม Feedback" },
      ]},
      { id: 3, name: "เสนอราคา", color: "#f59e0b", tasks: [
        { id: 8, text: "ออกใบเสนอราคา" },
        { id: 9, text: "อธิบาย Phased Payment" },
        { id: 10, text: "ส่งใบเสนอราคา" },
      ]},
      { id: 4, name: "ปิดดีล", color: "#22c55e", tasks: [
        { id: 11, text: "เจรจาและปรับเงื่อนไข" },
        { id: 12, text: "เซ็นสัญญา" },
        { id: 13, text: "รับมัดจำและส่งมอบแผนงาน" },
      ]},
    ],
  },
  {
    id: 6, name: "สนามกีฬาในร่ม", category: "สนามกีฬาในร่ม", color: "#22c55e",
    desc: "แม่แบบสำหรับดีลสนามกีฬาในร่ม โครงสร้าง Space Frame / หลังคากว้าง เน้นคุณภาพวัสดุ",
    stages: [
      { id: 1, name: "ศึกษาและสำรวจ", color: "#4299e1", tasks: [
        { id: 1, text: "รับ Brief ประเภทกีฬาและขนาด" },
        { id: 2, text: "สำรวจพื้นที่และดินรองรับ" },
        { id: 3, text: "ตรวจสอบมาตรฐานกีฬาที่เกี่ยวข้อง" },
        { id: 4, text: "ประสาน Technical & วิศวกร" },
      ]},
      { id: 2, name: "ออกแบบและนำเสนอ", color: "#ed8936", tasks: [
        { id: 5, text: "ออกแบบโครงสร้างหลังคา" },
        { id: 6, text: "เลือกวัสดุพื้น / ผนัง / แสงสว่าง" },
        { id: 7, text: "นำเสนอ 3D และ Rendering" },
        { id: 8, text: "แก้ไขตาม Feedback" },
      ]},
      { id: 3, name: "เสนอราคา", color: "#f59e0b", tasks: [
        { id: 9,  text: "จัดทำ BOQ ละเอียด" },
        { id: 10, text: "ออกใบเสนอราคา" },
        { id: 11, text: "ชี้แจง Spec และการรับประกัน" },
      ]},
      { id: 4, name: "ปิดการขาย", color: "#22c55e", tasks: [
        { id: 12, text: "เจรจาสัญญา" },
        { id: 13, text: "ขออนุมัติและเซ็นสัญญา" },
        { id: 14, text: "รับมัดจำและเริ่มโครงการ" },
      ]},
    ],
  },
];

// ── Apply Modal ──────────────────────────────────────────────────
function ApplyModal({
  template, onClose,
}: {
  template: Template;
  onClose: () => void;
}) {
  const router = useRouter();
  const [leadId,    setLeadId]    = useState<string>("");
  const [assignee,  setAssignee]  = useState(OWNERS[0]);
  const [confirmed, setConfirmed] = useState(false);
  const [createdTasks, setCreatedTasks] = useState<CreatedTask[]>([]);

  const INP: React.CSSProperties = {
    width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8,
    padding: "8px 10px", fontSize: "0.82rem", outline: "none",
    boxSizing: "border-box", color: STEEL, background: "#fff",
  };
  const LBL: React.CSSProperties = {
    fontSize: "0.67rem", fontWeight: 700, color: MUTED,
    display: "block", marginBottom: 4,
  };

  const selectedLead = leads.find(l => l.id === leadId);
  const totalTasks = template.stages.reduce((s, st) => s + st.tasks.length, 0);

  function confirm() {
    if (!leadId) return;
    const tasks: CreatedTask[] = template.stages.flatMap(st =>
      st.tasks.map(t => ({ stage: st.name, stageColor: st.color, text: t.text }))
    );
    setCreatedTasks(tasks);
    setConfirmed(true);
  }

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(45,45,45,.45)", zIndex: 200 }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 210, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, pointerEvents: "none" }}>
        <div onClick={e => e.stopPropagation()} style={{
          background: "#fff", borderRadius: 18, border: `1px solid ${BORDER}`,
          width: "100%", maxWidth: confirmed ? 520 : 440,
          pointerEvents: "auto", overflow: "hidden",
          boxShadow: "0 24px 80px rgba(0,51,102,.2)",
          maxHeight: "90vh", display: "flex", flexDirection: "column",
        }}>

          {/* Header */}
          <div style={{ background: PRIMARY, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <div>
              <div style={{ fontSize: "0.9rem", fontWeight: 800, color: "#fff" }}>
                {confirmed ? "สร้างงานสำเร็จ" : `ใช้แม่แบบ "${template.name}"`}
              </div>
              {!confirmed && (
                <div style={{ fontSize: "0.65rem", color: "rgba(255,255,255,.6)", marginTop: 2 }}>
                  จะสร้าง {totalTasks} งานอัตโนมัติสำหรับลีดที่เลือก
                </div>
              )}
            </div>
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.1)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={13} />
            </button>
          </div>

          {/* Body */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {!confirmed ? (
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Lead selector */}
                <div>
                  <label style={LBL}>เลือกลีด <span style={{ color: "#f04d6a" }}>*</span></label>
                  <select
                    value={leadId}
                    onChange={e => setLeadId(e.target.value)}
                    style={INP}
                  >
                    <option value="">— เลือกลีด —</option>
                    {leads
                      .filter(l => l.status !== "PAID" && l.status !== "CANCELLED")
                      .map(l => (
                        <option key={l.id} value={l.id}>
                          {l.company} — {l.product} ({l.value})
                        </option>
                      ))}
                  </select>
                  {selectedLead && (
                    <div style={{ marginTop: 6, padding: "8px 10px", borderRadius: 8, background: "#f0f9ff", border: "1px solid #bae6fd", fontSize: "0.73rem", color: "#0369a1" }}>
                      ผู้ติดต่อ: <strong>{selectedLead.contact}</strong> · สถานะ: {selectedLead.status}
                    </div>
                  )}
                </div>

                {/* Assignee */}
                <div>
                  <label style={LBL}>มอบหมายให้</label>
                  <select value={assignee} onChange={e => setAssignee(e.target.value)} style={INP}>
                    {OWNERS.map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>

                {/* Preview */}
                <div>
                  <label style={LBL}>งานที่จะสร้าง ({totalTasks} งาน)</label>
                  <div style={{ borderRadius: 8, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
                    {template.stages.map((st, i) => (
                      <div key={st.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${BORDER}` }}>
                        <div style={{ padding: "7px 12px", background: "#f8f9fb", display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 7, height: 7, borderRadius: "50%", background: st.color }} />
                          <span style={{ fontSize: "0.7rem", fontWeight: 700, color: STEEL }}>{st.name}</span>
                          <span style={{ fontSize: "0.62rem", color: MUTED, marginLeft: "auto" }}>{st.tasks.length} งาน</span>
                        </div>
                        <div style={{ padding: "6px 12px 8px 28px", display: "flex", flexDirection: "column", gap: 3 }}>
                          {st.tasks.map(t => (
                            <div key={t.id} style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: "0.71rem", color: MUTED }}>
                              <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#d1d5db", marginTop: 5, flexShrink: 0 }} />
                              {t.text}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Success state */
              <div style={{ padding: "20px" }}>
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <CheckCircle2 size={40} style={{ color: "#22c55e", margin: "0 auto 8px" }} />
                  <div style={{ fontSize: "1rem", fontWeight: 800, color: STEEL }}>
                    สร้าง {createdTasks.length} งานสำเร็จ
                  </div>
                  <div style={{ fontSize: "0.75rem", color: MUTED, marginTop: 4 }}>
                    สำหรับลีด <strong style={{ color: STEEL }}>{selectedLead?.company}</strong> · มอบหมายให้ <strong style={{ color: STEEL }}>{assignee}</strong>
                  </div>
                </div>

                <div style={{ borderRadius: 10, border: `1px solid ${BORDER}`, overflow: "hidden", maxHeight: 280, overflowY: "auto" }}>
                  {template.stages.map((st, i) => (
                    <div key={st.id} style={{ borderTop: i === 0 ? "none" : `1px solid ${BORDER}` }}>
                      <div style={{ padding: "7px 12px", background: "#f8f9fb", display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: st.color }} />
                        <span style={{ fontSize: "0.7rem", fontWeight: 700, color: STEEL }}>{st.name}</span>
                      </div>
                      <div style={{ padding: "6px 12px 8px" }}>
                        {st.tasks.map(t => (
                          <div key={t.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderBottom: "1px solid #f0f4f8" }}>
                            <CheckCircle2 size={13} style={{ color: "#22c55e", flexShrink: 0 }} />
                            <span style={{ fontSize: "0.72rem", color: STEEL }}>{t.text}</span>
                            <span style={{ marginLeft: "auto", fontSize: "0.62rem", color: MUTED, whiteSpace: "nowrap" }}>{assignee}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: "12px 20px", borderTop: `1px solid ${BORDER}`, display: "flex", gap: 8, justifyContent: "flex-end", background: "#fafafa", flexShrink: 0 }}>
            {!confirmed ? (
              <>
                <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", color: STEEL, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>
                  ยกเลิก
                </button>
                <button
                  onClick={confirm}
                  disabled={!leadId}
                  style={{
                    padding: "8px 20px", borderRadius: 8, border: "none",
                    background: leadId ? PRIMARY : "#d1d5db",
                    color: "#fff", fontSize: "0.78rem", fontWeight: 700,
                    cursor: leadId ? "pointer" : "not-allowed",
                  }}
                >
                  สร้างงานทั้งหมด
                </button>
              </>
            ) : (
              <>
                <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", color: STEEL, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>
                  ปิด
                </button>
                <button
                  onClick={() => router.push("/tasks")}
                  style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: PRIMARY, color: "#fff", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                >
                  ดูงานทั้งหมด <ArrowRight size={13} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Add Template Modal ────────────────────────────────────────────
function AddTemplateModal({ onSave, onClose }: { onSave: (t: Template) => void; onClose: () => void }) {
  const [name, setName] = useState("");
  const [cat,  setCat]  = useState("โกดังสินค้า");
  const [desc, setDesc] = useState("");
  const INP: React.CSSProperties = { width: "100%", border: `1px solid ${BORDER}`, borderRadius: 8, padding: "8px 10px", fontSize: "0.82rem", outline: "none", boxSizing: "border-box", color: STEEL };
  const LBL: React.CSSProperties = { fontSize: "0.67rem", fontWeight: 700, color: MUTED, display: "block", marginBottom: 4 };
  function save() {
    if (!name.trim()) return;
    const t: Template = {
      id: Date.now(), name: name.trim(), category: cat,
      color: CAT_COLORS[cat] ?? "#4299e1", desc: desc.trim(),
      stages: [{ id: 1, name: "ติดต่อครั้งแรก", color: "#4299e1", tasks: [{ id: 1, text: "งานแรก" }] }],
    };
    onSave(t); onClose();
  }
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(45,45,45,.4)", zIndex: 200 }} />
      <div style={{ position: "fixed", inset: 0, zIndex: 210, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, pointerEvents: "none" }}>
        <div onClick={e => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, border: `1px solid ${BORDER}`, width: "100%", maxWidth: 420, pointerEvents: "auto", overflow: "hidden", boxShadow: "0 24px 80px rgba(0,51,102,.2)" }}>
          <div style={{ background: PRIMARY, padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "#fff" }}>สร้างแม่แบบใหม่</span>
            <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid rgba(255,255,255,.2)", background: "rgba(255,255,255,.1)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={13} /></button>
          </div>
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: 12 }}>
            <div><label style={LBL}>ชื่อแม่แบบ</label><input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="เช่น โกดังขนาดกลาง" style={INP} /></div>
            <div><label style={LBL}>ประเภทลูกค้าเป้าหมาย</label>
              <select value={cat} onChange={e => setCat(e.target.value)} style={INP}>
                {Object.keys(CAT_COLORS).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label style={LBL}>คำอธิบาย</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="อธิบายแม่แบบนี้..." style={{ ...INP, resize: "vertical" }} />
            </div>
          </div>
          <div style={{ padding: "12px 20px", borderTop: `1px solid ${BORDER}`, display: "flex", gap: 8, justifyContent: "flex-end", background: "#fafafa" }}>
            <button onClick={onClose} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", color: STEEL, fontSize: "0.78rem", fontWeight: 600, cursor: "pointer" }}>ยกเลิก</button>
            <button onClick={save} style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: PRIMARY, color: "#fff", fontSize: "0.78rem", fontWeight: 700, cursor: "pointer" }}>สร้าง</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function TemplatesPage() {
  const [templates,    setTemplates]    = useState<Template[]>(INIT_TEMPLATES);
  const [expanded,     setExpanded]     = useState<Set<number>>(new Set([1]));
  const [addModal,     setAddModal]     = useState(false);
  const [applyTarget,  setApplyTarget]  = useState<Template | null>(null);
  const [toast,        setToast]        = useState("");

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
          { label: "แม่แบบทั้งหมด",   value: `${templates.length} แม่แบบ`, color: PRIMARY },
          { label: "ขั้นตอนเฉลี่ย",     value: `${avgStages} ขั้นตอน`,     color: STEEL },
          { label: "จำนวนงานรวม",       value: `${totalTasks} งาน`,         color: "#0d9488" },
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
                  <button onClick={() => setApplyTarget(t)}
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
      {applyTarget && <ApplyModal template={applyTarget} onClose={() => setApplyTarget(null)} />}
    </div>
  );
}
