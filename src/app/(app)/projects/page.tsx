"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  projects as INIT_PROJECTS, tasks, milestones,
  quotations, contracts, invoices, customers,
  projectStatusColor, projectStatusLabel,
  taskStatusBadge, taskStatusLabel, taskPriorityColor, taskPriorityLabel,
  invoiceStatusLabel, invoiceStatusColor,
  contractStatusLabel, contractStatusColor,
  quotationStatusLabel, quotationStatusColor,
  type ProjectStatus, type ProjectMock,
} from "@/lib/mock";
import { Plus, Download, Edit2, Trash2, X, Search, ArrowRight, ExternalLink, ChevronUp, ChevronDown } from "lucide-react";

// ── Tokens ─────────────────────────────────────────────────────
const PRIMARY = "#003366";
const STEEL   = "#2D2D2D";
const BORDER  = "#cfd4dc";
const MUTED   = "#6b7280";
const CARD: React.CSSProperties = { background:"#fff", borderRadius:16, border:`1px solid ${BORDER}`, boxShadow:"0 2px 14px rgba(0,51,102,.07)" };
const AVATAR_COLORS = [PRIMARY,"#22c55e","#f59e0b","#f04d6a","#3b82f6","#8fa3b8"];
const TEAM = ["สมชาย","วิภา","วิชัย","กาญจนา"];

// ── Status workflow ────────────────────────────────────────────
const STATUS_ACTIONS: Record<ProjectStatus,{label:string;next:ProjectStatus;bg:string;color:string}[]> = {
  not_started: [{label:"เริ่มโครงการ",      next:"in_progress", bg:"#dce5f0",color:PRIMARY}],
  in_progress: [
    {label:"หยุดชั่วคราว",   next:"on_hold",     bg:"#fef3cd",color:"#f59e0b"},
    {label:"ปิดโครงการ เสร็จสิ้น",next:"completed",  bg:"#e5faf0",color:"#22c55e"},
    {label:"ยกเลิกโครงการ",  next:"cancelled",   bg:"#fdeaed",color:"#f04d6a"},
  ],
  on_hold: [
    {label:"ดำเนินการต่อ",   next:"in_progress", bg:"#dce5f0",color:PRIMARY},
    {label:"ยกเลิกโครงการ",  next:"cancelled",   bg:"#fdeaed",color:"#f04d6a"},
  ],
  completed: [],
  cancelled: [{label:"เปิดโครงการใหม่", next:"not_started", bg:"#f0f0f5",color:MUTED}],
};

type SortKey = "title"|"status"|"progress"|"due";
type ProjForm = {
  title:string; customerId:number; client:string;
  status:ProjectStatus; progress:number;
  start:string; due:string; assigned:string[];
  value:string; quotationId:string;
};

// ── Helpers ───────────────────────────────────────────────────
function fmtDate(d:string){
  if(!d||d==="—") return "—";
  const [y,m,day]=d.split("-");
  const mo=["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return `${parseInt(day)} ${mo[parseInt(m)-1]} ${parseInt(y)+543}`;
}
function parseValue(v:string){ const n=parseFloat(v.replace(/[฿,]/g,"").trim()); if(v.includes("M")) return n*1e6; if(v.includes("K")) return n*1e3; return n||0; }
function calcProgress(projectId:number):number{
  const pt=tasks.filter(t=>t.projectId===projectId&&t.status!=="cancelled");
  if(pt.length===0) return 0;
  const done=pt.filter(t=>t.status==="done").length;
  return Math.round(done/pt.length*100);
}
function taskSummary(projectId:number):{done:number;total:number}{
  const pt=tasks.filter(t=>t.projectId===projectId&&t.status!=="cancelled");
  return {done:pt.filter(t=>t.status==="done").length,total:pt.length};
}

function exportCSV(rows:ProjectMock[]){
  const h=["ID","ชื่อโครงการ","ลูกค้า","สถานะ","ความคืบหน้า","เริ่ม","ครบกำหนด","ทีม","มูลค่า"];
  const lines=rows.map(p=>[p.id,p.title,p.client,projectStatusLabel[p.status],p.progress+"%",p.start,p.due,p.assigned.join(";"),p.value].join(","));
  const blob=new Blob(["﻿"+[h.join(","),...lines].join("\n")],{type:"text/csv;charset=utf-8;"});
  const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="projects.csv"; a.click(); URL.revokeObjectURL(url);
}
const PAGE_SIZE = 8;

// ── Sub-components ────────────────────────────────────────────
function Avatar({name,idx}:{name:string;idx:number}){
  return (
    <span title={name} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",width:26,height:26,borderRadius:"50%",background:AVATAR_COLORS[idx%AVATAR_COLORS.length],color:"#fff",fontSize:"0.6rem",fontWeight:700,border:"2px solid #fff",marginLeft:idx===0?0:-8,zIndex:10-idx,position:"relative",flexShrink:0}}>
      {name.substring(0,2)}
    </span>
  );
}
function StatusBadge({status}:{status:ProjectStatus}){
  const c=projectStatusColor[status];
  return <span style={{display:"inline-block",padding:"3px 10px",borderRadius:99,fontSize:"0.68rem",fontWeight:700,background:c.bg,color:c.text,whiteSpace:"nowrap"}}>{projectStatusLabel[status]}</span>;
}
function ProgressBar({value}:{value:number}){
  const color=value===100?"#22c55e":value>=60?"#3b82f6":value>=30?"#f59e0b":"#f04d6a";
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{flex:1,height:6,background:"#f0f0f5",borderRadius:99,overflow:"hidden",minWidth:80}}>
        <div style={{height:"100%",width:`${value}%`,background:color,borderRadius:99,transition:"width .3s"}}/>
      </div>
      <span style={{fontSize:"0.72rem",fontWeight:700,color,minWidth:32,textAlign:"right"}}>{value}%</span>
    </div>
  );
}
function ProgressArc({value,size=54}:{value:number;size?:number}){
  const r=(size-8)/2; const circ=2*Math.PI*r; const offset=circ-(value/100)*circ;
  const color=value===100?"#22c55e":value>=60?"#3b82f6":value>=30?"#f59e0b":"#f04d6a";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{transform:"rotate(-90deg)",flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f0f0f5" strokeWidth={5}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5} strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"/>
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" style={{fontSize:11,fontWeight:800,fill:STEEL,transform:"rotate(90deg)",transformOrigin:"50% 50%",fontFamily:"inherit"}}>{value}%</text>
    </svg>
  );
}

