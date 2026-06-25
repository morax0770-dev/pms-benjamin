"use client";

import React, { useState } from "react";
import { customers } from "@/lib/mock";
import { Plus, X, Check, Edit2, Trash2 } from "lucide-react";

const PRIMARY = "#003366";
const STEEL   = "#2D2D2D";
const BORDER  = "#cfd4dc";
const MUTED   = "#6b7280";

type TaskItem  = { id: number; text: string; done: boolean; };
type Deal = {
  id: number; customerId: number; customer: string;
  value: number; stageId: number; assigned: string;
  tasks: TaskItem[]; outcome: "active" | "won" | "lost";
  createdAt: string;
};
type Stage = { id: number; name: string; color: string; };

const INIT_STAGES: Stage[] = [
  { id: 1, name: "ติดต่อครั้งแรก", color: "#4299e1" },
  { id: 2, name: "นำเสนอ",          color: "#ed8936" },
  { id: 3, name: "เสนอราคา",        color: "#f59e0b" },
  { id: 4, name: "เจรจา",           color: "#0d9488" },
  { id: 5, name: "รอปิดการขาย",    color: "#22c55e" },
];

const INIT_DEALS: Deal[] = [
  { id:1, customerId:3, customer:"หจก. ราชบุรีโลหะ",    value:760000,  stageId:1, assigned:"วิภา",
    tasks:[{id:1,text:"โทรหาลูกค้าครั้งแรก",done:true},{id:2,text:"ส่งแคตตาล็อก Benjamin",done:true},{id:3,text:"นัดประชุมออนไลน์",done:false}],
    outcome:"active", createdAt:"2026-06-20" },
  { id:2, customerId:7, customer:"บจ. อุตรดิตถ์โลหะ",   value:2800000, stageId:2, assigned:"วิภา",
    tasks:[{id:4,text:"นำเสนอ Solution PEB",done:true},{id:5,text:"ส่งตัวอย่างวัสดุ",done:true},{id:6,text:"เยี่ยมชมโรงงานลูกค้า",done:false},{id:7,text:"สรุปความต้องการ",done:false}],
    outcome:"active", createdAt:"2026-06-15" },
  { id:3, customerId:6, customer:"บจ. แม่สอดโลหะ",      value:4100000, stageId:2, assigned:"สมชาย",
    tasks:[{id:8,text:"นำเสนอ EASYBUILD Solution",done:true},{id:9,text:"สำรวจพื้นที่",done:true},{id:10,text:"จัดทำ BOQ เบื้องต้น",done:true}],
    outcome:"active", createdAt:"2026-06-10" },
  { id:4, customerId:2, customer:"บจ. ซีซีเอส",          value:3200000, stageId:3, assigned:"กาญจนา",
    tasks:[{id:11,text:"จัดทำใบเสนอราคา Q-2026-0095",done:true},{id:12,text:"ส่งใบเสนอราคาให้ลูกค้า",done:true},{id:13,text:"ติดตามผลใบเสนอราคา",done:false},{id:14,text:"อธิบาย spec เพิ่มเติม",done:false}],
    outcome:"active", createdAt:"2026-05-28" },
  { id:5, customerId:4, customer:"บจ. สมุทรโกดัง",       value:2000000, stageId:4, assigned:"สมชาย",
    tasks:[{id:15,text:"เจรจาเงื่อนไขราคา",done:true},{id:16,text:"ปรับแก้ข้อกำหนดสัญญา",done:true},{id:17,text:"นัดเซ็นสัญญา",done:false}],
    outcome:"active", createdAt:"2026-05-20" },
  { id:6, customerId:1, customer:"บจ. ไทยสตีล",          value:1800000, stageId:5, assigned:"วิชัย",
    tasks:[{id:18,text:"ลูกค้าอนุมัติในหลักการ",done:true},{id:19,text:"เตรียมเอกสารสัญญา",done:true},{id:20,text:"นัดเซ็นสัญญาสำเร็จ",done:true}],
    outcome:"active", createdAt:"2026-05-01" },
  { id:7, customerId:5, customer:"VCS Asia Co., Ltd.",    value:6200000, stageId:5, assigned:"วิชัย",
    tasks:[], outcome:"won", createdAt:"2025-11-10" },
  { id:8, customerId:8, customer:"บจ. นครสวรรค์โลหะ",    value:5400000, stageId:5, assigned:"สมชาย",
    tasks:[], outcome:"won", createdAt:"2026-04-05" },
];

