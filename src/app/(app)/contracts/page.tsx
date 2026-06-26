"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  contracts as INIT_C, customers, projects, quotations, invoices,
  contractStatusLabel, contractStatusColor, quotationStatusLabel, quotationStatusColor,
  invoiceStatusLabel, invoiceStatusColor,
  type ContractStatus, type ContractMock,
} from "@/lib/mock";
import {
  Plus, Search, X, FileSignature, LayoutList, LayoutGrid,
  Download, Edit2, Trash2, ChevronUp, ChevronDown,
  ExternalLink, ArrowRight, FileText, Building2, Receipt,
} from "lucide-react";

// ── Tokens ────────────────────────────────────────────────────
const PRIMARY = "#003366";
const STEEL   = "#2D2D2D";
const BORDER  = "#cfd4dc";
const MUTED   = "#6b7280";
const CARD: React.CSSProperties = { background:"#fff", borderRadius:16, border:`1px solid ${BORDER}`, boxShadow:"0 2px 14px rgba(0,51,102,.07)" };

// ── Status workflow ───────────────────────────────────────────
const STATUS_ACTIONS: Record<ContractStatus,{label:string;next:ContractStatus;bg:string;color:string}[]> = {
  draft:     [{label:"เปิดใช้งานสัญญา",next:"active",bg:"#dbeafe",color:"#3b82f6"}],
  active:    [{label:"ส่งมอบงานแล้ว",next:"completed",bg:"#e5faf0",color:"#22c55e"},{label:"ยกเลิกสัญญา",next:"cancelled",bg:"#fdeaed",color:"#f04d6a"}],
  completed: [],
  cancelled: [{label:"เปิดร่างใหม่",next:"draft",bg:"#f0f0f5",color:"#6b7280"}],
};

const ALL_STATUSES: ContractStatus[] = ["draft","active","completed","cancelled"];
const AGENTS = ["สมชาย","วิภา","วิชัย","กาญจนา","สมชาย เชียงใหม่","วิภา รัตนกุล"];

type SortKey = "id"|"client"|"value"|"deposit"|"remaining"|"signDate"|"status";
type SortDir = "asc"|"desc";
type CForm = {
  client:string; contact:string; phone:string;
  project:string; value:number; deposit:number;
  agentName:string; signDate:string; transferDate:string;
  status:ContractStatus; quotationRef:string;
};

// ── Helpers ───────────────────────────────────────────────────
function fmt(n:number){ return "฿"+n.toLocaleString("th-TH"); }
function nextCId(data:ContractMock[]){
  const nums=data.map(c=>parseInt(c.id.split("-")[2]??"")||0);
  return `C-2026-${String(Math.max(...nums,0)+1).padStart(3,"0")}`;
}
function fmtDate(d:string){ if(!d||d==="—") return "—"; const [y,m,day]=d.split("-"); const mo=["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."]; return `${parseInt(day)} ${mo[parseInt(m)-1]} ${parseInt(y)+543}`; }
function exportCSV(rows:ContractMock[]){
  const h=["เลขที่","ลูกค้า","โครงการ","มูลค่า","มัดจำ","คงค้าง","เซลล์","วันเซ็น","วันส่งมอบ","สถานะ","ใบเสนอราคา"];
  const lines=rows.map(c=>[c.id,c.client,c.project,c.value,c.deposit,c.remaining,c.agentName,c.signDate,c.transferDate,contractStatusLabel[c.status],c.quotationRef??""].join(","));
  const blob=new Blob(["﻿"+[h.join(","),...lines].join("\n")],{type:"text/csv;charset=utf-8;"});
  const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="contracts.csv"; a.click(); URL.revokeObjectURL(url);
}

// ── Form ──────────────────────────────────────────────────────
const TODAY = "2026-06-23";
function buildBlank():CForm{
  const cu=customers[0];
  return { client:cu.company, contact:cu.name, phone:cu.phone, project:"", value:0, deposit:0, agentName:"สมชาย", signDate:TODAY, transferDate:"", status:"draft", quotationRef:"" };
}