// ── Modal ─────────────────────────────────────────────────────
function ProjectModal({initial,title,onSave,onClose}:{initial:ProjForm;title:string;onSave:(f:ProjForm)=>void;onClose:()=>void}){
  const [form,setForm]=useState<ProjForm>(initial);
  const INP:React.CSSProperties={width:"100%",border:`1px solid ${BORDER}`,borderRadius:9,padding:"8px 12px",fontSize:"0.82rem",outline:"none",color:STEEL,boxSizing:"border-box"};
  const LBL:React.CSSProperties={fontSize:"0.68rem",fontWeight:700,color:MUTED,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.04em"};
  function set<K extends keyof ProjForm>(k:K,v:ProjForm[K]){setForm(p=>({...p,[k]:v}));}
  function pickCustomer(id:number){const cu=customers.find(c=>c.id===id); if(cu) setForm(p=>({...p,customerId:id,client:cu.company}));}
  function toggleMember(m:string){setForm(p=>({...p,assigned:p.assigned.includes(m)?p.assigned.filter(x=>x!==m):[...p.assigned,m]}));}
  function submit(){if(!form.title||!form.client) return; onSave(form); onClose();}
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(45,45,45,.4)",zIndex:200}}/>
      <div onClick={e=>e.stopPropagation()} style={{position:"fixed",inset:0,zIndex:210,display:"flex",alignItems:"center",justifyContent:"center",padding:20,pointerEvents:"none"}}>
        <div style={{...CARD,width:"100%",maxWidth:560,pointerEvents:"auto",overflow:"hidden",boxShadow:"0 24px 80px rgba(0,51,102,.2)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 22px",borderBottom:`1px solid ${BORDER}`,background:PRIMARY}}>
            <div style={{fontSize:"0.92rem",fontWeight:800,color:"#fff"}}>{title}</div>
            <button onClick={onClose} style={{width:28,height:28,borderRadius:8,border:"1px solid rgba(255,255,255,.2)",background:"rgba(255,255,255,.1)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={13}/></button>
          </div>
          <div style={{padding:"20px 22px",overflowY:"auto",maxHeight:"66vh",display:"flex",flexDirection:"column",gap:13}}>
            <div>
              <label style={LBL}>ชื่อโครงการ *</label>
              <input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="ชื่อโครงการ" style={INP}/>
            </div>
            <div>
              <label style={LBL}>ลูกค้า *</label>
              <select onChange={e=>pickCustomer(Number(e.target.value))} defaultValue="" style={INP}>
                <option value="" disabled>— เลือกลูกค้า —</option>
                {customers.map(c=><option key={c.id} value={c.id}>{c.company}</option>)}
              </select>
              <input value={form.client} onChange={e=>set("client",e.target.value)} placeholder="ชื่อลูกค้า" style={{...INP,marginTop:6}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{gridColumn:"1/-1"}}>
                <label style={LBL}>สถานะ</label>
                <select value={form.status} onChange={e=>set("status",e.target.value as ProjectStatus)} style={INP}>
                  {(["not_started","in_progress","on_hold","completed","cancelled"] as ProjectStatus[]).map(s=><option key={s} value={s}>{projectStatusLabel[s]}</option>)}
                </select>
              </div>
              <div>
                <label style={LBL}>วันเริ่ม</label>
                <input type="date" value={form.start} onChange={e=>set("start",e.target.value)} style={INP}/>
              </div>
              <div>
                <label style={LBL}>วันครบกำหนด</label>
                <input type="date" value={form.due} onChange={e=>set("due",e.target.value)} style={INP}/>
              </div>
              <div>
                <label style={LBL}>มูลค่าโครงการ</label>
                <input value={form.value} onChange={e=>set("value",e.target.value)} placeholder="เช่น ฿1.8M" style={INP}/>
              </div>
              <div>
                <label style={LBL}>ใบเสนอราคาอ้างอิง</label>
                <select value={form.quotationId} onChange={e=>set("quotationId",e.target.value)} style={INP}>
                  <option value="">— ไม่มี —</option>
                  {quotations.map(q=><option key={q.id} value={q.id}>{q.id}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={LBL}>ทีมงาน</label>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:4}}>
                {TEAM.map(m=>{
                  const sel=form.assigned.includes(m);
                  return <button key={m} type="button" onClick={()=>toggleMember(m)} style={{padding:"5px 12px",borderRadius:99,border:`1px solid ${sel?PRIMARY:BORDER}`,background:sel?"#dce5f0":"#fff",color:sel?PRIMARY:MUTED,fontSize:"0.75rem",fontWeight:600,cursor:"pointer"}}>
                    {m}{sel?" ✓":""}
                  </button>;
                })}
              </div>
            </div>
          </div>
          <div style={{padding:"13px 22px",borderTop:`1px solid ${BORDER}`,display:"flex",gap:8,justifyContent:"flex-end",background:"#fafafa"}}>
            <button onClick={onClose} style={{padding:"8px 18px",borderRadius:9,border:`1px solid ${BORDER}`,background:"#fff",color:STEEL,fontSize:"0.78rem",fontWeight:600,cursor:"pointer"}}>ยกเลิก</button>
            <button onClick={submit} style={{padding:"8px 22px",borderRadius:9,border:"none",background:PRIMARY,color:"#fff",fontSize:"0.78rem",fontWeight:700,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,51,102,.3)"}}>บันทึก</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Detail Panel ──────────────────────────────────────────────
function DetailPanel({project,onClose,onEdit,onChangeStatus,onDelete}:{
  project:ProjectMock; onClose:()=>void; onEdit:()=>void;
  onChangeStatus:(s:ProjectStatus)=>void; onDelete:()=>void;
}){
  const router = useRouter();
  const [tab,setTab]=useState<"overview"|"tasks"|"docs"|"customer">("overview");
  const [delConfirm,setDelConfirm]=useState(false);

  const projTasks    = tasks.filter(t=>t.projectId===project.id);
  const doneTasks    = projTasks.filter(t=>t.status==="done").length;
  const projMilestones = milestones.filter(m=>m.projectId===project.id);
  const relQuotation = project.quotationId ? quotations.find(q=>q.id===project.quotationId) : null;
  const relContract  = contracts.find(c=>c.project===project.title);
  const relInvoices  = invoices.filter(i=>i.projectId===project.id);
  const relCustomer  = customers.find(c=>c.id===project.customerId);

  const dtabs:[string,string,number?][]=[
    ["overview","ภาพรวม"],
    ["tasks","งาน",projTasks.length],
    ["docs","เอกสาร"],
    ["customer","ลูกค้า"],
  ];

  return (
    <>
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(45,45,45,.38)",zIndex:300}} />
    <div style={{position:"fixed",right:0,top:0,height:"100vh",width:420,background:"#fff",overflowY:"auto",zIndex:301,boxShadow:"-6px 0 40px rgba(0,51,102,.16)"}}>
      {/* Header */}
      <div style={{background:PRIMARY,padding:"16px 16px 12px"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:"0.88rem",fontWeight:800,color:"#fff",lineHeight:1.3,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{project.title}</div>
            <button onClick={()=>router.push(`/customers/${project.customerId}`)} style={{background:"none",border:"none",cursor:"pointer",color:"rgba(255,255,255,.7)",fontSize:"0.72rem",fontWeight:600,padding:0}}>{project.client}</button>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:8}}><X size={14}/></button>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{padding:"2px 10px",borderRadius:99,fontSize:"0.63rem",fontWeight:700,background:projectStatusColor[project.status].bg,color:projectStatusColor[project.status].text}}>{projectStatusLabel[project.status]}</span>
          <span style={{fontSize:"0.82rem",fontWeight:800,color:"rgba(255,255,255,.9)"}}>{project.value}</span>
        </div>
      </div>
      {/* Progress */}
      <div style={{padding:"12px 16px",borderBottom:`1px solid ${BORDER}`}}>
        <ProgressBar value={calcProgress(project.id)}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
          <span style={{fontSize:"0.65rem",color:MUTED}}>งาน {doneTasks}/{projTasks.length} (ยกเว้นยกเลิก)</span>
          <span style={{fontSize:"0.65rem",color:MUTED}}>เริ่ม {fmtDate(project.start)} · ครบ {fmtDate(project.due)}</span>
        </div>
      </div>
      {/* Tabs */}
      <div style={{display:"flex",borderBottom:`1px solid ${BORDER}`,overflowX:"auto"}}>
        {dtabs.map(([key,label,cnt])=>(
          <button key={key} onClick={()=>setTab(key as typeof tab)}
            style={{display:"flex",alignItems:"center",gap:3,padding:"8px 10px",border:"none",background:"none",cursor:"pointer",fontSize:"0.63rem",fontWeight:tab===key?700:500,color:tab===key?PRIMARY:MUTED,borderBottom:tab===key?`2px solid ${PRIMARY}`:"2px solid transparent",whiteSpace:"nowrap",marginBottom:-1}}>
            {label}{cnt!==undefined&&cnt>0?<span style={{padding:"1px 5px",borderRadius:99,background:"#dce5f0",color:PRIMARY,fontSize:"0.58rem",fontWeight:800,marginLeft:3}}>{cnt}</span>:null}
          </button>
        ))}
      </div>

      {/* Tab: ภาพรวม */}
      {tab==="overview"&&(
        <div style={{padding:"14px 16px"}}>
          {/* Milestones */}
          <div style={{fontSize:"0.63rem",fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>
            Milestones {projMilestones.length>0?`(${projMilestones.filter(m=>m.done).length}/${projMilestones.length})`:""}
          </div>
          {projMilestones.length===0?(
            <div style={{fontSize:"0.72rem",color:MUTED,textAlign:"center",padding:"8px 0",marginBottom:12}}>ยังไม่มี milestone</div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:14}}>
              {projMilestones.map(m=>(
                <div key={m.id} style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  <div style={{width:18,height:18,borderRadius:"50%",flexShrink:0,background:m.done?"#e5faf0":"#f0f0f5",border:`2px solid ${m.done?"#22c55e":BORDER}`,display:"flex",alignItems:"center",justifyContent:"center",marginTop:1}}>
                    {m.done&&<span style={{fontSize:9,color:"#22c55e",fontWeight:800}}>✓</span>}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:"0.76rem",fontWeight:600,color:m.done?MUTED:STEEL,textDecoration:m.done?"line-through":"none"}}>{m.title}</div>
                    <div style={{fontSize:"0.65rem",color:MUTED,marginTop:2}}>{fmtDate(m.dueDate)}</div>
                  </div>
                  {m.type==="major"&&<span style={{fontSize:"0.6rem",background:"#dce5f0",color:PRIMARY,padding:"1px 7px",borderRadius:99,fontWeight:700,flexShrink:0}}>สำคัญ</span>}
                </div>
              ))}
            </div>
          )}
          {/* Team */}
          {project.assigned.length>0&&(
            <>
              <div style={{fontSize:"0.63rem",fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>ทีมงาน</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:8,marginBottom:14}}>
                {project.assigned.map((a,i)=>(
                  <div key={a} style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:24,height:24,borderRadius:"50%",background:AVATAR_COLORS[i%AVATAR_COLORS.length],display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:"0.6rem",fontWeight:700}}>{a.substring(0,2)}</div>
                    <span style={{fontSize:"0.74rem",color:STEEL,fontWeight:600}}>{a}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {/* Status workflow */}
          {STATUS_ACTIONS[project.status].length>0&&(
            <>
              <div style={{fontSize:"0.63rem",fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>เปลี่ยนสถานะ</div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {STATUS_ACTIONS[project.status].map(action=>(
                  <button key={action.next} onClick={()=>onChangeStatus(action.next)}
                    style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",borderRadius:10,background:action.bg,border:"none",cursor:"pointer",width:"100%"}}>
                    <span style={{fontSize:"0.76rem",fontWeight:700,color:action.color}}>{action.label}</span>
                    <ArrowRight size={13} color={action.color}/>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Tab: งาน */}
      {tab==="tasks"&&(
        <div style={{padding:"12px 14px"}}>
          {projTasks.length===0?(
            <div style={{textAlign:"center",padding:"28px 0",color:MUTED,fontSize:"0.78rem"}}>ยังไม่มีงานในโครงการนี้</div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {projTasks.map(t=>{
                const tc=taskStatusBadge[t.status]; const pc=taskPriorityColor[t.priority];
                return (
                  <div key={t.id} style={{padding:"10px 12px",borderRadius:10,background:"#f8f9fb",border:`1px solid ${BORDER}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
                      <div style={{fontSize:"0.76rem",fontWeight:700,color:STEEL,flex:1,marginRight:8}}>{t.title}</div>
                      <span style={{padding:"2px 7px",borderRadius:99,fontSize:"0.6rem",fontWeight:700,background:tc.bg,color:tc.text,flexShrink:0}}>{taskStatusLabel[t.status]}</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:"0.62rem",fontWeight:700,color:pc}}>● {taskPriorityLabel[t.priority]}</span>
                      {t.due&&<span style={{fontSize:"0.62rem",color:MUTED}}>ครบ {t.due}</span>}
                      {t.assigned.length>0&&<span style={{fontSize:"0.62rem",color:MUTED}}>{t.assigned.join(", ")}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <button onClick={()=>router.push("/tasks")}
            style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,width:"100%",padding:"9px 0",borderRadius:10,background:"#dce5f0",color:PRIMARY,border:"none",fontSize:"0.74rem",fontWeight:700,cursor:"pointer",marginTop:10}}>
            <ExternalLink size={13}/> ดูงานทั้งหมด
          </button>
        </div>
      )}

      {/* Tab: เอกสาร */}
      {tab==="docs"&&(
        <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:12}}>
          {/* Quotation */}
          <div>
            <div style={{fontSize:"0.63rem",fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>ใบเสนอราคา</div>
            {relQuotation?(
              <button onClick={()=>router.push("/quotations")} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"10px 12px",borderRadius:10,background:"#f8f9fb",border:`1px solid ${BORDER}`,cursor:"pointer",textAlign:"left"}}>
                <div>
                  <div style={{fontSize:"0.73rem",fontWeight:700,color:PRIMARY,fontFamily:"monospace"}}>{relQuotation.id}</div>
                  <div style={{fontSize:"0.65rem",color:MUTED,marginTop:2}}>{relQuotation.total} · <span style={{padding:"1px 6px",borderRadius:99,fontSize:"0.6rem",fontWeight:700,background:quotationStatusColor[relQuotation.status].bg,color:quotationStatusColor[relQuotation.status].text}}>{quotationStatusLabel[relQuotation.status]}</span></div>
                </div>
                <ExternalLink size={12} color={MUTED}/>
              </button>
            ):(
              <div style={{fontSize:"0.73rem",color:MUTED,padding:"8px 12px",background:"#f8f9fb",borderRadius:10,border:`1px solid ${BORDER}`}}>ไม่มีใบเสนอราคา</div>
            )}
          </div>
          {/* Contract */}
          <div>
            <div style={{fontSize:"0.63rem",fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>สัญญา</div>
            {relContract?(
              <button onClick={()=>router.push("/contracts")} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"10px 12px",borderRadius:10,background:"#f8f9fb",border:`1px solid ${BORDER}`,cursor:"pointer",textAlign:"left"}}>
                <div>
                  <div style={{fontSize:"0.73rem",fontWeight:700,color:PRIMARY,fontFamily:"monospace"}}>{relContract.id}</div>
                  <div style={{fontSize:"0.65rem",color:MUTED,marginTop:2}}>{relContract.value.toLocaleString()} บาท · <span style={{padding:"1px 6px",borderRadius:99,fontSize:"0.6rem",fontWeight:700,background:contractStatusColor[relContract.status].bg,color:contractStatusColor[relContract.status].text}}>{contractStatusLabel[relContract.status]}</span></div>
                </div>
                <ExternalLink size={12} color={MUTED}/>
              </button>
            ):(
              <div style={{fontSize:"0.73rem",color:MUTED,padding:"8px 12px",background:"#f8f9fb",borderRadius:10,border:`1px solid ${BORDER}`}}>ไม่พบสัญญา</div>
            )}
          </div>
          {/* Invoices */}
          <div>
            <div style={{fontSize:"0.63rem",fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:6}}>ใบแจ้งหนี้ ({relInvoices.length})</div>
            {relInvoices.length===0?(
              <div style={{fontSize:"0.73rem",color:MUTED,padding:"8px 12px",background:"#f8f9fb",borderRadius:10,border:`1px solid ${BORDER}`}}>ไม่พบใบแจ้งหนี้</div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:5}}>
                {relInvoices.map(inv=>(
                  <button key={inv.id} onClick={()=>router.push("/invoices")} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 12px",borderRadius:10,background:"#f8f9fb",border:`1px solid ${BORDER}`,cursor:"pointer",textAlign:"left",width:"100%"}}>
                    <div>
                      <div style={{fontSize:"0.7rem",fontWeight:700,color:PRIMARY,fontFamily:"monospace"}}>{inv.id}</div>
                      <div style={{fontSize:"0.62rem",color:MUTED,marginTop:1}}>{inv.milestone} · ฿{inv.total.toLocaleString()}</div>
                    </div>
                    <span style={{padding:"2px 7px",borderRadius:99,fontSize:"0.6rem",fontWeight:700,background:invoiceStatusColor[inv.status].bg,color:invoiceStatusColor[inv.status].text}}>{invoiceStatusLabel[inv.status]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: ลูกค้า */}
      {tab==="customer"&&(
        <div style={{padding:"14px 16px"}}>
          {relCustomer?(
            <>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <div style={{width:44,height:44,borderRadius:13,background:relCustomer.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:"1rem",flexShrink:0}}>{relCustomer.initials}</div>
                <div>
                  <div style={{fontSize:"0.88rem",fontWeight:800,color:STEEL}}>{relCustomer.company}</div>
                  <div style={{fontSize:"0.7rem",color:MUTED,marginTop:2}}>{relCustomer.name}</div>
                </div>
              </div>
              {[{l:"โทรศัพท์",v:relCustomer.phone},{l:"อีเมล",v:relCustomer.email},{l:"จังหวัด",v:relCustomer.province},{l:"หมวด",v:relCustomer.category}].map((r,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<3?"1px solid #f0f4f8":"none"}}>
                  <span style={{fontSize:"0.7rem",color:MUTED,fontWeight:600}}>{r.l}</span>
                  <span style={{fontSize:"0.75rem",color:STEEL,fontWeight:700,maxWidth:160,textAlign:"right",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.v}</span>
                </div>
              ))}
              <button onClick={()=>router.push(`/customers/${relCustomer.id}`)}
                style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,width:"100%",padding:"9px 0",borderRadius:10,background:PRIMARY,color:"#fff",border:"none",fontSize:"0.76rem",fontWeight:700,cursor:"pointer",marginTop:14}}>
                <ExternalLink size={13}/> ดูข้อมูลลูกค้า
              </button>
            </>
          ):(
            <div style={{textAlign:"center",padding:"28px 0",color:MUTED,fontSize:"0.78rem"}}>ไม่พบข้อมูลลูกค้า</div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{padding:"12px 14px",borderTop:`1px solid ${BORDER}`,display:"flex",flexDirection:"column",gap:6}}>
        <div style={{display:"flex",gap:6}}>
          <button onClick={onEdit}
            style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"9px 0",borderRadius:10,background:PRIMARY,color:"#fff",border:"none",fontSize:"0.74rem",fontWeight:700,cursor:"pointer"}}>
            <Edit2 size={13}/> แก้ไข
          </button>
          <button onClick={()=>router.push(`/projects/${project.id}`)}
            style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"9px 0",borderRadius:10,background:"#dce5f0",color:PRIMARY,border:"none",fontSize:"0.74rem",fontWeight:700,cursor:"pointer"}}>
            <ExternalLink size={13}/> ดูเต็ม
          </button>
        </div>
        {!delConfirm?(
          <button onClick={()=>setDelConfirm(true)}
            style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"7px 0",borderRadius:10,background:"#fff",color:"#f04d6a",border:"1px solid #fdeaed",fontSize:"0.72rem",fontWeight:700,cursor:"pointer"}}>
            <Trash2 size={12}/> ลบโครงการ
          </button>
        ):(
          <div style={{borderRadius:10,border:"1px solid #fca5a5",overflow:"hidden"}}>
            <div style={{padding:"7px 12px",background:"#fdeaed",fontSize:"0.7rem",color:"#f04d6a",fontWeight:600}}>ยืนยันลบ "{project.title.substring(0,20)}..."?</div>
            <div style={{display:"flex"}}>
              <button onClick={onDelete} style={{flex:1,padding:"7px",background:"#f04d6a",border:"none",color:"#fff",fontSize:"0.7rem",fontWeight:700,cursor:"pointer"}}>ลบ</button>
              <button onClick={()=>setDelConfirm(false)} style={{flex:1,padding:"7px",background:"#fff",border:"none",borderLeft:"1px solid #fca5a5",color:STEEL,fontSize:"0.7rem",cursor:"pointer"}}>ยกเลิก</button>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

// ── Grid Card ─────────────────────────────────────────────────
function GridCard({project,selected,onClick}:{project:ProjectMock;selected:boolean;onClick:()=>void}){
  const isCompleted=project.status==="completed";
  return (
    <div onClick={onClick} style={{...CARD,padding:18,cursor:"pointer",borderColor:selected?PRIMARY:BORDER,boxShadow:selected?`0 0 0 2px rgba(0,51,102,.18), 0 2px 14px rgba(0,51,102,.07)`:CARD.boxShadow,transition:"box-shadow .15s, border-color .15s",opacity:isCompleted?0.7:1}}
      onMouseEnter={e=>{if(!selected)(e.currentTarget as HTMLElement).style.borderColor="#b0bbc8";}}
      onMouseLeave={e=>{if(!selected)(e.currentTarget as HTMLElement).style.borderColor=BORDER;}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:14,marginBottom:12}}>
        <ProgressArc value={calcProgress(project.id)} size={56}/>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:"0.85rem",fontWeight:800,color:STEEL,lineHeight:1.35,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",textDecoration:isCompleted?"line-through":"none"}}>{project.title}</div>
          <div style={{fontSize:"0.72rem",color:MUTED}}>{project.client}</div>
        </div>
      </div>
      <div style={{marginBottom:12}}><StatusBadge status={project.status}/></div>
      <div style={{borderTop:"1px solid #f0f4f8",paddingTop:10,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:"0.62rem",color:MUTED,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:2}}>กำหนด</div>
          <div style={{fontSize:"0.73rem",color:STEEL,fontWeight:600}}>{fmtDate(project.due)}</div>
        </div>
        <div style={{display:"flex",alignItems:"center"}}>
          {project.assigned.length===0
            ?<span style={{fontSize:"0.7rem",color:MUTED}}>ไม่มีทีม</span>
            :project.assigned.map((a,i)=><Avatar key={a} name={a} idx={i}/>)}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function ProjectsPage(){
  const router = useRouter();
  const [data,setData]           = useState<ProjectMock[]>(INIT_PROJECTS);
  const [query,setQuery]         = useState("");
  const [filterStatus,setFilterStatus] = useState<ProjectStatus|"ALL">("ALL");
  const [viewMode,setViewMode]   = useState<"table"|"card">("table");
  const [sortKey,setSortKey]     = useState<SortKey>("due");
  const [sortAsc,setSortAsc]     = useState(true);
  const [selectedId,setSelectedId] = useState<number|null>(null);
  const [page,setPage]           = useState(1);
  const [showModal,setShowModal] = useState(false);
  const [editingProj,setEditingProj] = useState<ProjectMock|null>(null);

  const totalValue=useMemo(()=>data.reduce((s,p)=>s+parseValue(p.value),0),[data]);

  const filtered=useMemo(()=>{
    let list=data.filter(p=>{
      const q=query.toLowerCase();
      const matchQ=!q||p.title.toLowerCase().includes(q)||p.client.toLowerCase().includes(q);
      const matchS=filterStatus==="ALL"||p.status===filterStatus;
      return matchQ&&matchS;
    });
    list=[...list].sort((a,b)=>{
      let cmp=0;
      if(sortKey==="title") cmp=a.title.localeCompare(b.title,"th");
      else if(sortKey==="status") cmp=a.status.localeCompare(b.status);
      else if(sortKey==="progress") cmp=a.progress-b.progress;
      else if(sortKey==="due") cmp=a.due.localeCompare(b.due);
      return sortAsc?cmp:-cmp;
    });
    return list;
  },[data,query,filterStatus,sortKey,sortAsc]);

  const totalPages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
  const safePage=Math.min(page,totalPages);
  const pageSlice=filtered.slice((safePage-1)*PAGE_SIZE,safePage*PAGE_SIZE);
  const selectedProject=selectedId!==null?data.find(p=>p.id===selectedId)??null:null;
  const rangeStart=(safePage-1)*PAGE_SIZE+1;
  const rangeEnd=Math.min(safePage*PAGE_SIZE,filtered.length);

  function toggleSort(k:SortKey){if(sortKey===k)setSortAsc(a=>!a);else{setSortKey(k);setSortAsc(true);}setPage(1);}

  const SH:React.CSSProperties={fontSize:"0.63rem",fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.05em",padding:"10px 14px",textAlign:"left",whiteSpace:"nowrap",cursor:"pointer",userSelect:"none"};

  const statCards=[
    {label:"ทั้งหมด",        value:data.length,                                       color:"#003366", key:"ALL"},
    {label:"กำลังดำเนินการ", value:data.filter(p=>p.status==="in_progress").length,   color:"#f59e0b", key:"in_progress"},
    {label:"หยุดชั่วคราว",  value:data.filter(p=>p.status==="on_hold").length,        color:"#64748b", key:"on_hold"},
    {label:"เสร็จแล้ว",     value:data.filter(p=>p.status==="completed").length,      color:"#22c55e", key:"completed"},
  ];

  function openAdd(){ setEditingProj(null); setShowModal(true); }
  function openEdit(p:ProjectMock){ setEditingProj(p); setShowModal(true); }

  function saveProject(form:ProjForm){
    if(editingProj){
      const updated={...editingProj,...form,assigned:form.assigned,quotationId:form.quotationId||undefined};
      setData(d=>d.map(p=>p.id===editingProj.id?updated:p));
      setSelectedId(editingProj.id);
    } else {
      const newId=Math.max(...data.map(p=>p.id),0)+1;
      const newP:ProjectMock={id:newId,...form,assigned:form.assigned,quotationId:form.quotationId||undefined};
      setData(d=>[newP,...d]);
    }
  }
  function changeStatus(id:number,s:ProjectStatus){
    setData(d=>d.map(p=>p.id===id?{...p,status:s}:p));
  }
  function deleteProject(){
    if(!selectedId) return;
    setData(d=>d.filter(p=>p.id!==selectedId));
    setSelectedId(null);
  }

  function toForm(p:ProjectMock):ProjForm{
    return {title:p.title,client:p.client,customerId:p.customerId,status:p.status,progress:p.progress,start:p.start,due:p.due,assigned:[...p.assigned],value:p.value,quotationId:p.quotationId??""};
  }
  function blankForm():ProjForm{
    return {title:"",client:customers[0].company,customerId:customers[0].id,status:"not_started",progress:0,start:"2026-07-01",due:"",assigned:[],value:"",quotationId:""};
  }

  return (
    <div>
      {/* Header */}
      <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{fontSize:"1.55rem",fontWeight:800,color:STEEL,margin:"0 0 3px"}}>โครงการ</h1>
          <div style={{fontSize:"0.76rem",color:MUTED}}>จัดการและติดตามโครงการทั้งหมด · มูลค่ารวม ฿{(totalValue/1e6).toFixed(1)}M</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>exportCSV(filtered)}
            style={{display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:10,border:`1px solid ${BORDER}`,background:"#fff",fontSize:"0.77rem",fontWeight:600,color:STEEL,cursor:"pointer"}}>
            <Download size={13}/> ส่งออก
          </button>
          <button onClick={openAdd}
            style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:10,background:PRIMARY,color:"#fff",border:"none",fontSize:"0.78rem",fontWeight:700,cursor:"pointer",boxShadow:"0 4px 10px rgba(0,51,102,.25)"}}>
            <Plus size={13}/> เพิ่มโครงการ
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
        {statCards.map((s,i)=>(
          <div key={i} onClick={()=>{setFilterStatus(s.key as ProjectStatus|"ALL");setPage(1);}}
            style={{...CARD,padding:"16px 18px",display:"flex",alignItems:"center",gap:14,cursor:"pointer"}}
            onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.boxShadow="0 4px 16px rgba(0,51,102,.12)";}}
            onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.boxShadow="0 2px 14px rgba(0,51,102,.07)";}}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:"1.6rem",fontWeight:800,color:s.color,lineHeight:1}}>{s.value}</div>
              <div style={{fontSize:"0.73rem",color:MUTED,marginTop:3}}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Status filter */}
      <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14}}>
        {([["ALL","ทั้งหมด"],["not_started","ยังไม่เริ่ม"],["in_progress","กำลังดำเนินการ"],["on_hold","หยุดชั่วคราว"],["completed","เสร็จแล้ว"],["cancelled","ยกเลิก"]] as [string,string][]).map(([key,label])=>{
          const active=filterStatus===key;
          const cnt=key==="ALL"?data.length:data.filter(p=>p.status===key).length;
          const c=key==="ALL"?{bg:"#dce5f0",text:PRIMARY}:projectStatusColor[key as ProjectStatus]??{bg:"#dce5f0",text:PRIMARY};
          return (
            <button key={key} onClick={()=>{setFilterStatus(key as ProjectStatus|"ALL");setPage(1);}}
              style={{padding:"5px 14px",borderRadius:99,border:`1px solid ${active?c.text+"60":BORDER}`,background:active?c.bg:"#fff",color:active?c.text:MUTED,fontSize:"0.73rem",fontWeight:600,cursor:"pointer",transition:"all .12s"}}>
              {label} ({cnt})
            </button>
          );
        })}
      </div>

      {/* Main content */}
      <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={CARD}>
            {/* Toolbar */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",borderBottom:`1px solid ${BORDER}`,flexWrap:"wrap",gap:8}}>
              <div style={{display:"flex",alignItems:"center",gap:8,background:"#fafafa",border:`1px solid ${BORDER}`,borderRadius:10,padding:"7px 12px",minWidth:240}}>
                <Search size={13} color={MUTED}/>
                <input value={query} onChange={e=>{setQuery(e.target.value);setPage(1);}} placeholder="ค้นหาโครงการ / ลูกค้า..."
                  style={{border:"none",outline:"none",fontSize:"0.8rem",color:STEEL,background:"transparent",flex:1}}/>
                {query&&<button onClick={()=>{setQuery("");setPage(1);}} style={{background:"none",border:"none",cursor:"pointer",padding:0,color:MUTED,display:"flex"}}><X size={12}/></button>}
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <div style={{display:"flex",background:"#f4f6f9",borderRadius:10,padding:3,border:`1px solid ${BORDER}`}}>
                  {(["table","card"] as const).map(v=>(
                    <button key={v} onClick={()=>{setViewMode(v);if(v==="card")setSelectedId(null);}}
                      style={{width:32,height:30,borderRadius:8,border:"none",background:viewMode===v?"#fff":"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:viewMode===v?"0 1px 4px rgba(0,0,0,.09)":"none"}}>
                      {v==="table"
                        ?<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={viewMode==="table"?PRIMARY:MUTED} strokeWidth={2}><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                        :<svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke={viewMode==="card"?PRIMARY:MUTED} strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>}
                    </button>
                  ))}
                </div>
                <button onClick={openAdd} style={{width:34,height:34,borderRadius:10,background:PRIMARY,border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <Plus size={16} color="#fff"/>
                </button>
                <span style={{fontSize:"0.72rem",color:MUTED}}>{filtered.length} รายการ</span>
              </div>
            </div>

            {/* TABLE VIEW */}
            {viewMode==="table"&&(
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{borderBottom:`1px solid ${BORDER}`,background:"#f8f9fb"}}>
                      <th style={{...SH,width:36,cursor:"default"}}>#</th>
                      <th style={SH} onClick={()=>toggleSort("title")}><span style={{display:"inline-flex",alignItems:"center"}}>ชื่อโครงการ{sortKey==="title"?(sortAsc?<ChevronUp size={10}/>:<ChevronDown size={10}/>):<ChevronDown size={10} opacity={0.3}/>}</span></th>
                      <th style={{...SH,cursor:"default"}}>ลูกค้า</th>
                      <th style={SH} onClick={()=>toggleSort("status")}><span style={{display:"inline-flex",alignItems:"center"}}>สถานะ{sortKey==="status"?(sortAsc?<ChevronUp size={10}/>:<ChevronDown size={10}/>):<ChevronDown size={10} opacity={0.3}/>}</span></th>
                      <th style={SH} onClick={()=>toggleSort("progress")}><span style={{display:"inline-flex",alignItems:"center"}}>ความคืบหน้า{sortKey==="progress"?(sortAsc?<ChevronUp size={10}/>:<ChevronDown size={10}/>):<ChevronDown size={10} opacity={0.3}/>}</span></th>
                      <th style={SH} onClick={()=>toggleSort("due")}><span style={{display:"inline-flex",alignItems:"center"}}>วันสิ้นสุด{sortKey==="due"?(sortAsc?<ChevronUp size={10}/>:<ChevronDown size={10}/>):<ChevronDown size={10} opacity={0.3}/>}</span></th>
                      <th style={{...SH,cursor:"default"}}>งบประมาณ</th>
                      <th style={{...SH,width:90,cursor:"default"}}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length===0?(
                      <tr><td colSpan={8} style={{padding:"56px 20px",textAlign:"center"}}>
                        <div style={{fontSize:"0.9rem",fontWeight:700,color:MUTED,marginBottom:4}}>ไม่พบโครงการ</div>
                        <div style={{fontSize:"0.75rem",color:MUTED,opacity:0.6}}>ลองปรับเงื่อนไขการค้นหาหรือตัวกรอง</div>
                      </td></tr>
                    ):pageSlice.map((p,rowIdx)=>{
                      const isCom=p.status==="completed"; const isSel=selectedId===p.id;
                      const gi=(safePage-1)*PAGE_SIZE+rowIdx+1;
                      return (
                        <tr key={p.id} onClick={()=>setSelectedId(isSel?null:p.id)}
                          style={{borderBottom:"1px solid #f0f4f8",cursor:"pointer",background:isSel?"#f0f5ff":"transparent",transition:"background .1s",opacity:isCom?0.65:1}}
                          onMouseEnter={e=>{if(!isSel)(e.currentTarget as HTMLElement).style.background="#f8f9fb";}}
                          onMouseLeave={e=>{if(!isSel)(e.currentTarget as HTMLElement).style.background="transparent";}}>
                          <td style={{padding:"12px 8px 12px 16px",textAlign:"center",fontSize:"0.75rem",color:MUTED,fontWeight:600}}>{gi}</td>
                          <td style={{padding:"12px 14px"}}>
                            <div style={{fontSize:"0.84rem",fontWeight:700,color:STEEL,marginBottom:2,textDecoration:isCom?"line-through":"none"}}>{p.title}</div>
                            <div style={{fontSize:"0.69rem",color:MUTED}}>เริ่ม {fmtDate(p.start)}</div>
                          </td>
                          <td style={{padding:"12px 14px"}}>
                            <button onClick={e=>{e.stopPropagation();router.push(`/customers/${p.customerId}`);}} style={{background:"none",border:"none",cursor:"pointer",color:STEEL,fontSize:"0.8rem",fontWeight:600,padding:0,textAlign:"left"}}>{p.client}</button>
                          </td>
                          <td style={{padding:"12px 14px"}}><StatusBadge status={p.status}/></td>
                          <td style={{padding:"12px 14px",minWidth:150}}>
                            <ProgressBar value={calcProgress(p.id)}/>
                            {(()=>{const s=taskSummary(p.id);return s.total>0?<div style={{fontSize:"0.62rem",color:MUTED,marginTop:3}}>{s.done}/{s.total} งาน</div>:null;})()}
                          </td>
                          <td style={{padding:"12px 14px",fontSize:"0.77rem",color:MUTED,whiteSpace:"nowrap"}}>{fmtDate(p.due)}</td>
                          <td style={{padding:"12px 14px",fontSize:"0.8rem",fontWeight:700,color:STEEL,whiteSpace:"nowrap"}}>{p.value}</td>
                          <td style={{padding:"12px 12px"}} onClick={e=>e.stopPropagation()}>
                            <div style={{display:"flex",gap:5,justifyContent:"flex-end"}}>
                              <button onClick={()=>router.push(`/projects/${p.id}`)} title="ดูรายละเอียด"
                                style={{width:29,height:29,borderRadius:8,border:`1px solid ${BORDER}`,background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:MUTED}}
                                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="#dce5f0";(e.currentTarget as HTMLElement).style.borderColor=PRIMARY;(e.currentTarget as HTMLElement).style.color=PRIMARY;}}
                                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="#fff";(e.currentTarget as HTMLElement).style.borderColor=BORDER;(e.currentTarget as HTMLElement).style.color=MUTED;}}>
                                <ExternalLink size={12}/>
                              </button>
                              <button onClick={()=>openEdit(p)} title="แก้ไข"
                                style={{width:29,height:29,borderRadius:8,border:`1px solid ${BORDER}`,background:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:MUTED}}
                                onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="#dce5f0";(e.currentTarget as HTMLElement).style.borderColor=PRIMARY;(e.currentTarget as HTMLElement).style.color=PRIMARY;}}
                                onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="#fff";(e.currentTarget as HTMLElement).style.borderColor=BORDER;(e.currentTarget as HTMLElement).style.color=MUTED;}}>
                                <Edit2 size={12}/>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* CARD VIEW */}
            {viewMode==="card"&&(
              <div style={{padding:16}}>
                {filtered.length===0?(
                  <div style={{textAlign:"center",padding:"56px 20px"}}>
                    <div style={{fontSize:"0.9rem",fontWeight:700,color:MUTED,marginBottom:4}}>ไม่พบโครงการ</div>
                  </div>
                ):(
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:12}}>
                    {pageSlice.map(p=>(
                      <GridCard key={p.id} project={p} selected={selectedId===p.id}
                        onClick={()=>setSelectedId(selectedId===p.id?null:p.id)}/>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",borderTop:`1px solid ${BORDER}`}}>
              <div style={{fontSize:"0.73rem",color:MUTED}}>
                {filtered.length>0?`แสดง ${rangeStart}–${rangeEnd} จาก ${filtered.length} รายการ`:"ไม่มีข้อมูล"}
              </div>
              <div style={{display:"flex",gap:4}}>
                <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={safePage<=1}
                  style={{width:30,height:30,borderRadius:8,border:`1px solid ${BORDER}`,background:"#fff",color:safePage<=1?MUTED:STEEL,cursor:safePage<=1?"default":"pointer",fontSize:"0.85rem",fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center"}}>‹</button>
                {Array.from({length:totalPages},(_,i)=>i+1).map(pg=>(
                  <button key={pg} onClick={()=>setPage(pg)}
                    style={{width:30,height:30,borderRadius:8,border:`1px solid ${pg===safePage?PRIMARY:BORDER}`,background:pg===safePage?PRIMARY:"#fff",color:pg===safePage?"#fff":STEEL,cursor:"pointer",fontSize:"0.8rem",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {pg}
                  </button>
                ))}
                <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={safePage>=totalPages}
                  style={{width:30,height:30,borderRadius:8,border:`1px solid ${BORDER}`,background:"#fff",color:safePage>=totalPages?MUTED:STEEL,cursor:safePage>=totalPages?"default":"pointer",fontSize:"0.85rem",fontWeight:600,display:"flex",alignItems:"center",justifyContent:"center"}}>›</button>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        {selectedProject&&(
          <DetailPanel
            project={selectedProject}
            onClose={()=>setSelectedId(null)}
            onEdit={()=>openEdit(selectedProject)}
            onChangeStatus={(s)=>changeStatus(selectedProject.id,s)}
            onDelete={deleteProject}/>
        )}
      </div>

      {showModal&&(
        <ProjectModal
          title={editingProj?"แก้ไขโครงการ":"เพิ่มโครงการใหม่"}
          initial={editingProj?toForm(editingProj):blankForm()}
          onSave={saveProject} onClose={()=>setShowModal(false)}/>
      )}
    </div>
  );
}
