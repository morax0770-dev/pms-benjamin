"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  quotations as INIT_Q, customers, projects, leads,
  quotationStatusLabel, quotationStatusColor,
  projectStatusLabel, projectStatusColor,
  type QuotationStatus, type QuotationMock,
} from "@/lib/mock";
import {
  Plus, Search, X, FileText,
  Download, Edit2, Trash2, ChevronDown,
  Building2, ExternalLink, ArrowRight, SlidersHorizontal,
  MoreHorizontal, Calendar,
} from "lucide-react";

// ── Tokens ─────────────────────────────────────────────────────
const PRIMARY = "#003366";
const STEEL   = "#2D2D2D";
const BORDER  = "#e5e7eb";
const MUTED   = "#6b7280";

const STATUS_ORDER: QuotationStatus[] = ["draft","approved","sent_to_client","won","lost","expired","rejected","pending_hq"];

const STATUS_ACTIONS: Record<QuotationStatus,{label:string;next:QuotationStatus;bg:string;color:string;hqOnly?:boolean}[]> = {
  draft:          [{label:"อนุมัติใบเสนอราคา", next:"approved", bg:"#e5faf0", color:"#22c55e"}],
  pending_hq:     [
    {label:"✓ อนุมัติ (HQ)", next:"approved",  bg:"#e5faf0", color:"#22c55e", hqOnly:true},
    {label:"ปฏิเสธ (HQ)",    next:"rejected",  bg:"#fdeaed", color:"#f04d6a", hqOnly:true},
  ],
  approved:       [
    {label:"ส่งให้ลูกค้า",  next:"sent_to_client", bg:"#dce5f0", color:PRIMARY},
    {label:"หมดอายุ",        next:"expired",        bg:"#f0f0f5", color:"#6b7280"},
  ],
  sent_to_client: [
    {label:"ลูกค้ายืนยัน → ปิดการขาย ✓", next:"won",  bg:"#e5faf0", color:"#22c55e"},
    {label:"ลูกค้าปฏิเสธ",                 next:"lost", bg:"#fdeaed", color:"#f04d6a"},
  ],
  won:      [],
  lost:     [{label:"เปิดร่างใหม่", next:"draft", bg:"#f0f0f5", color:"#6b7280"}],
  rejected: [{label:"เปิดร่างใหม่", next:"draft", bg:"#f0f0f5", color:"#6b7280"}],
  expired:  [{label:"เปิดร่างใหม่", next:"draft", bg:"#f0f0f5", color:"#6b7280"}],
};

// ── Types ──────────────────────────────────────────────────────
type SortKey = "id"|"customer"|"project"|"totalValue"|"date"|"status";
type SortDir = "asc"|"desc";
type QForm = {
  customerId:number; customer:string;
  project:string; projectId:number;
  province:string; buildingType:string; area:number;
  materialCost:number;
  status:QuotationStatus; date:string; items:number;
};

const BUILDING_TYPES = ["โกดังสินค้า","โรงงาน","งานตามแบบ","อาคารพาณิชย์","เกษตรกรรม","อื่นๆ"];

// ── Helpers ────────────────────────────────────────────────────
function fmtMoney(v:number){ return "฿"+v.toLocaleString("th-TH"); }
function fmtDate(d:string){ if(!d||d==="—") return "—"; const [y,m,day]=d.split("-"); const mo=["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."]; return `${parseInt(day)} ${mo[parseInt(m)-1]} ${parseInt(y)+543}`; }
function nextQId(data:QuotationMock[]){
  const nums = data.map(q=>parseInt(q.id.split("-")[2]??"")||0);
  return `Q-2026-${String(Math.max(...nums,100)+1).padStart(4,"0")}`;
}
function exportCSV(rows:QuotationMock[]){
  const header=["เลขที่","ลูกค้า","โครงการ","จังหวัด","ประเภท","พื้นที่","มูลค่ารวม","สถานะ","วันที่"];
  const lines=rows.map(q=>[q.id,q.customer,q.project,q.province,q.buildingType,q.area,q.totalValue,quotationStatusLabel[q.status],q.date].join(","));
  const blob=new Blob(["﻿"+[header.join(","),...lines].join("\n")],{type:"text/csv;charset=utf-8;"});
  const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="quotations.csv"; a.click(); URL.revokeObjectURL(url);
}

const AVATAR_COLORS = ["#4299e1","#0d9488","#f59e0b","#f04d6a","#22c55e","#003366","#64748b","#8b5cf6"];
function avatarColor(name:string){ return AVATAR_COLORS[name.charCodeAt(0)%AVATAR_COLORS.length]; }
function initials(name:string){ const w=name.trim().split(/\s+/); return w.length>=2?(w[0][0]+w[1][0]).toUpperCase():name.substring(0,2).toUpperCase(); }

const STATUS_DOT: Record<QuotationStatus,string> = {
  draft:"#9ca3af", pending_hq:"#9ca3af", approved:"#22c55e",
  won:"#22c55e", sent_to_client:"#4299e1", lost:"#f04d6a",
  rejected:"#f04d6a", expired:"#f59e0b",
};

// ── Add / Edit Modal ───────────────────────────────────────────
const TODAY = "2026-06-23";
function buildBlank(): QForm {
  const c=customers[0];
  return { customerId:c.id, customer:c.company, project:"", projectId:0, province:c.province, buildingType:"โกดังสินค้า", area:0, materialCost:0, status:"draft", date:TODAY, items:0 };
}