function ContractModal({ initial, title, onSave, onClose }:{
  initial:CForm; title:string; onSave:(f:CForm)=>void; onClose:()=>void;
}){
  const [form,setForm]=useState<CForm>(initial);
  const INP:React.CSSProperties={width:"100%",border:`1px solid ${BORDER}`,borderRadius:9,padding:"8px 12px",fontSize:"0.82rem",outline:"none",color:STEEL,boxSizing:"border-box"};
  const LBL:React.CSSProperties={fontSize:"0.68rem",fontWeight:700,color:MUTED,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.04em"};
  function set<K extends keyof CForm>(k:K,v:CForm[K]){setForm(p=>({...p,[k]:v}));}
  function pickCustomer(id:number){
    const cu=customers.find(c=>c.id===id);
    if(!cu) return;
    setForm(p=>({...p,client:cu.company,contact:cu.name,phone:cu.phone}));
  }
  const remaining=Math.max(0,form.value-form.deposit);
  function submit(){if(!form.client||!form.project||form.value<=0)return; onSave({...form,deposit:Math.min(form.deposit,form.value)}); onClose();}
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(45,45,45,.4)",zIndex:200}}/>
      <div onClick={e=>e.stopPropagation()} style={{position:"fixed",inset:0,zIndex:210,display:"flex",alignItems:"center",justifyContent:"center",padding:20,pointerEvents:"none"}}>
        <div style={{...CARD,width:"100%",maxWidth:580,pointerEvents:"auto",overflow:"hidden",boxShadow:"0 24px 80px rgba(0,51,102,.2)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 22px",borderBottom:`1px solid ${BORDER}`,background:PRIMARY}}>
            <div style={{fontSize:"0.92rem",fontWeight:800,color:"#fff"}}>{title}</div>
            <button onClick={onClose} style={{width:28,height:28,borderRadius:8,border:"1px solid rgba(255,255,255,.2)",background:"rgba(255,255,255,.1)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={13}/></button>
          </div>
          <div style={{padding:"20px 22px",overflowY:"auto",maxHeight:"68vh",display:"flex",flexDirection:"column",gap:13}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{gridColumn:"1/-1"}}>
                <label style={LBL}>ลูกค้า *</label>
                <select onChange={e=>pickCustomer(Number(e.target.value))} style={INP} defaultValue="">
                  <option value="" disabled>— เลือกลูกค้า —</option>
                  {customers.map(c=><option key={c.id} value={c.id}>{c.company}</option>)}
                  <option value={0}>อื่นๆ (พิมพ์เอง)</option>
                </select>
                <input value={form.client} onChange={e=>set("client",e.target.value)} placeholder="ชื่อบริษัทลูกค้า *" style={{...INP,marginTop:6}}/>
              </div>
              <div>
                <label style={LBL}>ผู้ติดต่อ</label>
                <input value={form.contact} onChange={e=>set("contact",e.target.value)} placeholder="ชื่อผู้ติดต่อ" style={INP}/>
              </div>
              <div>
                <label style={LBL}>โทรศัพท์</label>
                <input value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="0XX-XXX-XXXX" style={INP}/>
              </div>
              <div style={{gridColumn:"1/-1"}}>
                <label style={LBL}>โครงการ *</label>
                <input value={form.project} onChange={e=>set("project",e.target.value)} placeholder="ชื่อโครงการ" style={INP}/>
              </div>
              <div>
                <label style={LBL}>มูลค่าสัญญา (บาท) *</label>
                <input type="number" value={form.value||""} onChange={e=>set("value",Number(e.target.value))} placeholder="0" style={INP}/>
              </div>
              <div>
                <label style={LBL}>มัดจำที่รับแล้ว (บาท)</label>
                <input type="number" value={form.deposit||""} onChange={e=>set("deposit",Number(e.target.value))} placeholder="0" style={INP}/>
              </div>
            </div>
            {form.value>0&&(
              <div style={{padding:"10px 14px",background:"#dce5f0",borderRadius:10,display:"flex",justifyContent:"space-between"}}>
                <span style={{fontSize:"0.72rem",color:MUTED,fontWeight:700}}>คงค้างอยู่</span>
                <span style={{fontSize:"1rem",fontWeight:800,color:remaining>0?"#f04d6a":"#22c55e"}}>{fmt(remaining)}</span>
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div>
                <label style={LBL}>เซลล์</label>
                <select value={form.agentName} onChange={e=>set("agentName",e.target.value)} style={INP}>
                  {AGENTS.map(a=><option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label style={LBL}>สถานะ</label>
                <select value={form.status} onChange={e=>set("status",e.target.value as ContractStatus)} style={INP}>
                  {ALL_STATUSES.map(s=><option key={s} value={s}>{contractStatusLabel[s]}</option>)}
                </select>
              </div>
              <div>
                <label style={LBL}>วันที่เซ็นสัญญา</label>
                <input type="date" value={form.signDate==="—"?"":form.signDate} onChange={e=>set("signDate",e.target.value||"—")} style={INP}/>
              </div>
              <div>
                <label style={LBL}>วันส่งมอบงาน</label>
                <input type="date" value={form.transferDate==="—"?"":form.transferDate} onChange={e=>set("transferDate",e.target.value||"—")} style={INP}/>
              </div>
              <div style={{gridColumn:"1/-1"}}>
                <label style={LBL}>อ้างอิงใบเสนอราคา</label>
                <input value={form.quotationRef} onChange={e=>set("quotationRef",e.target.value)} placeholder="เช่น Q-2026-0089" style={INP}/>
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

// ── Main Page ─────────────────────────────────────────────────
export default function ContractsPage(){
  const router = useRouter();
  const [data, setData]             = useState<ContractMock[]>(INIT_C);
  const [query, setQuery]           = useState("");
  const [filterStatus, setFilterStatus] = useState<ContractStatus|"ALL">("ALL");
  const [view, setView]             = useState<"list"|"card">("list");
  const [sortKey, setSortKey]       = useState<SortKey>("signDate");
  const [sortDir, setSortDir]       = useState<SortDir>("desc");
  const [selected, setSelected]     = useState<ContractMock|null>(null);
  const [showModal, setShowModal]   = useState(false);
  const [editingC, setEditingC]     = useState<ContractMock|null>(null);
  const [delConfirm, setDelConfirm] = useState(false);
  const [detailTab, setDetailTab]   = useState<"info"|"invoices"|"customer"|"project"|"quotation">("info");

  function handleSort(k:SortKey){ if(sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else{setSortKey(k);setSortDir("asc");} }
  const SortIcon=({k}:{k:SortKey})=>sortKey===k?(sortDir==="asc"?<ChevronUp size={10} style={{marginLeft:2}}/>:<ChevronDown size={10} style={{marginLeft:2}}/>):<ChevronDown size={10} style={{marginLeft:2,opacity:.3}}/>;

  const filtered = useMemo(()=>{
    let rows=data.filter(c=>{
      const matchQ=!query||c.id.toLowerCase().includes(query.toLowerCase())||c.client.toLowerCase().includes(query.toLowerCase())||c.project.toLowerCase().includes(query.toLowerCase())||c.contact.includes(query);
      const matchS=filterStatus==="ALL"||c.status===filterStatus;
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

  const activeCount    = data.filter(c=>c.status==="active").length;
  const completedCount = data.filter(c=>c.status==="completed").length;
  const totalValue     = data.reduce((s,c)=>s+c.value,0);
  const totalRemaining = data.filter(c=>c.status!=="cancelled").reduce((s,c)=>s+c.remaining,0);

  // Related data for selected contract
  const relCustomer  = selected ? customers.find(c=>c.company===selected.client) : null;
  const relProject   = selected ? projects.find(p=>p.title===selected.project) : null;
  const relQuotation = selected?.quotationRef ? quotations.find(q=>q.id===selected.quotationRef) : null;
  const relInvoices  = selected ? invoices.filter(i=>i.contractRef===selected.id) : [];

  function openAdd(){ setEditingC(null); setShowModal(true); }
  function openEdit(c:ContractMock){ setEditingC(c); setShowModal(true); }

  function saveContract(form:CForm){
    const remaining=Math.max(0,form.value-form.deposit);
    if(editingC){
      setData(p=>p.map(c=>c.id===editingC.id?{...c,...form,remaining}:c));
      setSelected(p=>p?.id===editingC.id?{...p,...form,remaining}:p);
    } else {
      setData(p=>[{...form,id:nextCId(data),remaining},...p]);
    }
  }
  function changeStatus(id:string,s:ContractStatus){
    setData(p=>p.map(c=>c.id===id?{...c,status:s}:c));
    setSelected(p=>p?.id===id?{...p,status:s}:p);
  }
  function deleteContract(){
    if(!selected) return;
    setData(p=>p.filter(c=>c.id!==selected.id));
    setSelected(null); setDelConfirm(false);
  }
  function selectRow(c:ContractMock){ setSelected(p=>p?.id===c.id?null:c); setDetailTab("info"); setDelConfirm(false); }

  function toForm(c:ContractMock):CForm{
    return {client:c.client,contact:c.contact,phone:c.phone,project:c.project,value:c.value,deposit:c.deposit,agentName:c.agentName,signDate:c.signDate,transferDate:c.transferDate,status:c.status,quotationRef:c.quotationRef??""};
  }

  const dtabs:[string,string,number?][]=[
    ["info","ข้อมูล"],
    ["invoices",`ใบแจ้งหนี้`,relInvoices.length],
    ["customer","ลูกค้า"],
    ["project","โครงการ"],
    ["quotation","ใบเสนอราคา"],
  ];

  return (
    <div style={{display:"flex",gap:16,alignItems:"flex-start"}}>

      {/* ══ MAIN ════════════════════════════════════════════ */}
      <div style={{flex:1,minWidth:0}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
          <div>
            <h1 style={{fontSize:"1.55rem",fontWeight:800,color:STEEL,lineHeight:1.2,margin:0}}>สัญญา</h1>
            <div style={{fontSize:"0.76rem",color:MUTED,marginTop:4}}>จัดการสัญญาโครงการทั้งหมด</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={()=>exportCSV(filtered)}
              style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:99,border:`1px solid ${BORDER}`,background:"#fff",color:STEEL,fontSize:"0.75rem",fontWeight:600,cursor:"pointer"}}>
              <Download size={13}/> ส่งออก
            </button>
            <button onClick={openAdd}
              style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:99,border:"none",background:PRIMARY,color:"#fff",fontSize:"0.75rem",fontWeight:700,cursor:"pointer",boxShadow:"0 4px 10px rgba(0,51,102,.22)"}}>
              <Plus size={13}/> เพิ่มสัญญา
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
          {[
            {label:"สัญญาทั้งหมด",  value:data.length,         color:"#003366", key:"ALL"},
            {label:"กำลังดำเนินการ", value:activeCount,         color:"#3b82f6", key:"active"},
            {label:"ส่งมอบแล้ว",    value:completedCount,       color:"#22c55e", key:"completed"},
            {label:"คงค้างทั้งหมด", value:`฿${(totalRemaining/1e6).toFixed(1)}M`, color:"#f04d6a", key:null},
          ].map((s,i)=>(
            <div key={i} onClick={()=>s.key!==null?setFilterStatus(s.key as "ALL"|ContractStatus):undefined}
              style={{...CARD,padding:"14px 16px",cursor:s.key!==null?"pointer":"default"}}
              onMouseEnter={e=>{if(s.key!==null)(e.currentTarget as HTMLElement).style.boxShadow="0 4px 16px rgba(0,51,102,.12)";}}
              onMouseLeave={e=>{if(s.key!==null)(e.currentTarget as HTMLElement).style.boxShadow="0 2px 14px rgba(0,51,102,.07)";}}>
              <div style={{fontSize:"0.7rem",color:MUTED,fontWeight:600,marginBottom:6}}>{s.label}</div>
              <div style={{fontSize:typeof s.value==="number"?"1.5rem":"1.1rem",fontWeight:800,color:s.color}}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Status filter */}
        <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
          {([["ALL","ทั้งหมด",data.length] as const,...ALL_STATUSES.map(s=>[s,contractStatusLabel[s],data.filter(c=>c.status===s).length] as const)]).map(([key,label,cnt])=>{
            const active=filterStatus===key;
            const col=key==="ALL"?{bg:"#dce5f0",text:PRIMARY}:contractStatusColor[key as ContractStatus]??{bg:"#dce5f0",text:PRIMARY};
            return (
              <button key={key} onClick={()=>setFilterStatus(key as ContractStatus|"ALL")}
                style={{padding:"5px 14px",borderRadius:99,border:`1px solid ${active?col.text+"60":BORDER}`,background:active?col.bg:"#fff",color:active?col.text:MUTED,fontSize:"0.72rem",fontWeight:600,cursor:"pointer"}}>
                {label} ({cnt})
              </button>
            );
          })}
        </div>

        {/* Toolbar */}
        <div style={{...CARD,borderRadius:"14px 14px 0 0",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"none",gap:10,flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,background:"#fafafa",border:`1px solid ${BORDER}`,borderRadius:10,padding:"7px 12px",minWidth:280}}>
            <Search size={13} color={MUTED}/>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ค้นหาสัญญา / ลูกค้า / โครงการ..."
              style={{border:"none",outline:"none",fontSize:"0.78rem",color:STEEL,background:"transparent",flex:1}}/>
            {query&&<button onClick={()=>setQuery("")} style={{background:"none",border:"none",cursor:"pointer",padding:0,color:MUTED,display:"flex"}}><X size={12}/></button>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{display:"flex",alignItems:"center",background:"#f0f4f8",borderRadius:99,padding:3,border:`1px solid ${BORDER}`}}>
              {(["list","card"] as const).map(v=>(
                <button key={v} onClick={()=>setView(v)}
                  style={{display:"flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:99,border:"none",background:view===v?PRIMARY:"transparent",color:view===v?"#fff":MUTED,fontSize:"0.71rem",fontWeight:700,cursor:"pointer",transition:"all .15s"}}>
                  {v==="list"?<LayoutList size={12}/>:<LayoutGrid size={12}/>}
                  {v==="list"?"รายการ":"การ์ด"}
                </button>
              ))}
            </div>
            <span style={{fontSize:"0.72rem",color:MUTED}}>แสดง {filtered.length}/{data.length}</span>
          </div>
        </div>

        {/* ── LIST VIEW ── */}
        {view==="list"&&(
          <div style={{...CARD,borderRadius:"0 0 14px 14px",borderTop:"none"}}>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{borderBottom:`1px solid ${BORDER}`,background:"#f8f9fb"}}>
                    {([{l:"เลขที่",k:"id"},{l:"ลูกค้า / ผู้ติดต่อ",k:"client"},{l:"โครงการ",k:null},{l:"มูลค่า",k:"value"},{l:"มัดจำ",k:"deposit"},{l:"คงค้าง",k:"remaining"},{l:"เซลล์",k:null},{l:"วันเซ็น",k:"signDate"},{l:"สถานะ",k:"status"},{l:"",k:null}] as {l:string;k:SortKey|null}[]).map((col,i)=>(
                      <th key={i} onClick={col.k?()=>handleSort(col.k as SortKey):undefined}
                        style={{fontSize:"0.63rem",fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.05em",padding:"10px 14px",textAlign:"left",whiteSpace:"nowrap",cursor:col.k?"pointer":"default",userSelect:"none"}}>
                        <span style={{display:"inline-flex",alignItems:"center"}}>{col.l}{col.k&&<SortIcon k={col.k}/>}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length===0&&<tr><td colSpan={10} style={{textAlign:"center",padding:"40px 0",color:MUTED,fontSize:"0.82rem"}}>ไม่พบสัญญา</td></tr>}
                  {filtered.map(c=>{
                    const sc=contractStatusColor[c.status]; const isSel=selected?.id===c.id;
                    const depositPct=c.value>0?Math.min(100,Math.round((c.deposit/c.value)*100)):0;
                    return (
                      <tr key={c.id} onClick={()=>selectRow(c)}
                        style={{borderBottom:"1px solid #f0f4f8",cursor:"pointer",background:isSel?"#f0f6ff":undefined,transition:"background .1s"}}
                        onMouseEnter={e=>{if(!isSel)(e.currentTarget as HTMLElement).style.background="#f8f9fb";}}
                        onMouseLeave={e=>{if(!isSel)(e.currentTarget as HTMLElement).style.background="";}}>
                        <td style={{padding:"11px 14px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{width:28,height:28,borderRadius:8,background:"#dce5f0",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><FileSignature size={12} color={PRIMARY}/></div>
                            <span style={{fontSize:"0.78rem",fontWeight:700,color:STEEL,fontFamily:"monospace"}}>{c.id}</span>
                          </div>
                        </td>
                        <td style={{padding:"11px 14px",minWidth:160}}>
                          <button onClick={e=>{e.stopPropagation();if(relCustomer&&selected?.id===c.id) router.push(`/customers/${relCustomer.id}`); else{ const cu=customers.find(x=>x.company===c.client); if(cu) router.push(`/customers/${cu.id}`);}}}
                            style={{background:"none",border:"none",cursor:"pointer",color:PRIMARY,fontSize:"0.82rem",fontWeight:700,padding:0,textAlign:"left",display:"block"}}>
                            {c.client}
                          </button>
                          <div style={{fontSize:"0.68rem",color:MUTED,marginTop:2}}>{c.contact} · {c.phone}</div>
                        </td>
                        <td style={{padding:"11px 14px",maxWidth:180}}>
                          <div style={{fontSize:"0.78rem",color:STEEL,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.project}</div>
                          {c.quotationRef&&<button onClick={e=>{e.stopPropagation();router.push("/quotations");}} style={{background:"none",border:"none",cursor:"pointer",color:PRIMARY,fontSize:"0.65rem",fontWeight:700,padding:0}}>{c.quotationRef}</button>}
                        </td>
                        <td style={{padding:"11px 14px",fontSize:"0.85rem",fontWeight:800,color:STEEL,whiteSpace:"nowrap"}}>{fmt(c.value)}</td>
                        <td style={{padding:"11px 14px",fontSize:"0.8rem",fontWeight:700,color:"#22c55e",whiteSpace:"nowrap"}}>{fmt(c.deposit)}</td>
                        <td style={{padding:"11px 14px",fontSize:"0.8rem",fontWeight:700,color:c.remaining>0?"#f04d6a":"#22c55e",whiteSpace:"nowrap"}}>{fmt(c.remaining)}</td>
                        <td style={{padding:"11px 14px",fontSize:"0.76rem",color:MUTED}}>{c.agentName}</td>
                        <td style={{padding:"11px 14px",fontSize:"0.74rem",color:MUTED,whiteSpace:"nowrap"}}>{fmtDate(c.signDate)}</td>
                        <td style={{padding:"11px 14px"}}>
                          <div style={{display:"flex",flexDirection:"column",gap:4}}>
                            <span style={{display:"inline-block",padding:"3px 9px",borderRadius:99,fontSize:"0.65rem",fontWeight:700,background:sc.bg,color:sc.text}}>{contractStatusLabel[c.status]}</span>
                            {c.value>0&&<div style={{height:3,borderRadius:99,background:"#f0f4f8",overflow:"hidden",width:60}}><div style={{height:"100%",width:`${depositPct}%`,background:"#22c55e",borderRadius:99}}/></div>}
                          </div>
                        </td>
                        <td style={{padding:"11px 14px"}} onClick={e=>e.stopPropagation()}>
                          <div style={{display:"flex",gap:4}}>
                            {STATUS_ACTIONS[c.status].length>0&&STATUS_ACTIONS[c.status].slice(0,1).map(action=>(
                              <button key={action.next} onClick={()=>changeStatus(c.id,action.next)}
                                style={{padding:"4px 8px",borderRadius:7,border:"none",background:action.bg,color:action.color,fontSize:"0.63rem",fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
                                {action.label.split(" ")[0]}
                              </button>
                            ))}
                            <button onClick={()=>openEdit(c)}
                              style={{padding:"4px 9px",borderRadius:7,border:`1px solid ${BORDER}`,background:"#fff",color:PRIMARY,fontSize:"0.67rem",fontWeight:600,cursor:"pointer"}}>แก้ไข</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{padding:"10px 16px",borderTop:`1px solid ${BORDER}`}}>
              <span style={{fontSize:"0.72rem",color:MUTED}}>แสดง {filtered.length} จาก {data.length} รายการ</span>
            </div>
          </div>
        )}

        {/* ── CARD VIEW ── */}
        {view==="card"&&(
          <div style={{...CARD,borderRadius:"0 0 14px 14px",borderTop:"none",padding:16}}>
            {filtered.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:MUTED}}>ไม่พบสัญญา</div>}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
              {filtered.map(c=>{
                const sc=contractStatusColor[c.status]; const isSel=selected?.id===c.id;
                const depositPct=c.value>0?Math.min(100,Math.round((c.deposit/c.value)*100)):0;
                return (
                  <div key={c.id} onClick={()=>selectRow(c)}
                    style={{background:"#fff",borderRadius:14,border:isSel?`1.5px solid ${PRIMARY}`:`1px solid ${BORDER}`,boxShadow:isSel?"0 4px 18px rgba(0,51,102,.15)":"0 2px 10px rgba(0,51,102,.06)",padding:16,display:"flex",flexDirection:"column",gap:10,cursor:"pointer",transition:"all .15s"}}
                    onMouseEnter={e=>{if(!isSel)(e.currentTarget as HTMLElement).style.boxShadow="0 6px 22px rgba(0,51,102,.13)";}}
                    onMouseLeave={e=>{if(!isSel)(e.currentTarget as HTMLElement).style.boxShadow="0 2px 10px rgba(0,51,102,.06)";}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:30,height:30,borderRadius:9,background:"#dce5f0",display:"flex",alignItems:"center",justifyContent:"center"}}><FileSignature size={13} color={PRIMARY}/></div>
                        <span style={{fontSize:"0.82rem",fontWeight:800,color:STEEL,fontFamily:"monospace"}}>{c.id}</span>
                      </div>
                      <span style={{fontSize:"0.67rem",color:MUTED}}>{fmtDate(c.signDate)}</span>
                    </div>
                    <div style={{display:"flex",justifyContent:"center"}}>
                      <span style={{padding:"4px 14px",borderRadius:99,fontSize:"0.7rem",fontWeight:700,background:sc.bg,color:sc.text}}>{contractStatusLabel[c.status]}</span>
                    </div>
                    <div style={{borderTop:"1px solid #f0f4f8",paddingTop:8}}>
                      <button onClick={e=>{e.stopPropagation();const cu=customers.find(x=>x.company===c.client);if(cu)router.push(`/customers/${cu.id}`);}}
                        style={{background:"none",border:"none",cursor:"pointer",color:PRIMARY,fontSize:"0.88rem",fontWeight:800,padding:0,textAlign:"left",display:"block",marginBottom:3}}>
                        {c.client}
                      </button>
                      <div style={{fontSize:"0.7rem",color:MUTED}}>{c.contact} · {c.phone}</div>
                      <div style={{fontSize:"0.7rem",color:MUTED,marginTop:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.project}</div>
                      {c.quotationRef&&<button onClick={e=>{e.stopPropagation();router.push("/quotations");}} style={{background:"none",border:"none",cursor:"pointer",color:PRIMARY,fontSize:"0.65rem",fontWeight:700,padding:0,marginTop:2}}>{c.quotationRef}</button>}
                    </div>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:"0.6rem",color:MUTED,fontWeight:600,marginBottom:2,textTransform:"uppercase",letterSpacing:"0.05em"}}>มูลค่าสัญญา</div>
                      <div style={{fontSize:"1.3rem",fontWeight:800,color:PRIMARY}}>{fmt(c.value)}</div>
                    </div>
                    <div>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <span style={{fontSize:"0.63rem",color:"#22c55e",fontWeight:600}}>มัดจำ {depositPct}%</span>
                        <span style={{fontSize:"0.63rem",color:c.remaining>0?"#f04d6a":"#22c55e",fontWeight:600}}>คงค้าง {100-depositPct}%</span>
                      </div>
                      <div style={{height:6,borderRadius:99,background:"#f0f4f8",overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${depositPct}%`,background:"#22c55e",borderRadius:99}}/>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",marginTop:3}}>
                        <span style={{fontSize:"0.65rem",color:"#22c55e",fontWeight:600}}>{fmt(c.deposit)}</span>
                        <span style={{fontSize:"0.65rem",color:c.remaining>0?"#f04d6a":"#22c55e",fontWeight:600}}>{fmt(c.remaining)}</span>
                      </div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",borderTop:"1px solid #f0f4f8",paddingTop:8}}>
                      <span style={{fontSize:"0.7rem",color:MUTED}}>เซลล์: <span style={{color:STEEL,fontWeight:600}}>{c.agentName}</span></span>
                      <div style={{display:"flex",gap:4}} onClick={e=>e.stopPropagation()}>
                        {STATUS_ACTIONS[c.status].length>0&&(
                          <button onClick={()=>changeStatus(c.id,STATUS_ACTIONS[c.status][0].next)}
                            style={{padding:"4px 9px",borderRadius:7,border:"none",background:STATUS_ACTIONS[c.status][0].bg,color:STATUS_ACTIONS[c.status][0].color,fontSize:"0.63rem",fontWeight:700,cursor:"pointer"}}>
                            {STATUS_ACTIONS[c.status][0].label.split(" ")[0]}
                          </button>
                        )}
                        <button onClick={()=>openEdit(c)}
                          style={{padding:"4px 9px",borderRadius:7,border:`1px solid ${BORDER}`,background:"#fff",color:PRIMARY,fontSize:"0.65rem",fontWeight:600,cursor:"pointer"}}>แก้ไข</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{padding:"10px 16px",borderTop:`1px solid ${BORDER}`,marginTop:16}}>
              <span style={{fontSize:"0.72rem",color:MUTED}}>แสดง {filtered.length} จาก {data.length} รายการ</span>
            </div>
          </div>
        )}
      </div>

      {/* ══ DETAIL PANEL ════════════════════════════════════ */}
      {selected&&(
        <>
          <div onClick={()=>setSelected(null)} style={{position:"fixed",inset:0,background:"rgba(45,45,45,.38)",zIndex:300}} />
          <div style={{position:"fixed",right:0,top:0,height:"100vh",width:420,background:"#fff",overflowY:"auto",zIndex:301,boxShadow:"-6px 0 40px rgba(0,51,102,.16)"}}>

            {/* Panel header */}
            <div style={{background:PRIMARY,padding:"16px 16px 12px"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:"0.64rem",fontWeight:700,color:"rgba(255,255,255,.55)",fontFamily:"monospace",letterSpacing:"0.05em"}}>{selected.id}</div>
                  <div style={{fontSize:"0.9rem",fontWeight:800,color:"#fff",lineHeight:1.25,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selected.client}</div>
                  <div style={{fontSize:"0.68rem",color:"rgba(255,255,255,.65)",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{selected.project}</div>
                </div>
                <button onClick={()=>setSelected(null)} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:8}}>
                  <X size={14}/>
                </button>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{padding:"2px 10px",borderRadius:99,fontSize:"0.63rem",fontWeight:700,background:contractStatusColor[selected.status].bg,color:contractStatusColor[selected.status].text}}>
                  {contractStatusLabel[selected.status]}
                </span>
                <span style={{fontSize:"0.9rem",fontWeight:800,color:"rgba(255,255,255,.9)"}}>{fmt(selected.value)}</span>
              </div>
            </div>

            {/* Tabs */}
            <div style={{display:"flex",borderBottom:`1px solid ${BORDER}`,overflowX:"auto"}}>
              {dtabs.map(([key,label,cnt])=>(
                <button key={key} onClick={()=>setDetailTab(key as typeof detailTab)}
                  style={{display:"flex",alignItems:"center",gap:3,padding:"8px 10px",border:"none",background:"none",cursor:"pointer",fontSize:"0.63rem",fontWeight:detailTab===key?700:500,color:detailTab===key?PRIMARY:MUTED,borderBottom:detailTab===key?`2px solid ${PRIMARY}`:"2px solid transparent",whiteSpace:"nowrap",marginBottom:-1}}>
                  {label}{cnt!==undefined&&cnt>0?<span style={{padding:"1px 5px",borderRadius:99,background:"#dce5f0",color:PRIMARY,fontSize:"0.58rem",fontWeight:800,marginLeft:3}}>{cnt}</span>:null}
                </button>
              ))}
            </div>

            {/* Tab: ข้อมูล */}
            {detailTab==="info"&&(
              <div style={{padding:"14px 16px"}}>
                {/* Payment breakdown */}
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:"0.63rem",fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>การชำระเงิน</div>
                  <div style={{display:"flex",gap:0,borderRadius:11,overflow:"hidden",border:`1px solid ${BORDER}`}}>
                    {[{label:"มัดจำ",value:fmt(selected.deposit),color:"#22c55e",bg:"#f8f9fb"},{label:"คงค้าง",value:fmt(selected.remaining),color:selected.remaining>0?"#f04d6a":"#22c55e",bg:"#f0f4f8"}].map((item,i)=>(
                      <div key={i} style={{flex:1,padding:"10px 10px",background:item.bg,borderRight:i===0?`1px solid ${BORDER}`:"none",textAlign:"center"}}>
                        <div style={{fontSize:"0.6rem",color:MUTED,fontWeight:600,marginBottom:3}}>{item.label}</div>
                        <div style={{fontSize:"0.82rem",color:item.color,fontWeight:800}}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                  {selected.value>0&&(()=>{
                    const pct=Math.min(100,Math.round((selected.deposit/selected.value)*100));
                    return (
                      <div style={{marginTop:6}}>
                        <div style={{height:6,borderRadius:99,background:"#f0f4f8",overflow:"hidden"}}>
                          <div style={{height:"100%",width:`${pct}%`,background:"#22c55e",borderRadius:99,transition:"width .3s"}}/>
                        </div>
                        <div style={{display:"flex",justifyContent:"space-between",marginTop:4}}>
                          <span style={{fontSize:"0.62rem",color:MUTED}}>มัดจำ {pct}%</span>
                          <span style={{fontSize:"0.62rem",fontWeight:800,color:PRIMARY}}>{fmt(selected.value)} รวม</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                {/* Details */}
                <div style={{fontSize:"0.63rem",fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>รายละเอียด</div>
                {[
                  {label:"ผู้ติดต่อ",  val:selected.contact},
                  {label:"โทรศัพท์", val:selected.phone},
                  {label:"เซลล์",    val:selected.agentName},
                  {label:"วันเซ็น",  val:fmtDate(selected.signDate)},
                  {label:"วันส่งมอบ",val:fmtDate(selected.transferDate)},
                  ...(selected.quotationRef?[{label:"ใบเสนอราคา",val:selected.quotationRef}]:[]),
                ].map((r,i,arr)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<arr.length-1?"1px solid #f0f4f8":"none"}}>
                    <span style={{fontSize:"0.72rem",color:MUTED,fontWeight:600}}>{r.label}</span>
                    <span style={{fontSize:"0.76rem",color:STEEL,fontWeight:700}}>{r.val}</span>
                  </div>
                ))}
                {/* Status workflow */}
                {selected.status==="active"&&(
                  <div style={{marginTop:14}}>
                    <button onClick={()=>router.push("/finance")}
                      style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 12px",borderRadius:10,background:"#dce5f0",border:"none",cursor:"pointer",width:"100%"}}>
                      <span style={{fontSize:"0.76rem",fontWeight:700,color:PRIMARY}}>ออกใบแจ้งหนี้</span>
                      <ArrowRight size={13} color={PRIMARY}/>
                    </button>
                  </div>
                )}
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

            {/* Tab: ใบแจ้งหนี้ */}
            {detailTab==="invoices"&&(
              <div style={{padding:"12px 14px"}}>
                {relInvoices.length===0?(
                  <div style={{textAlign:"center",padding:"28px 0",color:MUTED,fontSize:"0.78rem"}}>ยังไม่มีใบแจ้งหนี้</div>
                ):(
                  <div style={{display:"flex",flexDirection:"column",gap:7}}>
                    {relInvoices.map(inv=>{
                      const ic=invoiceStatusColor[inv.status];
                      return (
                        <button key={inv.id} onClick={()=>router.push("/invoices")}
                          style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",padding:"10px 12px",borderRadius:10,background:"#f8f9fb",border:"1px solid #eef0f4",cursor:"pointer",textAlign:"left",width:"100%"}}
                          onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="#dce5f0";}}
                          onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="#f8f9fb";}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:"0.7rem",fontWeight:700,color:PRIMARY,fontFamily:"monospace"}}>{inv.id}</div>
                            <div style={{fontSize:"0.74rem",fontWeight:700,color:STEEL,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{inv.milestone}</div>
                            <div style={{fontSize:"0.65rem",color:MUTED,marginTop:2}}>ครบกำหนด {inv.dueDate} · ฿{inv.total.toLocaleString()}</div>
                          </div>
                          <span style={{padding:"2px 7px",borderRadius:99,fontSize:"0.6rem",fontWeight:700,marginLeft:8,flexShrink:0,background:ic.bg,color:ic.text}}>
                            {invoiceStatusLabel[inv.status]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
                <button onClick={()=>router.push("/invoices")}
                  style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,width:"100%",padding:"9px 0",borderRadius:10,background:"#dce5f0",color:PRIMARY,border:"none",fontSize:"0.75rem",fontWeight:700,cursor:"pointer",marginTop:10}}>
                  <Receipt size={13}/> ดูใบแจ้งหนี้ทั้งหมด
                </button>
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
                    {[{label:"โทรศัพท์",val:relCustomer.phone},{label:"อีเมล",val:relCustomer.email},{label:"จังหวัด",val:relCustomer.province},{label:"หมวด",val:relCustomer.category}].map((r,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<3?"1px solid #f0f4f8":"none"}}>
                        <span style={{fontSize:"0.7rem",color:MUTED,fontWeight:600}}>{r.label}</span>
                        <span style={{fontSize:"0.75rem",color:STEEL,fontWeight:700,maxWidth:160,textAlign:"right",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.val}</span>
                      </div>
                    ))}
                    <button onClick={()=>router.push(`/customers/${relCustomer.id}`)}
                      style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,width:"100%",padding:"9px 0",borderRadius:10,background:PRIMARY,color:"#fff",border:"none",fontSize:"0.76rem",fontWeight:700,cursor:"pointer",marginTop:14}}>
                      <ExternalLink size={13}/> ดูข้อมูลลูกค้าเต็ม
                    </button>
                  </>
                ):(
                  <div style={{textAlign:"center",padding:"28px 0",color:MUTED,fontSize:"0.78rem"}}>ไม่พบข้อมูลลูกค้า<br/><span style={{fontSize:"0.65rem"}}>(ลูกค้า: {selected.client})</span></div>
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
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                        <span style={{fontSize:"0.7rem",color:MUTED,fontWeight:600}}>ความคืบหน้า</span>
                        <span style={{fontSize:"0.7rem",fontWeight:700,color:PRIMARY}}>{relProject.progress}%</span>
                      </div>
                      <div style={{height:6,borderRadius:99,background:"#f0f4f8",overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${relProject.progress}%`,background:PRIMARY,borderRadius:99}}/>
                      </div>
                    </div>
                    {[{label:"มูลค่า",val:relProject.value},{label:"เริ่ม",val:relProject.start},{label:"ครบ",val:relProject.due},{label:"ทีมงาน",val:relProject.assigned.join(", ")||"—"}].map((r,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<3?"1px solid #f0f4f8":"none"}}>
                        <span style={{fontSize:"0.7rem",color:MUTED,fontWeight:600}}>{r.label}</span>
                        <span style={{fontSize:"0.75rem",color:STEEL,fontWeight:700,maxWidth:160,textAlign:"right",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.val}</span>
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

            {/* Tab: ใบเสนอราคา */}
            {detailTab==="quotation"&&(
              <div style={{padding:"14px 16px"}}>
                {relQuotation?(
                  <>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                      <div style={{width:36,height:36,borderRadius:10,background:"#dce5f0",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><FileText size={15} color={PRIMARY}/></div>
                      <div>
                        <div style={{fontSize:"0.75rem",fontWeight:800,color:PRIMARY,fontFamily:"monospace"}}>{relQuotation.id}</div>
                        <div style={{fontSize:"0.7rem",color:MUTED,marginTop:1}}>{fmtDate(relQuotation.date)}</div>
                      </div>
                    </div>
                    {[{label:"ลูกค้า",val:relQuotation.customer},{label:"โครงการ",val:relQuotation.project},{label:"มูลค่า",val:relQuotation.total},{label:"ประเภท",val:relQuotation.buildingType},{label:"พื้นที่",val:`${relQuotation.area?.toLocaleString()} ม²`}].map((r,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<4?"1px solid #f0f4f8":"none"}}>
                        <span style={{fontSize:"0.7rem",color:MUTED,fontWeight:600}}>{r.label}</span>
                        <span style={{fontSize:"0.75rem",color:STEEL,fontWeight:700,maxWidth:160,textAlign:"right",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.val}</span>
                      </div>
                    ))}
                    <div style={{marginTop:10}}>
                      <span style={{display:"inline-block",padding:"3px 10px",borderRadius:99,fontSize:"0.67rem",fontWeight:700,background:quotationStatusColor[relQuotation.status].bg,color:quotationStatusColor[relQuotation.status].text}}>
                        {quotationStatusLabel[relQuotation.status]}
                      </span>
                    </div>
                    <button onClick={()=>router.push("/quotations")}
                      style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,width:"100%",padding:"9px 0",borderRadius:10,background:PRIMARY,color:"#fff",border:"none",fontSize:"0.76rem",fontWeight:700,cursor:"pointer",marginTop:14}}>
                      <ExternalLink size={13}/> ดูใบเสนอราคา
                    </button>
                  </>
                ):(
                  <div style={{textAlign:"center",padding:"28px 0",color:MUTED,fontSize:"0.78rem"}}>
                    {selected.quotationRef?`ไม่พบ ${selected.quotationRef}`:"ไม่มีใบเสนอราคาอ้างอิง"}
                  </div>
                )}
              </div>
            )}

            {/* Actions footer */}
            <div style={{padding:"12px 14px",borderTop:`1px solid ${BORDER}`,display:"flex",flexDirection:"column",gap:6}}>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>openEdit(selected)}
                  style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"9px 0",borderRadius:10,background:PRIMARY,color:"#fff",border:"none",fontSize:"0.74rem",fontWeight:700,cursor:"pointer"}}>
                  <Edit2 size={13}/> แก้ไข
                </button>
                <button onClick={()=>{if(relProject) router.push(`/projects/${relProject.id}`);}} disabled={!relProject}
                  style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"9px 0",borderRadius:10,background:"#dce5f0",color:PRIMARY,border:"none",fontSize:"0.74rem",fontWeight:700,cursor:relProject?"pointer":"not-allowed",opacity:relProject?1:0.5}}>
                  <Building2 size={13}/> โครงการ
                </button>
              </div>
              <button onClick={()=>router.push("/invoices")}
                style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"8px 0",borderRadius:10,background:"#f0f4f8",color:STEEL,border:`1px solid ${BORDER}`,fontSize:"0.73rem",fontWeight:700,cursor:"pointer"}}>
                <Receipt size={13}/> ใบแจ้งหนี้ ({relInvoices.length})
              </button>
              {!delConfirm?(
                <button onClick={()=>setDelConfirm(true)}
                  style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"7px 0",borderRadius:10,background:"#fff",color:"#f04d6a",border:"1px solid #fdeaed",fontSize:"0.72rem",fontWeight:700,cursor:"pointer"}}>
                  <Trash2 size={12}/> ลบสัญญา
                </button>
              ):(
                <div style={{borderRadius:10,border:"1px solid #fca5a5",overflow:"hidden"}}>
                  <div style={{padding:"7px 12px",background:"#fdeaed",fontSize:"0.7rem",color:"#f04d6a",fontWeight:600}}>ยืนยันลบ "{selected.id}"?</div>
                  <div style={{display:"flex"}}>
                    <button onClick={deleteContract} style={{flex:1,padding:"7px",background:"#f04d6a",border:"none",color:"#fff",fontSize:"0.7rem",fontWeight:700,cursor:"pointer"}}>ลบ</button>
                    <button onClick={()=>setDelConfirm(false)} style={{flex:1,padding:"7px",background:"#fff",border:"none",borderLeft:"1px solid #fca5a5",color:STEEL,fontSize:"0.7rem",cursor:"pointer"}}>ยกเลิก</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {showModal&&(
        <ContractModal
          title={editingC?"แก้ไขสัญญา":"เพิ่มสัญญาใหม่"}
          initial={editingC?toForm(editingC):buildBlank()}
          onSave={saveContract} onClose={()=>setShowModal(false)}/>
      )}
    </div>
  );
}