const STAGE_COLORS = ["#4299e1","#ed8936","#f59e0b","#22c55e","#0d9488","#f04d6a","#3b82f6","#64748b"];
const OWNERS = ["สมชาย","วิภา","วิชัย","กาญจนา","ประสิทธิ์","สุดาวรรณ"];
const OC: Record<string, string> = { สมชาย:"#003366",วิภา:"#22c55e",วิชัย:"#f59e0b",กาญจนา:"#f04d6a",ประสิทธิ์:"#002244",สุดาวรรณ:"#8fa3b8" };

function fmtM(v: number) { return "฿"+(v>=1e6?(v/1e6).toFixed(1)+"M":Math.round(v/1000)+"K"); }
function daysOld(d: string) { return Math.floor((new Date("2026-06-24").getTime()-new Date(d).getTime())/86400000); }

// ── Stage Modal ──────────────────────────────────────────────────────
function StageModal({ stage, onSave, onClose }: { stage?: Stage; onSave:(name:string,color:string)=>void; onClose:()=>void }) {
  const [name,  setName]  = useState(stage?.name  ?? "");
  const [color, setColor] = useState(stage?.color ?? STAGE_COLORS[0]);
  const INP: React.CSSProperties = { width:"100%",border:`1px solid ${BORDER}`,borderRadius:8,padding:"9px 11px",fontSize:"0.84rem",outline:"none",boxSizing:"border-box" };
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(45,45,45,.4)",zIndex:200}}/>
      <div style={{position:"fixed",inset:0,zIndex:210,display:"flex",alignItems:"center",justifyContent:"center",padding:24,pointerEvents:"none"}}>
        <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:18,border:`1px solid ${BORDER}`,width:"100%",maxWidth:360,pointerEvents:"auto",overflow:"hidden",boxShadow:"0 24px 80px rgba(0,51,102,.2)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",borderBottom:`1px solid ${BORDER}`,background:PRIMARY}}>
            <span style={{fontSize:"0.9rem",fontWeight:800,color:"#fff"}}>{stage?"แก้ไขขั้นตอน":"เพิ่มขั้นตอน"}</span>
            <button onClick={onClose} style={{width:28,height:28,borderRadius:8,border:"1px solid rgba(255,255,255,.2)",background:"rgba(255,255,255,.1)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={13}/></button>
          </div>
          <div style={{padding:"20px",display:"flex",flexDirection:"column",gap:14}}>
            <div>
              <label style={{fontSize:"0.68rem",fontWeight:700,color:MUTED,display:"block",marginBottom:4}}>ชื่อขั้นตอน</label>
              <input value={name} onChange={e=>setName(e.target.value)} autoFocus placeholder="เช่น ติดต่อครั้งแรก" style={INP}/>
            </div>
            <div>
              <label style={{fontSize:"0.68rem",fontWeight:700,color:MUTED,display:"block",marginBottom:8}}>สีขั้นตอน</label>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {STAGE_COLORS.map(c=>(
                  <div key={c} onClick={()=>setColor(c)}
                    style={{width:28,height:28,borderRadius:"50%",background:c,cursor:"pointer",boxShadow:color===c?`0 0 0 3px #fff,0 0 0 5px ${c}`:"none",transition:"box-shadow .1s"}}/>
                ))}
              </div>
            </div>
          </div>
          <div style={{padding:"12px 20px",borderTop:`1px solid ${BORDER}`,display:"flex",gap:8,justifyContent:"flex-end",background:"#fafafa"}}>
            <button onClick={onClose} style={{padding:"8px 16px",borderRadius:8,border:`1px solid ${BORDER}`,background:"#fff",color:STEEL,fontSize:"0.78rem",fontWeight:600,cursor:"pointer"}}>ยกเลิก</button>
            <button onClick={()=>{if(name.trim()){onSave(name.trim(),color);onClose();}}} style={{padding:"8px 20px",borderRadius:8,border:"none",background:PRIMARY,color:"#fff",fontSize:"0.78rem",fontWeight:700,cursor:"pointer"}}>บันทึก</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Add Deal Modal ───────────────────────────────────────────────────
function DealModal({ stages, onSave, onClose }: { stages:Stage[]; onSave:(cid:number,co:string,val:number,sid:number,assigned:string)=>void; onClose:()=>void }) {
  const [cid,      setCid]      = useState(customers[0].id);
  const [value,    setValue]    = useState(0);
  const [stageId,  setStageId]  = useState(stages[0]?.id ?? 1);
  const [assigned, setAssigned] = useState(OWNERS[0]);
  const INP: React.CSSProperties = { width:"100%",border:`1px solid ${BORDER}`,borderRadius:8,padding:"8px 10px",fontSize:"0.82rem",outline:"none",boxSizing:"border-box" };
  const LBL: React.CSSProperties = { fontSize:"0.68rem",fontWeight:700,color:MUTED,display:"block",marginBottom:4 };
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(45,45,45,.4)",zIndex:200}}/>
      <div style={{position:"fixed",inset:0,zIndex:210,display:"flex",alignItems:"center",justifyContent:"center",padding:24,pointerEvents:"none"}}>
        <div onClick={e=>e.stopPropagation()} style={{background:"#fff",borderRadius:18,border:`1px solid ${BORDER}`,width:"100%",maxWidth:460,pointerEvents:"auto",overflow:"hidden",boxShadow:"0 24px 80px rgba(0,51,102,.2)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 20px",borderBottom:`1px solid ${BORDER}`,background:PRIMARY}}>
            <span style={{fontSize:"0.9rem",fontWeight:800,color:"#fff"}}>เพิ่มดีลใหม่</span>
            <button onClick={onClose} style={{width:28,height:28,borderRadius:8,border:"1px solid rgba(255,255,255,.2)",background:"rgba(255,255,255,.1)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={13}/></button>
          </div>
          <div style={{padding:"20px",display:"flex",flexDirection:"column",gap:12}}>
            <div>
              <label style={LBL}>ลูกค้า</label>
              <select value={cid} onChange={e=>setCid(Number(e.target.value))} style={INP}>
                {customers.map(c=><option key={c.id} value={c.id}>{c.company}</option>)}
              </select>
            </div>
            <div>
              <label style={LBL}>มูลค่า (บาท)</label>
              <input type="number" value={value||""} onChange={e=>setValue(Number(e.target.value))} placeholder="0" style={INP}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <label style={LBL}>ขั้นตอนเริ่มต้น</label>
                <select value={stageId} onChange={e=>setStageId(Number(e.target.value))} style={INP}>
                  {stages.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label style={LBL}>ผู้รับผิดชอบ</label>
                <select value={assigned} onChange={e=>setAssigned(e.target.value)} style={INP}>
                  {OWNERS.map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div style={{padding:"12px 20px",borderTop:`1px solid ${BORDER}`,display:"flex",gap:8,justifyContent:"flex-end",background:"#fafafa"}}>
            <button onClick={onClose} style={{padding:"8px 16px",borderRadius:8,border:`1px solid ${BORDER}`,background:"#fff",color:STEEL,fontSize:"0.78rem",fontWeight:600,cursor:"pointer"}}>ยกเลิก</button>
            <button onClick={()=>{const co=customers.find(c=>c.id===cid)?.company??"";if(value>0){onSave(cid,co,value,stageId,assigned);onClose();}}}
              style={{padding:"8px 20px",borderRadius:8,border:"none",background:PRIMARY,color:"#fff",fontSize:"0.78rem",fontWeight:700,cursor:"pointer"}}>บันทึก</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main Page ────────────────────────────────────────────────────────
export default function PipelinePage() {
  const [stages,  setStages]  = useState<Stage[]>(INIT_STAGES);
  const [deals,   setDeals]   = useState<Deal[]>(INIT_DEALS);
  const [sel,     setSel]     = useState<Deal|null>(null);
  const [addDeal, setAddDeal] = useState(false);
  const [stageMod,setStageMod]= useState<{open:boolean;stage?:Stage}>({open:false});
  const [newTask, setNewTask] = useState("");

  // mutations
  function addDealFn(cid:number,co:string,val:number,sid:number,assigned:string){
    const id=Math.max(0,...deals.map(d=>d.id))+1;
    setDeals(ds=>[{id,customerId:cid,customer:co,value:val,stageId:sid,assigned,tasks:[],outcome:"active",createdAt:"2026-06-24"},...ds]);
  }
  function upd(d:Deal,fn:(x:Deal)=>Deal){ setDeals(ds=>ds.map(x=>fn(x))); if(sel?.id===d.id) setSel(fn(d)); }
  function toggleTask(d:Deal,tid:number){ upd(d,x=>x.id!==d.id?x:{...x,tasks:x.tasks.map(t=>t.id===tid?{...t,done:!t.done}:t)}); }
  function addTaskFn(d:Deal,text:string){
    if(!text.trim()) return;
    const tid=Math.max(0,...deals.flatMap(x=>x.tasks.map(t=>t.id)))+1;
    upd(d,x=>x.id!==d.id?x:{...x,tasks:[...x.tasks,{id:tid,text:text.trim(),done:false}]});
  }
  function moveDeal(d:Deal,sid:number){ upd(d,x=>x.id!==d.id?x:{...x,stageId:sid}); }
  function closeDeal(d:Deal,outcome:"won"|"lost"){ upd(d,x=>x.id!==d.id?x:{...x,outcome}); }
  function saveStage(name:string,color:string){
    if(stageMod.stage){ setStages(ss=>ss.map(s=>s.id===stageMod.stage!.id?{...s,name,color}:s)); }
    else { const id=Math.max(0,...stages.map(s=>s.id))+1; setStages(ss=>[...ss,{id,name,color}]); }
  }
  function delStage(id:number){ if(!deals.some(d=>d.stageId===id&&d.outcome==="active")) setStages(ss=>ss.filter(s=>s.id!==id)); }

  const active = deals.filter(d=>d.outcome==="active");
  const won    = deals.filter(d=>d.outcome==="won");
  const lost   = deals.filter(d=>d.outcome==="lost");
  const lastId = stages.length>0?Math.max(...stages.map(s=>s.id)):-1;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:0}}>
      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:16}}>
        <div>
          <h1 style={{fontSize:"1.55rem",fontWeight:800,color:STEEL,margin:0}}>Pipeline งานขาย</h1>
          <div style={{fontSize:"0.76rem",color:MUTED,marginTop:4}}>ติดตามดีลและขั้นตอนการปิดการขาย</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setStageMod({open:true})}
            style={{padding:"8px 14px",borderRadius:10,border:`1px solid ${BORDER}`,background:"#fff",color:STEEL,fontSize:"0.75rem",fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
            <Plus size={12}/> ขั้นตอน
          </button>
          <button onClick={()=>setAddDeal(true)}
            style={{padding:"8px 16px",borderRadius:10,border:"none",background:PRIMARY,color:"#fff",fontSize:"0.75rem",fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5,boxShadow:"0 4px 10px rgba(0,51,102,.22)"}}>
            <Plus size={13}/> เพิ่มดีล
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        {[
          {label:"ดีลกำลังดำเนินการ", value:`${active.length} ดีล`,  color:PRIMARY},
          {label:"มูลค่า Pipeline",    value:fmtM(active.reduce((s,d)=>s+d.value,0)), color:STEEL},
          {label:"ปิดการขายแล้ว",      value:`${won.length} ดีล`,     color:"#22c55e"},
          {label:"มูลค่าปิดแล้ว",      value:fmtM(won.reduce((s,d)=>s+d.value,0)), color:"#22c55e"},
          {label:"ไม่สำเร็จ",          value:`${lost.length} ดีล`,    color:"#f04d6a"},
        ].map((s,i)=>(
          <div key={i} style={{background:"#fff",borderRadius:12,border:`1px solid ${BORDER}`,padding:"10px 16px"}}>
            <div style={{fontSize:"0.63rem",color:MUTED,fontWeight:600,marginBottom:3}}>{s.label}</div>
            <div style={{fontSize:"1.1rem",fontWeight:800,color:s.color}}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Board + Panel */}
      <div style={{display:"flex",gap:16,alignItems:"flex-start"}}>

        {/* Kanban board */}
        <div style={{flex:1,overflowX:"auto",minWidth:0}}>
          <div style={{display:"flex",gap:12,alignItems:"flex-start",paddingBottom:12}}>

            {stages.map(stage=>{
              const cols=active.filter(d=>d.stageId===stage.id);
              const isLast=stage.id===lastId;
              return (
                <div key={stage.id} style={{minWidth:234,maxWidth:234,flexShrink:0,display:"flex",flexDirection:"column"}}>
                  {/* Stage header */}
                  <div style={{background:stage.color+"18",borderRadius:"12px 12px 0 0",padding:"10px 12px",border:`1px solid ${stage.color}35`,borderBottom:"none"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:2}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:8,height:8,borderRadius:"50%",background:stage.color,flexShrink:0}}/>
                        <span style={{fontSize:"0.8rem",fontWeight:700,color:STEEL,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:128}}>{stage.name}</span>
                      </div>
                      <div style={{display:"flex",gap:2,flexShrink:0}}>
                        <button onClick={()=>setStageMod({open:true,stage})} style={{padding:4,borderRadius:5,border:"none",background:"none",cursor:"pointer",color:MUTED,display:"flex"}}><Edit2 size={11}/></button>
                        <button onClick={()=>delStage(stage.id)} disabled={cols.length>0}
                          style={{padding:4,borderRadius:5,border:"none",background:"none",cursor:cols.length>0?"not-allowed":"pointer",color:cols.length>0?"#d0d0d0":"#f04d6a",display:"flex"}}><Trash2 size={11}/></button>
                      </div>
                    </div>
                    <div style={{fontSize:"0.62rem",color:MUTED}}>{cols.length} ดีล{cols.length>0?` · ${fmtM(cols.reduce((s,d)=>s+d.value,0))}`:""}</div>
                  </div>

                  {/* Deal cards */}
                  <div style={{padding:"7px",background:stage.color+"09",border:`1px solid ${stage.color}25`,borderTop:"none",borderRadius:"0 0 12px 12px",minHeight:60,display:"flex",flexDirection:"column",gap:7}}>
                    {cols.map(deal=>{
                      const done=deal.tasks.filter(t=>t.done).length;
                      const total=deal.tasks.length;
                      const pct=total>0?Math.round(done/total*100):0;
                      const isSel=sel?.id===deal.id;
                      return (
                        <div key={deal.id} onClick={()=>setSel(s=>s?.id===deal.id?null:deal)}
                          style={{background:"#fff",borderRadius:10,border:isSel?`1.5px solid ${PRIMARY}`:`1px solid ${BORDER}`,padding:"11px 12px",cursor:"pointer",boxShadow:"0 1px 6px rgba(0,51,102,.06)",transition:"all .12s"}}
                          onMouseEnter={e=>{if(!isSel)(e.currentTarget as HTMLElement).style.boxShadow="0 4px 14px rgba(0,51,102,.12)";}}
                          onMouseLeave={e=>{if(!isSel)(e.currentTarget as HTMLElement).style.boxShadow="0 1px 6px rgba(0,51,102,.06)";}}>
                          <div style={{fontSize:"0.78rem",fontWeight:700,color:STEEL,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:4}}>{deal.customer}</div>
                          <div style={{fontSize:"0.9rem",fontWeight:800,color:PRIMARY,marginBottom:8}}>{fmtM(deal.value)}</div>
                          {total>0&&(
                            <div style={{marginBottom:8}}>
                              <div style={{height:4,borderRadius:99,background:"#f0f4f8",overflow:"hidden"}}>
                                <div style={{height:"100%",width:`${pct}%`,background:pct===100?"#22c55e":stage.color,borderRadius:99,transition:"width .3s"}}/>
                              </div>
                              <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
                                <span style={{fontSize:"0.6rem",color:MUTED}}>{done}/{total} งาน</span>
                                <span style={{fontSize:"0.6rem",fontWeight:700,color:pct===100?"#22c55e":MUTED}}>{pct}%</span>
                              </div>
                            </div>
                          )}
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                            <div style={{display:"flex",alignItems:"center",gap:5}}>
                              <div style={{width:20,height:20,borderRadius:"50%",background:OC[deal.assigned]??PRIMARY,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.58rem",fontWeight:800,color:"#fff"}}>{deal.assigned[0]}</div>
                              <span style={{fontSize:"0.62rem",color:MUTED}}>{deal.assigned}</span>
                            </div>
                            <span style={{fontSize:"0.58rem",color:"#c0c8d4"}}>{daysOld(deal.createdAt)}ว.</span>
                          </div>
                          {isLast&&(
                            <div style={{display:"flex",gap:5,marginTop:9}} onClick={e=>e.stopPropagation()}>
                              <button onClick={()=>closeDeal(deal,"won")} style={{flex:1,padding:"5px 0",borderRadius:7,border:"none",background:"#e5faf0",color:"#22c55e",fontSize:"0.64rem",fontWeight:700,cursor:"pointer"}}>✓ ลูกค้าเอา</button>
                              <button onClick={()=>closeDeal(deal,"lost")} style={{flex:1,padding:"5px 0",borderRadius:7,border:"none",background:"#fdeaed",color:"#f04d6a",fontSize:"0.64rem",fontWeight:700,cursor:"pointer"}}>✗ ไม่เอา</button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <button onClick={()=>setAddDeal(true)}
                      style={{background:"none",border:`1px dashed ${stage.color}50`,borderRadius:8,padding:"6px 0",color:MUTED,fontSize:"0.68rem",cursor:"pointer",width:"100%",marginTop:2}}>
                      + เพิ่มดีล
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Won / Lost summary */}
            {([{key:"won" as const,label:"ปิดการขาย ✓",color:"#22c55e",list:won},{key:"lost" as const,label:"ไม่สำเร็จ ✗",color:"#f04d6a",list:lost}] as const).map(col=>(
              <div key={col.key} style={{minWidth:190,maxWidth:190,flexShrink:0,display:"flex",flexDirection:"column"}}>
                <div style={{background:col.color+"18",borderRadius:"12px 12px 0 0",padding:"10px 12px",border:`1px solid ${col.color}35`,borderBottom:"none"}}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:8,height:8,borderRadius:"50%",background:col.color}}/>
                    <span style={{fontSize:"0.78rem",fontWeight:700,color:col.color}}>{col.label}</span>
                  </div>
                  <div style={{fontSize:"0.62rem",color:MUTED,marginTop:2}}>{col.list.length} ดีล · {fmtM(col.list.reduce((s,d)=>s+d.value,0))}</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:6,padding:"7px",background:col.color+"09",border:`1px solid ${col.color}25`,borderTop:"none",borderRadius:"0 0 12px 12px",minHeight:50}}>
                  {col.list.map(deal=>(
                    <div key={deal.id} style={{background:"#fff",borderRadius:9,border:`1px solid ${col.color}30`,padding:"8px 10px"}}>
                      <div style={{fontSize:"0.72rem",fontWeight:700,color:STEEL,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{deal.customer}</div>
                      <div style={{fontSize:"0.78rem",fontWeight:800,color:col.color,marginTop:2}}>{fmtM(deal.value)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side panel */}
        {sel&&(
          <div style={{width:308,flexShrink:0,position:"sticky",top:80,maxHeight:"calc(100vh - 110px)",overflowY:"auto"}}>
            <div style={{background:"#fff",borderRadius:16,border:`1px solid ${BORDER}`,overflow:"hidden",boxShadow:"0 2px 14px rgba(0,51,102,.07)"}}>
              <div style={{background:PRIMARY,padding:"14px 16px"}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
                  <div>
                    <div style={{fontSize:"0.88rem",fontWeight:800,color:"#fff",marginBottom:2}}>{sel.customer}</div>
                    <div style={{fontSize:"0.92rem",fontWeight:800,color:"rgba(255,255,255,.9)"}}>{fmtM(sel.value)}</div>
                  </div>
                  <button onClick={()=>setSel(null)} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:8}}><X size={14}/></button>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                  {sel.outcome!=="active"&&(
                    <span style={{padding:"2px 9px",borderRadius:99,fontSize:"0.65rem",fontWeight:700,background:sel.outcome==="won"?"#e5faf0":"#fdeaed",color:sel.outcome==="won"?"#22c55e":"#f04d6a"}}>
                      {sel.outcome==="won"?"✓ ปิดการขายแล้ว":"✗ ไม่สำเร็จ"}
                    </span>
                  )}
                  <span style={{fontSize:"0.67rem",color:"rgba(255,255,255,.55)",fontWeight:600}}>{stages.find(s=>s.id===sel.stageId)?.name} · {sel.assigned}</span>
                </div>
              </div>

              <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:14}}>
                {/* Move stage */}
                <div>
                  <div style={{fontSize:"0.62rem",fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>ขั้นตอนปัจจุบัน</div>
                  <select value={sel.stageId} onChange={e=>moveDeal(sel,Number(e.target.value))}
                    style={{width:"100%",border:`1px solid ${BORDER}`,borderRadius:8,padding:"8px 11px",fontSize:"0.82rem",outline:"none",color:STEEL}}>
                    {stages.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                {/* Tasks */}
                <div>
                  <div style={{fontSize:"0.62rem",fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>
                    งาน ({sel.tasks.filter(t=>t.done).length}/{sel.tasks.length})
                    {sel.tasks.length>0&&(
                      <span style={{marginLeft:6,fontWeight:800,color:sel.tasks.every(t=>t.done)?"#22c55e":PRIMARY}}>
                        {Math.round(sel.tasks.filter(t=>t.done).length/sel.tasks.length*100)}%
                      </span>
                    )}
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:5,marginBottom:9}}>
                    {sel.tasks.length===0&&(
                      <div style={{fontSize:"0.74rem",color:"#c0c8d4",textAlign:"center",padding:"12px 0"}}>ยังไม่มีงาน — เพิ่มด้านล่าง</div>
                    )}
                    {sel.tasks.map(task=>(
                      <div key={task.id} onClick={()=>toggleTask(sel,task.id)}
                        style={{display:"flex",alignItems:"center",gap:9,padding:"7px 10px",borderRadius:8,background:task.done?"#f0fdf4":"#f8f9fb",border:`1px solid ${task.done?"#a7f3d0":"#e5e7eb"}`,cursor:"pointer",transition:"all .1s"}}>
                        <div style={{width:17,height:17,borderRadius:5,border:`2px solid ${task.done?"#22c55e":"#d1d5db"}`,background:task.done?"#22c55e":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all .1s"}}>
                          {task.done&&<Check size={9} color="#fff"/>}
                        </div>
                        <span style={{fontSize:"0.74rem",color:task.done?MUTED:STEEL,fontWeight:task.done?400:600,textDecoration:task.done?"line-through":"none",lineHeight:1.35}}>{task.text}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <input value={newTask} onChange={e=>setNewTask(e.target.value)}
                      onKeyDown={e=>{if(e.key==="Enter"&&newTask.trim()){addTaskFn(sel,newTask);setNewTask("");}}}
                      placeholder="เพิ่มงานใหม่..."
                      style={{flex:1,border:`1px solid ${BORDER}`,borderRadius:8,padding:"7px 9px",fontSize:"0.75rem",outline:"none",color:STEEL}}/>
                    <button onClick={()=>{if(newTask.trim()){addTaskFn(sel,newTask);setNewTask("");}}}
                      style={{padding:"7px 11px",borderRadius:8,border:"none",background:PRIMARY,color:"#fff",fontWeight:700,cursor:"pointer",fontSize:"0.75rem"}}>+</button>
                  </div>
                </div>

                {/* Close deal */}
                {sel.outcome==="active"&&(
                  <div style={{paddingTop:10,borderTop:`1px solid #f0f4f8`}}>
                    <div style={{fontSize:"0.62rem",fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>ผลการขาย</div>
                    <div style={{display:"flex",gap:7}}>
                      <button onClick={()=>closeDeal(sel,"won")} style={{flex:1,padding:"9px 0",borderRadius:9,border:"none",background:"#22c55e",color:"#fff",fontSize:"0.75rem",fontWeight:700,cursor:"pointer"}}>✓ ลูกค้าเอา</button>
                      <button onClick={()=>closeDeal(sel,"lost")} style={{flex:1,padding:"9px 0",borderRadius:9,border:"none",background:"#f04d6a",color:"#fff",fontSize:"0.75rem",fontWeight:700,cursor:"pointer"}}>✗ ไม่เอา</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {stageMod.open&&<StageModal stage={stageMod.stage} onSave={saveStage} onClose={()=>setStageMod({open:false})}/>}
      {addDeal&&<DealModal stages={stages} onSave={addDealFn} onClose={()=>setAddDeal(false)}/>}
    </div>
  );
}