function QuotationModal({ initial, title, onSave, onClose }:{
  initial:QForm; title:string; onSave:(f:QForm)=>void; onClose:()=>void;
}){
  const [form,setForm]=useState<QForm>(initial);
  const INP:React.CSSProperties={width:"100%",border:`1px solid ${BORDER}`,borderRadius:9,padding:"8px 12px",fontSize:"0.82rem",outline:"none",color:STEEL,boxSizing:"border-box"};
  const LBL:React.CSSProperties={fontSize:"0.68rem",fontWeight:700,color:MUTED,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.04em"};
  function set<K extends keyof QForm>(k:K,v:QForm[K]){setForm(p=>({...p,[k]:v}));}
  const total=form.materialCost;
  function pickCustomer(id:number){
    const c=customers.find(c=>c.id===id);
    if(!c) return;
    setForm(p=>({...p,customerId:c.id,customer:c.company,province:p.province||c.province}));
  }
  function submit(){if(!form.customer||!form.project)return; onSave(form); onClose();}
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(45,45,45,.4)",zIndex:200}}/>
      <div onClick={e=>e.stopPropagation()} style={{position:"fixed",inset:0,zIndex:210,display:"flex",alignItems:"center",justifyContent:"center",padding:20,pointerEvents:"none"}}>
        <div style={{background:"#fff",borderRadius:16,border:`1px solid ${BORDER}`,boxShadow:"0 24px 80px rgba(0,51,102,.2)",width:"100%",maxWidth:580,pointerEvents:"auto",overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 22px",borderBottom:`1px solid ${BORDER}`,background:PRIMARY}}>
            <div style={{fontSize:"0.92rem",fontWeight:800,color:"#fff"}}>{title}</div>
            <button onClick={onClose} style={{width:28,height:28,borderRadius:8,border:"1px solid rgba(255,255,255,.2)",background:"rgba(255,255,255,.1)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={13}/></button>
          </div>
          <div style={{padding:"20px 22px",overflowY:"auto",maxHeight:"68vh",display:"flex",flexDirection:"column",gap:14}}>
            <div>
              <label style={LBL}>ลูกค้า *</label>
              <select value={form.customerId} onChange={e=>pickCustomer(Number(e.target.value))} style={INP}>
                {customers.map(c=><option key={c.id} value={c.id}>{c.company}</option>)}
                <option value={0}>— อื่นๆ (พิมพ์เอง) —</option>
              </select>
              {form.customerId===0&&<input value={form.customer} onChange={e=>set("customer",e.target.value)} placeholder="ชื่อบริษัท..." style={{...INP,marginTop:6}}/>}
            </div>
            <div>
              <label style={LBL}>ชื่อโครงการ *</label>
              <input value={form.project} onChange={e=>set("project",e.target.value)} placeholder="เช่น โกดังสินค้า ABC" style={INP}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div><label style={LBL}>จังหวัด</label><input value={form.province} onChange={e=>set("province",e.target.value)} placeholder="จังหวัด" style={INP}/></div>
              <div><label style={LBL}>ประเภทอาคาร</label><select value={form.buildingType} onChange={e=>set("buildingType",e.target.value)} style={INP}>{BUILDING_TYPES.map(t=><option key={t}>{t}</option>)}</select></div>
              <div><label style={LBL}>พื้นที่ (ตร.ม.)</label><input type="number" value={form.area||""} onChange={e=>set("area",Number(e.target.value))} placeholder="0" style={INP}/></div>
              <div><label style={LBL}>จำนวนรายการ</label><input type="number" value={form.items||""} onChange={e=>set("items",Number(e.target.value))} placeholder="0" style={INP}/></div>
              <div><label style={LBL}>มูลค่า (บาท)</label><input type="number" value={form.materialCost||""} onChange={e=>set("materialCost",Number(e.target.value))} placeholder="0" style={INP}/></div>
            </div>
            {total>0&&<div style={{padding:"10px 14px",background:"#dce5f0",borderRadius:10,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:"0.72rem",fontWeight:700,color:MUTED}}>มูลค่ารวม (คำนวณ)</span>
              <span style={{fontSize:"1.05rem",fontWeight:800,color:PRIMARY}}>{fmtMoney(total)}</span>
            </div>}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div><label style={LBL}>สถานะ</label><select value={form.status} onChange={e=>set("status",e.target.value as QuotationStatus)} style={INP}>{STATUS_ORDER.map(s=><option key={s} value={s}>{quotationStatusLabel[s]}</option>)}</select></div>
              <div><label style={LBL}>วันที่</label><input type="date" value={form.date} onChange={e=>set("date",e.target.value)} style={INP}/></div>
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

// ── Main Page ──────────────────────────────────────────────────
export default function QuotationsPage(){
  const router = useRouter();
  const [data, setData]             = useState<QuotationMock[]>(INIT_Q);
  const [query, setQuery]           = useState("");
  const [filterStatus, setFilterStatus] = useState<QuotationStatus|"ALL">("ALL");
  const [sortKey, setSortKey]       = useState<SortKey>("date");
  const [sortDir, setSortDir]       = useState<SortDir>("desc");
  const [detailId, setDetailId]     = useState<string|null>(null);
  const [showModal, setShowModal]   = useState(false);
  const [editingQ, setEditingQ]     = useState<QuotationMock|null>(null);
  const [delConfirm, setDelConfirm] = useState(false);
  const [detailTab, setDetailTab]   = useState<"info"|"customer"|"project"|"lead">("info");
  const [checked, setChecked]       = useState<Set<string>>(new Set());
  const [showMoreMenu, setShowMoreMenu] = useState<string|null>(null);

  const selected = useMemo(()=> detailId ? data.find(q=>q.id===detailId)??null : null, [detailId,data]);

  function handleSort(k:SortKey){ if(sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else{setSortKey(k);setSortDir("asc");} }

  const filtered = useMemo(()=>{
    let rows=data.filter(q=>{
      const matchQ=!query||q.id.toLowerCase().includes(query.toLowerCase())||q.customer.toLowerCase().includes(query.toLowerCase())||q.project.toLowerCase().includes(query.toLowerCase())||q.province?.includes(query);
      const matchS=filterStatus==="ALL"||q.status===filterStatus;
      return matchQ&&matchS;
    });
    rows=[...rows].sort((a,b)=>{
      const va=a[sortKey] as string|number;
      const vb=b[sortKey] as string|number;
      const cmp=typeof va==="number"?(va as number)-(vb as number):(va as string).localeCompare(vb as string,"th");
      return sortDir==="asc"?cmp:-cmp;
    });
    return rows;
  },[data,query,filterStatus,sortKey,sortDir]);

  // Stats
  const countPending  = data.filter(q=>q.status==="sent_to_client").length;
  const countFailed   = data.filter(q=>["lost","rejected","expired"].includes(q.status)).length;
  const countSuccess  = data.filter(q=>["won","approved"].includes(q.status)).length;
  const totalWonVal   = data.filter(q=>q.status==="won").reduce((s,q)=>s+q.totalValue,0);

  const STATS = [
    { label:"ใบเสนอราคาทั้งหมด", value:data.length, sub:"รายการ", change:"+8%", up:true, filter:"ALL" as "ALL"|QuotationStatus },
    { label:"รอดำเนินการ",        value:countPending, sub:"รายการ", change:"+6%", up:true, filter:"sent_to_client" as QuotationStatus },
    { label:"ไม่สำเร็จ",          value:countFailed,  sub:"รายการ", change:"-16%", up:false, filter:"lost" as QuotationStatus },
    { label:"สำเร็จ",             value:countSuccess, sub:`฿${(totalWonVal/1e6).toFixed(1)}M`, change:"+12%", up:true, filter:"won" as QuotationStatus },
  ];

  // Related data for detail panel
  const relCustomer  = selected ? customers.find(c=>c.id===selected.customerId) : null;
  const relProject   = selected ? projects.find(p=>p.id===selected.projectId) : null;
  const relLead      = selected ? leads.find(l=>l.company===selected.customer) : null;

  function openAdd(){ setEditingQ(null); setShowModal(true); }
  function openEdit(q:QuotationMock){ setEditingQ(q); setShowModal(true); setShowMoreMenu(null); }

  function saveQ(form:QForm){
    const tv=form.materialCost;
    const total=fmtMoney(tv);
    if(editingQ){
      setData(p=>p.map(q=>q.id===editingQ.id?{...q,...form,total,totalValue:tv}:q));
      if(detailId===editingQ.id) setDetailId(editingQ.id);
    } else {
      const newQ:QuotationMock={...form,id:nextQId(data),total,totalValue:tv};
      setData(p=>[newQ,...p]);
    }
  }
  function changeStatus(id:string,s:QuotationStatus){
    setData(p=>p.map(q=>q.id===id?{...q,status:s}:q));
  }
  function deleteQ(){
    if(!selected) return;
    setData(p=>p.filter(q=>q.id!==selected.id));
    setDetailId(null); setDelConfirm(false);
  }

  function toggleCheck(id:string){
    setChecked(prev=>{ const n=new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });
  }
  function toggleAll(){
    if(checked.size===filtered.length) setChecked(new Set());
    else setChecked(new Set(filtered.map(q=>q.id)));
  }

  function toForm(q:QuotationMock):QForm{
    return {customerId:q.customerId,customer:q.customer,project:q.project,projectId:q.projectId??0,province:q.province,buildingType:q.buildingType,area:q.area,materialCost:q.materialCost,status:q.status,date:q.date,items:q.items};
  }

  const allChecked = filtered.length>0 && checked.size===filtered.length;
  const someChecked = checked.size>0 && checked.size<filtered.length;
  const detailTabs:[string,string][]=[["info","ข้อมูล"],["customer","ลูกค้า"],["project","โครงการ"],["lead","ลีด"]];

  return (
    <div style={{display:"flex",gap:16,alignItems:"flex-start"}} onClick={()=>setShowMoreMenu(null)}>

      {/* ══ MAIN ══════════════════════════════════════════════ */}
      <div style={{flex:1,minWidth:0}}>

        {/* Page header */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:22,flexWrap:"wrap",gap:12}}>
          <div>
            <h1 style={{fontSize:"1.65rem",fontWeight:800,color:STEEL,lineHeight:1.2,margin:0}}>ใบเสนอราคา</h1>
            <div style={{fontSize:"0.76rem",color:MUTED,marginTop:4}}>จัดการและติดตามใบเสนอราคาทุกรายการ</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={()=>exportCSV(filtered)}
              style={{display:"flex",alignItems:"center",gap:6,padding:"9px 16px",borderRadius:10,border:`1px solid ${BORDER}`,background:"#fff",color:STEEL,fontSize:"0.78rem",fontWeight:600,cursor:"pointer",boxShadow:"0 1px 3px rgba(0,0,0,.06)"}}>
              <Download size={13}/> ส่งออก
            </button>
            <button onClick={openAdd}
              style={{display:"flex",alignItems:"center",gap:6,padding:"9px 18px",borderRadius:10,border:"none",background:PRIMARY,color:"#fff",fontSize:"0.78rem",fontWeight:700,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,51,102,.25)"}}>
              <Plus size={14}/> เพิ่มใบเสนอราคา
            </button>
          </div>
        </div>

        {/* ── Stat cards (Voltra style) ── */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
          {STATS.map((s,i)=>(
            <div key={i} onClick={()=>setFilterStatus(s.filter)}
              style={{background:"#fff",borderRadius:16,border:`1.5px solid ${filterStatus===s.filter?"#003366":"#e5e7eb"}`,padding:"20px 22px",cursor:"pointer",transition:"border .15s, box-shadow .15s",boxShadow:filterStatus===s.filter?"0 4px 20px rgba(0,51,102,.12)":"0 1px 4px rgba(0,0,0,.04)"}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.boxShadow="0 4px 20px rgba(0,51,102,.1)";}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.boxShadow=filterStatus===s.filter?"0 4px 20px rgba(0,51,102,.12)":"0 1px 4px rgba(0,0,0,.04)";}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                <span style={{fontSize:"0.72rem",fontWeight:600,color:"#9ca3af"}}>{s.label}</span>
                <FileText size={14} color="#d1d5db"/>
              </div>
              <div style={{fontSize:"2.4rem",fontWeight:900,color:STEEL,lineHeight:1,marginBottom:12,letterSpacing:"-0.02em"}}>
                {s.value.toLocaleString()}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:"0.7rem",color:"#9ca3af"}}>{s.sub}</span>
                <span style={{padding:"2px 8px",borderRadius:99,fontSize:"0.68rem",fontWeight:700,background:s.up?"#e5faf0":"#fdeaed",color:s.up?"#15803d":"#b91c1c"}}>
                  {s.up?"↑":"↓"} {s.change.replace(/[+-]/,"")}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filter toolbar (Voltra style) ── */}
        <div style={{background:"#fff",borderRadius:"14px 14px 0 0",border:`1px solid ${BORDER}`,borderBottom:"none",padding:"14px 16px",display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
          {/* Search */}
          <div style={{display:"flex",alignItems:"center",gap:8,background:"#f9fafb",border:`1px solid ${BORDER}`,borderRadius:10,padding:"8px 14px",flex:1,minWidth:220}}>
            <Search size={14} color={MUTED}/>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ค้นหาเลขที่ / ลูกค้า / โครงการ..."
              style={{border:"none",outline:"none",fontSize:"0.8rem",color:STEEL,background:"transparent",flex:1}}/>
            {query&&<button onClick={()=>setQuery("")} style={{background:"none",border:"none",cursor:"pointer",padding:0,color:MUTED,display:"flex"}}><X size={12}/></button>}
          </div>

          {/* Status dropdown */}
          <div style={{position:"relative",display:"inline-flex",alignItems:"center"}}>
            <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value as "ALL"|QuotationStatus)}
              style={{padding:"8px 36px 8px 14px",borderRadius:10,border:`1px solid ${BORDER}`,background:"#fff",fontSize:"0.8rem",color:"#374151",fontWeight:500,cursor:"pointer",outline:"none",WebkitAppearance:"none",appearance:"none"}}>
              <option value="ALL">ทุกสถานะ</option>
              {STATUS_ORDER.map(s=><option key={s} value={s}>{quotationStatusLabel[s]}</option>)}
            </select>
            <ChevronDown size={14} color={MUTED} style={{position:"absolute",right:10,pointerEvents:"none"}}/>
          </div>

          {/* Date range display */}
          <div style={{display:"flex",alignItems:"center",gap:7,padding:"8px 14px",borderRadius:10,border:`1px solid ${BORDER}`,background:"#fff",fontSize:"0.78rem",color:"#374151",cursor:"default",whiteSpace:"nowrap"}}>
            <Calendar size={13} color={MUTED}/>
            <span>ม.ค. – ธ.ค. 2569</span>
          </div>

          {/* More filter */}
          <button style={{display:"flex",alignItems:"center",gap:7,padding:"8px 14px",borderRadius:10,border:`1px solid ${BORDER}`,background:"#fff",fontSize:"0.78rem",color:"#374151",fontWeight:500,cursor:"pointer",whiteSpace:"nowrap"}}>
            <SlidersHorizontal size={13} color={MUTED}/>
            ตัวกรองเพิ่ม
          </button>

          <span style={{fontSize:"0.72rem",color:MUTED,marginLeft:"auto",whiteSpace:"nowrap"}}>
            {filtered.length} / {data.length} รายการ
          </span>
        </div>

        {/* ── Table ── */}
        <div style={{background:"#fff",border:`1px solid ${BORDER}`,borderTop:"none",borderRadius:"0 0 14px 14px",overflow:"hidden"}}>
          <div style={{overflowX:"auto"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{borderBottom:`1px solid ${BORDER}`,background:"#f9fafb"}}>
                  {/* Checkbox */}
                  <th style={{width:46,padding:"11px 0 11px 16px",textAlign:"left"}}>
                    <input type="checkbox" checked={allChecked} ref={el=>{if(el) el.indeterminate=someChecked;}}
                      onChange={toggleAll}
                      style={{width:15,height:15,cursor:"pointer",accentColor:PRIMARY}}/>
                  </th>
                  {([
                    {label:"ลูกค้า / โครงการ",key:"customer"},
                    {label:"เลขที่ / วันที่",  key:"id"},
                    {label:"มูลค่า",           key:"totalValue"},
                    {label:"ประเภท / พื้นที่",  key:null},
                    {label:"สถานะ",            key:"status"},
                    {label:"",                 key:null},
                  ] as {label:string;key:SortKey|null}[]).map((col,i)=>(
                    <th key={i} onClick={col.key?()=>handleSort(col.key as SortKey):undefined}
                      style={{fontSize:"0.63rem",fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.06em",padding:"11px 14px",textAlign:"left",whiteSpace:"nowrap",cursor:col.key?"pointer":"default",userSelect:"none"}}>
                      <span style={{display:"inline-flex",alignItems:"center",gap:4}}>
                        {col.label}
                        {col.key&&(sortKey===col.key
                          ? <ChevronDown size={11} style={{transform:sortDir==="asc"?"rotate(180deg)":"none",transition:"transform .15s"}}/>
                          : <ChevronDown size={11} style={{opacity:.25}}/>
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0&&(
                  <tr><td colSpan={7} style={{textAlign:"center",padding:"56px 0",color:MUTED,fontSize:"0.85rem"}}>
                    <FileText size={32} color="#e5e7eb" style={{display:"block",margin:"0 auto 10px"}}/>
                    ไม่พบใบเสนอราคา
                  </td></tr>
                )}
                {filtered.map(q=>{
                  const sc  = quotationStatusColor[q.status];
                  const dot = STATUS_DOT[q.status];
                  const isChecked = checked.has(q.id);
                  const isDetail  = detailId===q.id;
                  const perM2 = q.area>0 ? Math.round(q.totalValue/q.area) : null;
                  return (
                    <tr key={q.id}
                      style={{borderBottom:"1px solid #f3f4f6",background:isDetail?"#f0f6ff":isChecked?"#fafbff":"#fff",transition:"background .1s"}}
                      onMouseEnter={e=>{if(!isDetail&&!isChecked)(e.currentTarget as HTMLElement).style.background="#f9fafb";}}
                      onMouseLeave={e=>{if(!isDetail&&!isChecked)(e.currentTarget as HTMLElement).style.background="#fff";}}>

                      {/* Checkbox */}
                      <td style={{padding:"13px 0 13px 16px",width:46}} onClick={e=>e.stopPropagation()}>
                        <input type="checkbox" checked={isChecked} onChange={()=>toggleCheck(q.id)}
                          style={{width:15,height:15,cursor:"pointer",accentColor:PRIMARY}}/>
                      </td>

                      {/* ลูกค้า / โครงการ */}
                      <td style={{padding:"13px 14px",minWidth:200}}>
                        <div style={{display:"flex",alignItems:"center",gap:10}}>
                          <div style={{width:38,height:38,borderRadius:11,background:avatarColor(q.customer),display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:"0.78rem",flexShrink:0,letterSpacing:"-0.02em"}}>
                            {initials(q.customer)}
                          </div>
                          <div style={{minWidth:0}}>
                            <button onClick={()=>router.push(`/customers/${q.customerId}`)}
                              style={{background:"none",border:"none",cursor:"pointer",color:STEEL,fontSize:"0.84rem",fontWeight:700,padding:0,textAlign:"left",display:"block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:180}}>
                              {q.customer}
                            </button>
                            <div style={{fontSize:"0.7rem",color:MUTED,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:180}}>{q.project}</div>
                          </div>
                        </div>
                      </td>

                      {/* เลขที่ / วันที่ */}
                      <td style={{padding:"13px 14px",whiteSpace:"nowrap"}}>
                        <div style={{fontSize:"0.78rem",fontWeight:700,color:STEEL,fontFamily:"monospace"}}>{q.id}</div>
                        <div style={{fontSize:"0.68rem",color:MUTED,marginTop:2}}>{fmtDate(q.date)}</div>
                      </td>

                      {/* มูลค่า */}
                      <td style={{padding:"13px 14px",whiteSpace:"nowrap"}}>
                        <div style={{fontSize:"0.9rem",fontWeight:800,color:STEEL}}>{q.total}</div>
                        {perM2&&<div style={{fontSize:"0.68rem",color:MUTED,marginTop:2}}>฿{perM2.toLocaleString()}/ม²</div>}
                      </td>

                      {/* ประเภท / พื้นที่ */}
                      <td style={{padding:"13px 14px",whiteSpace:"nowrap"}}>
                        <div style={{fontSize:"0.78rem",color:STEEL,fontWeight:600}}>{q.buildingType}</div>
                        <div style={{fontSize:"0.68rem",color:MUTED,marginTop:2}}>{q.area?.toLocaleString()} ม²</div>
                      </td>

                      {/* สถานะ */}
                      <td style={{padding:"13px 14px"}}>
                        <span style={{display:"inline-flex",alignItems:"center",gap:6,padding:"4px 11px",borderRadius:99,fontSize:"0.7rem",fontWeight:700,background:sc.bg,color:sc.text,whiteSpace:"nowrap"}}>
                          <span style={{width:6,height:6,borderRadius:"50%",background:dot,flexShrink:0}}/>
                          {quotationStatusLabel[q.status]}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{padding:"13px 16px 13px 8px"}} onClick={e=>e.stopPropagation()}>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <button onClick={()=>{setDetailId(p=>p===q.id?null:q.id); setDetailTab("info"); setDelConfirm(false);}}
                            style={{padding:"5px 13px",borderRadius:8,border:`1px solid ${BORDER}`,background:isDetail?"#eef4ff":"#fff",color:isDetail?PRIMARY:STEEL,fontSize:"0.72rem",fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>
                            รายละเอียด
                          </button>
                          <div style={{position:"relative"}}>
                            <button onClick={e=>{e.stopPropagation(); setShowMoreMenu(p=>p===q.id?null:q.id);}}
                              style={{width:30,height:30,borderRadius:8,border:`1px solid ${BORDER}`,background:"#fff",color:MUTED,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                              <MoreHorizontal size={14}/>
                            </button>
                            {showMoreMenu===q.id&&(
                              <div onClick={e=>e.stopPropagation()} style={{position:"absolute",right:0,top:"calc(100% + 4px)",background:"#fff",border:`1px solid ${BORDER}`,borderRadius:11,boxShadow:"0 8px 24px rgba(0,0,0,.10)",zIndex:50,minWidth:150,overflow:"hidden"}}>
                                <button onClick={()=>openEdit(q)}
                                  style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 14px",border:"none",background:"none",cursor:"pointer",fontSize:"0.78rem",color:STEEL,textAlign:"left"}}
                                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="#f9fafb"}
                                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="none"}>
                                  <Edit2 size={13}/> แก้ไข
                                </button>
                                {q.status==="draft"&&(
                                  <button onClick={()=>{changeStatus(q.id,"approved"); setShowMoreMenu(null);}}
                                    style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 14px",border:"none",background:"none",cursor:"pointer",fontSize:"0.78rem",color:"#22c55e",textAlign:"left"}}
                                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="#f9fafb"}
                                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="none"}>
                                    <ArrowRight size={13}/> อนุมัติ
                                  </button>
                                )}
                                <div style={{height:1,background:BORDER,margin:"2px 0"}}/>
                                <button onClick={()=>{setDetailId(q.id); setDelConfirm(true); setShowMoreMenu(null);}}
                                  style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 14px",border:"none",background:"none",cursor:"pointer",fontSize:"0.78rem",color:"#f04d6a",textAlign:"left"}}
                                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="#fdeaed"}
                                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="none"}>
                                  <Trash2 size={13}/> ลบ
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          <div style={{padding:"12px 18px",borderTop:`1px solid ${BORDER}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
            <span style={{fontSize:"0.72rem",color:MUTED}}>
              แสดง {filtered.length} จาก {data.length} รายการ
            </span>
            {/* Pagination (visual) */}
            <div style={{display:"flex",alignItems:"center",gap:4}}>
              {[1,2,3].map(p=>(
                <button key={p} style={{width:30,height:30,borderRadius:8,border:`1px solid ${p===1?PRIMARY:BORDER}`,background:p===1?PRIMARY:"#fff",color:p===1?"#fff":MUTED,fontSize:"0.75rem",fontWeight:p===1?700:500,cursor:"pointer"}}>
                  {p}
                </button>
              ))}
              <span style={{color:MUTED,fontSize:"0.8rem",padding:"0 4px"}}>···</span>
              {[9,10,11,12].map(p=>(
                <button key={p} style={{width:30,height:30,borderRadius:8,border:`1px solid ${BORDER}`,background:"#fff",color:MUTED,fontSize:"0.75rem",fontWeight:500,cursor:"pointer"}}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ DETAIL PANEL ════════════════════════════════════ */}
      {selected&&(
        <div style={{width:334,flexShrink:0,position:"sticky",top:80,maxHeight:"calc(100vh - 100px)",overflowY:"auto"}}>
          <div style={{background:"#fff",borderRadius:16,border:`1px solid ${BORDER}`,boxShadow:"0 4px 24px rgba(0,51,102,.08)",overflow:"hidden"}}>

            {/* Panel header */}
            <div style={{background:PRIMARY,padding:"16px 16px 12px"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
                <div>
                  <div style={{fontSize:"0.64rem",fontWeight:700,color:"rgba(255,255,255,.55)",fontFamily:"monospace",letterSpacing:"0.05em"}}>{selected.id}</div>
                  <div style={{fontSize:"0.9rem",fontWeight:800,color:"#fff",lineHeight:1.25,marginTop:2,maxWidth:236,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selected.customer}</div>
                  <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,.65)",marginTop:2,maxWidth:236,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selected.project}</div>
                </div>
                <button onClick={()=>setDetailId(null)} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:8}}>
                  <X size={14}/>
                </button>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                <span style={{display:"inline-flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:99,fontSize:"0.65rem",fontWeight:700,background:quotationStatusColor[selected.status].bg,color:quotationStatusColor[selected.status].text}}>
                  <span style={{width:5,height:5,borderRadius:"50%",background:STATUS_DOT[selected.status]}}/>
                  {quotationStatusLabel[selected.status]}
                </span>
                <span style={{fontSize:"0.9rem",fontWeight:800,color:"rgba(255,255,255,.9)"}}>{selected.total}</span>
              </div>
            </div>

            {/* Tabs */}
            <div style={{display:"flex",borderBottom:`1px solid ${BORDER}`,overflowX:"auto"}}>
              {detailTabs.map(([key,label])=>(
                <button key={key} onClick={()=>setDetailTab(key as typeof detailTab)}
                  style={{padding:"9px 12px",border:"none",background:"none",cursor:"pointer",fontSize:"0.68rem",fontWeight:detailTab===key?700:500,color:detailTab===key?PRIMARY:MUTED,borderBottom:detailTab===key?`2px solid ${PRIMARY}`:"2px solid transparent",whiteSpace:"nowrap",marginBottom:-1}}>
                  {label}
                </button>
              ))}
            </div>

            {/* Tab: ข้อมูล */}
            {detailTab==="info"&&(
              <div style={{padding:"14px 16px"}}>
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:"0.63rem",fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>มูลค่า</div>
                  <div style={{padding:"12px 14px",background:"#dce5f0",borderRadius:11,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:"0.7rem",fontWeight:700,color:MUTED}}>มูลค่ารวม</span>
                    <span style={{fontSize:"1.2rem",fontWeight:800,color:PRIMARY}}>{selected.total}</span>
                  </div>
                </div>
                <div style={{fontSize:"0.63rem",fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>รายละเอียด</div>
                {[
                  {label:"จังหวัด",val:selected.province},{label:"ประเภทอาคาร",val:selected.buildingType},
                  {label:"พื้นที่",val:`${selected.area?.toLocaleString()} ตร.ม.`},{label:"จำนวนรายการ",val:`${selected.items} รายการ`},
                  {label:"วันที่",val:fmtDate(selected.date)},
                ].map((r,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<4?"1px solid #f0f4f8":"none"}}>
                    <span style={{fontSize:"0.72rem",color:MUTED,fontWeight:600}}>{r.label}</span>
                    <span style={{fontSize:"0.76rem",color:STEEL,fontWeight:700}}>{r.val}</span>
                  </div>
                ))}
                {STATUS_ACTIONS[selected.status].length>0&&(
                  <div style={{marginTop:14}}>
                    <div style={{fontSize:"0.63rem",fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>เปลี่ยนสถานะ</div>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {STATUS_ACTIONS[selected.status].map(action=>(
                        <button key={action.next} onClick={()=>changeStatus(selected.id,action.next)}
                          style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",borderRadius:10,background:action.bg,border:"none",cursor:"pointer",width:"100%"}}>
                          <span style={{fontSize:"0.76rem",fontWeight:700,color:action.color}}>{action.label}</span>
                          <ArrowRight size={13} color={action.color}/>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: ลูกค้า */}
            {detailTab==="customer"&&(
              <div style={{padding:"14px 16px"}}>
                {relCustomer?(
                  <>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                      <div style={{width:44,height:44,borderRadius:13,background:relCustomer.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:"1rem",flexShrink:0}}>
                        {relCustomer.initials}
                      </div>
                      <div>
                        <div style={{fontSize:"0.88rem",fontWeight:800,color:STEEL}}>{relCustomer.company}</div>
                        <div style={{fontSize:"0.7rem",color:MUTED,marginTop:2}}>{relCustomer.name}</div>
                      </div>
                    </div>
                    {[{label:"โทรศัพท์",val:relCustomer.phone},{label:"อีเมล",val:relCustomer.email},{label:"จังหวัด",val:relCustomer.province},{label:"หมวด",val:relCustomer.category},{label:"โครงการ",val:`${relCustomer.projectCount} โครงการ`}].map((r,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<4?"1px solid #f0f4f8":"none"}}>
                        <span style={{fontSize:"0.7rem",color:MUTED,fontWeight:600}}>{r.label}</span>
                        <span style={{fontSize:"0.75rem",color:STEEL,fontWeight:700,maxWidth:160,textAlign:"right",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.val}</span>
                      </div>
                    ))}
                    {relCustomer.tags.length>0&&(
                      <div style={{marginTop:10,display:"flex",gap:5,flexWrap:"wrap"}}>
                        {relCustomer.tags.map(t=><span key={t} style={{padding:"2px 9px",borderRadius:99,fontSize:"0.63rem",fontWeight:700,background:"#dce5f0",color:PRIMARY}}>{t}</span>)}
                      </div>
                    )}
                    <button onClick={()=>router.push(`/customers/${relCustomer.id}`)}
                      style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,width:"100%",padding:"9px 0",borderRadius:10,background:PRIMARY,color:"#fff",border:"none",fontSize:"0.76rem",fontWeight:700,cursor:"pointer",marginTop:14}}>
                      <ExternalLink size={13}/> ดูข้อมูลลูกค้าเต็ม
                    </button>
                  </>
                ):(
                  <div style={{textAlign:"center",padding:"28px 0",color:MUTED,fontSize:"0.78rem"}}>ไม่พบข้อมูลลูกค้า</div>
                )}
              </div>
            )}

            {/* Tab: โครงการ */}
            {detailTab==="project"&&(
              <div style={{padding:"14px 16px"}}>
                {relProject?(
                  <>
                    <div style={{fontSize:"0.9rem",fontWeight:800,color:STEEL,marginBottom:4}}>{relProject.title}</div>
                    <div style={{fontSize:"0.72rem",color:MUTED,marginBottom:14}}>{relProject.client}</div>
                    <div style={{marginBottom:14}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                        <span style={{fontSize:"0.7rem",color:MUTED,fontWeight:600}}>ความคืบหน้า</span>
                        <span style={{fontSize:"0.7rem",fontWeight:700,color:PRIMARY}}>{relProject.progress}%</span>
                      </div>
                      <div style={{height:6,borderRadius:99,background:"#f0f4f8",overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${relProject.progress}%`,background:PRIMARY,borderRadius:99}}/>
                      </div>
                    </div>
                    {[{label:"สถานะ",val:<span style={{padding:"2px 8px",borderRadius:99,fontSize:"0.65rem",fontWeight:700,background:projectStatusColor[relProject.status].bg,color:projectStatusColor[relProject.status].text}}>{projectStatusLabel[relProject.status]}</span>},{label:"มูลค่า",val:relProject.value},{label:"เริ่ม",val:relProject.start},{label:"ครบ",val:relProject.due}].map((r,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:i<3?"1px solid #f0f4f8":"none"}}>
                        <span style={{fontSize:"0.7rem",color:MUTED,fontWeight:600}}>{r.label}</span>
                        <span style={{fontSize:"0.75rem",color:STEEL,fontWeight:700}}>{r.val}</span>
                      </div>
                    ))}
                    <button onClick={()=>router.push(`/projects/${relProject.id}`)}
                      style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,width:"100%",padding:"9px 0",borderRadius:10,background:PRIMARY,color:"#fff",border:"none",fontSize:"0.76rem",fontWeight:700,cursor:"pointer",marginTop:14}}>
                      <ExternalLink size={13}/> ดูโครงการเต็ม
                    </button>
                  </>
                ):(
                  <div style={{textAlign:"center",padding:"28px 0",color:MUTED,fontSize:"0.78rem"}}>ไม่พบข้อมูลโครงการ</div>
                )}
              </div>
            )}

            {/* Tab: ลีด */}
            {detailTab==="lead"&&(
              <div style={{padding:"14px 16px"}}>
                {relLead?(
                  <>
                    <div style={{fontSize:"0.88rem",fontWeight:800,color:STEEL,marginBottom:2}}>{relLead.company}</div>
                    <div style={{fontSize:"0.7rem",color:MUTED,marginBottom:14}}>{relLead.contact} · {relLead.province}</div>
                    {[{label:"โทรศัพท์",val:relLead.phone},{label:"สินค้า",val:relLead.product},{label:"มูลค่า",val:relLead.value},{label:"สถานะ",val:relLead.status},{label:"ผู้รับผิดชอบ",val:relLead.assigned}].map((r,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<4?"1px solid #f0f4f8":"none"}}>
                        <span style={{fontSize:"0.7rem",color:MUTED,fontWeight:600}}>{r.label}</span>
                        <span style={{fontSize:"0.75rem",color:STEEL,fontWeight:700}}>{r.val}</span>
                      </div>
                    ))}
                    <button onClick={()=>router.push(`/leads/${relLead.numId}`)}
                      style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,width:"100%",padding:"9px 0",borderRadius:10,background:PRIMARY,color:"#fff",border:"none",fontSize:"0.76rem",fontWeight:700,cursor:"pointer",marginTop:14}}>
                      <ExternalLink size={13}/> ดูลีดเต็ม
                    </button>
                  </>
                ):(
                  <div style={{textAlign:"center",padding:"28px 0",color:MUTED,fontSize:"0.78rem"}}>ไม่พบลีดที่เกี่ยวข้อง</div>
                )}
              </div>
            )}

            {/* Footer actions */}
            <div style={{padding:"12px 14px",borderTop:`1px solid ${BORDER}`,display:"flex",flexDirection:"column",gap:6}}>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>openEdit(selected)}
                  style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"9px 0",borderRadius:10,background:PRIMARY,color:"#fff",border:"none",fontSize:"0.74rem",fontWeight:700,cursor:"pointer"}}>
                  <Edit2 size={13}/> แก้ไข
                </button>
                <button onClick={()=>{if(relProject) router.push(`/projects/${relProject.id}`);}} disabled={!relProject}
                  style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"9px 0",borderRadius:10,background:"#dce5f0",color:PRIMARY,border:"none",fontSize:"0.74rem",fontWeight:700,cursor:relProject?"pointer":"not-allowed",opacity:relProject?1:.5}}>
                  <Building2 size={13}/> โครงการ
                </button>
              </div>
              <button onClick={()=>router.push(`/customers/${selected.customerId}`)}
                style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"8px 0",borderRadius:10,background:"#f0f4f8",color:STEEL,border:`1px solid ${BORDER}`,fontSize:"0.73rem",fontWeight:700,cursor:"pointer"}}>
                <ExternalLink size={13}/> ดูลูกค้า
              </button>
              {!delConfirm?(
                <button onClick={()=>setDelConfirm(true)}
                  style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"7px 0",borderRadius:10,background:"#fff",color:"#f04d6a",border:"1px solid #fdeaed",fontSize:"0.72rem",fontWeight:700,cursor:"pointer"}}>
                  <Trash2 size={12}/> ลบใบเสนอราคา
                </button>
              ):(
                <div style={{borderRadius:10,border:"1px solid #fca5a5",overflow:"hidden"}}>
                  <div style={{padding:"7px 12px",background:"#fdeaed",fontSize:"0.7rem",color:"#f04d6a",fontWeight:600}}>ยืนยันลบ "{selected.id}"?</div>
                  <div style={{display:"flex"}}>
                    <button onClick={deleteQ} style={{flex:1,padding:"7px",background:"#f04d6a",border:"none",color:"#fff",fontSize:"0.7rem",fontWeight:700,cursor:"pointer"}}>ลบ</button>
                    <button onClick={()=>setDelConfirm(false)} style={{flex:1,padding:"7px",background:"#fff",border:"none",borderLeft:"1px solid #fca5a5",color:STEEL,fontSize:"0.7rem",cursor:"pointer"}}>ยกเลิก</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══ BULK ACTION BAR (fixed bottom) ════════════════════ */}
      {checked.size>0&&(
        <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",zIndex:100,pointerEvents:"none"}}>
          <div style={{display:"flex",alignItems:"center",gap:2,background:"#fff",border:`1px solid ${BORDER}`,borderRadius:99,boxShadow:"0 8px 32px rgba(0,0,0,.15)",padding:"6px 6px 6px 16px",pointerEvents:"auto",whiteSpace:"nowrap"}}>
            <span style={{fontSize:"0.8rem",fontWeight:700,color:STEEL,marginRight:8}}>✓ {checked.size} รายการ</span>
            <div style={{width:1,height:20,background:BORDER,margin:"0 6px"}}/>
            <button style={{padding:"6px 14px",borderRadius:99,border:`1px solid ${BORDER}`,background:"#fff",color:STEEL,fontSize:"0.75rem",fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
              <ChevronDown size={12}/> สถานะ
            </button>
            <button style={{padding:"6px 14px",borderRadius:99,border:"none",background:"#fdeaed",color:"#f04d6a",fontSize:"0.75rem",fontWeight:700,cursor:"pointer"}}>
              ลบ
            </button>
            <button onClick={()=>setChecked(new Set())}
              style={{width:32,height:32,borderRadius:99,border:`1px solid ${BORDER}`,background:"#fff",color:MUTED,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",marginLeft:4}}>
              <X size={14}/>
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal&&(
        <QuotationModal
          title={editingQ?"แก้ไขใบเสนอราคา":"เพิ่มใบเสนอราคาใหม่"}
          initial={editingQ?toForm(editingQ):buildBlank()}
          onSave={saveQ} onClose={()=>setShowModal(false)}/>
      )}
    </div>
  );
}
