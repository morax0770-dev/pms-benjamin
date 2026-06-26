"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  projects, leads, quotations, appointments,
  customers as mockCustomers, BUILDING_TYPES,
  projectStatusLabel, projectStatusColor, quotationStatusLabel, quotationStatusColor,
} from "@/lib/mock";
import {
  Plus, Search, X, ChevronUp, ChevronDown,
  Phone, Mail, MapPin, Building2, Edit2, ExternalLink,
  LayoutList, LayoutGrid, Download, Filter, Trash2,
  Calendar, FileText, Briefcase,
} from "lucide-react";

// ── Design tokens ────────────────────────────────────────────
const PRIMARY = "#003366";
const STEEL   = "#2D2D2D";
const BORDER  = "#cfd4dc";
const BG      = "#f4f6f9";
const MUTED   = "#6b7280";
const CARD: React.CSSProperties = { background:"#fff", borderRadius:16, border:`1px solid ${BORDER}`, boxShadow:"0 2px 14px rgba(0,51,102,.07)" };

// ── Types ────────────────────────────────────────────────────
type CustomerStatus = "active" | "inactive";
type CustomerRow = {
  id:number; name:string; company:string; email:string; phone:string;
  province:string; category:string; status:CustomerStatus; projects:number;
  joinDate:string; owner:string; initials:string; color:string;
  invoiceCount:number; totalValue:number; paidValue:number;
};
type SortKey = "company"|"category"|"status"|"projects"|"province"|"joinDate";
type SortDir = "asc"|"desc";

type CustomerExtra = { status: CustomerStatus; projects: number; joinDate: string; owner: string; invoiceCount: number; totalValue: number; paidValue: number; };
const EXTRA: Record<number, CustomerExtra> = {
  1: { status:"active",   projects:2, joinDate:"2025-09-15", owner:"สมชาย เชียงใหม่",  invoiceCount:2, totalValue:1800000, paidValue:540000 },
  2: { status:"active",   projects:1, joinDate:"2025-11-03", owner:"วิภา รัตนกุล",    invoiceCount:1, totalValue:3200000, paidValue:960000 },
  3: { status:"active",   projects:1, joinDate:"2026-01-20", owner:"วิภา รัตนกุล",    invoiceCount:1, totalValue:760000,  paidValue:0 },
  4: { status:"active",   projects:2, joinDate:"2026-02-10", owner:"สมชาย เชียงใหม่",  invoiceCount:1, totalValue:2000000, paidValue:0 },
  5: { status:"inactive", projects:3, joinDate:"2025-08-01", owner:"วิชัย ประสิทธิ์",  invoiceCount:2, totalValue:6200000, paidValue:6200000 },
  6: { status:"active",   projects:1, joinDate:"2025-12-01", owner:"สมชาย เชียงใหม่",  invoiceCount:0, totalValue:4100000, paidValue:0 },
  7: { status:"inactive", projects:0, joinDate:"2026-06-01", owner:"วิภา รัตนกุล",    invoiceCount:0, totalValue:0,       paidValue:0 },
  8: { status:"active",   projects:2, joinDate:"2025-07-15", owner:"กาญจนา มีสุข",    invoiceCount:1, totalValue:5400000, paidValue:5400000 },
};
const INIT_CUSTOMERS: CustomerRow[] = mockCustomers.map(c => ({ ...c, ...EXTRA[c.id] }));

const CATEGORIES = [...BUILDING_TYPES];
const OWNERS     = ["สมชาย เชียงใหม่","วิภา รัตนกุล","วิชัย ประสิทธิ์","กาญจนา มีสุข"];
const PROVINCES  = ["กรุงเทพฯ","เชียงใหม่","ระยอง","เชียงราย","นนทบุรี","สมุทรสาคร","สมุทรปราการ","นครสวรรค์","ราชบุรี","ขอนแก่น","ตาก","อุตรดิตถ์","อื่นๆ"];

function initials(name:string){ return name.replace(/บจ\.|หจก\./g,"").trim().slice(0,2); }
function fmtMoney(v:number){ return "฿"+v.toLocaleString("th-TH"); }
function fmtDate(d:string){
  if(!d||d==="—") return "—";
  const [y,m,day]=d.split("-");
  const months=["","ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return `${parseInt(day)} ${months[parseInt(m)]} ${parseInt(y)+543}`;
}
const PALETTE = ["#003366","#22c55e","#f59e0b","#f04d6a","#002244","#8fa3b8","#0d9488","#3b82f6"];

// ── Add / Edit Modal ─────────────────────────────────────────
type CustomerForm = Omit<CustomerRow,"id"|"initials"|"color"|"invoiceCount"|"totalValue"|"paidValue">;
const BLANK_FORM: CustomerForm = { name:"",company:"",email:"",phone:"",province:"กรุงเทพฯ",category:BUILDING_TYPES[0],status:"active",projects:0,joinDate:"",owner:"สมชาย เชียงใหม่" };

function CustomerModal({ initial, title, onSave, onClose }:{
  initial:CustomerForm; title:string; onSave:(f:CustomerForm)=>void; onClose:()=>void;
}){
  const [form, setForm] = useState<CustomerForm>(initial);
  function set<K extends keyof CustomerForm>(k:K,v:CustomerForm[K]){ setForm(p=>({...p,[k]:v})); }
  const INP: React.CSSProperties = { width:"100%",border:`1px solid ${BORDER}`,borderRadius:9,padding:"8px 11px",fontSize:"0.82rem",outline:"none",color:STEEL,boxSizing:"border-box" };
  const LBL: React.CSSProperties = { display:"block",fontSize:"0.68rem",fontWeight:700,color:MUTED,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.04em" };
  function submit(){ if(!form.company.trim()||!form.name.trim()) return; onSave(form); onClose(); }
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(45,45,45,.45)",zIndex:200}}/>
      <div style={{position:"fixed",inset:0,zIndex:210,display:"flex",alignItems:"center",justifyContent:"center",padding:24,pointerEvents:"none"}}>
        <div onClick={e=>e.stopPropagation()}
          style={{width:"100%",maxWidth:560,background:"#fff",borderRadius:20,border:`1px solid ${BORDER}`,boxShadow:"0 24px 80px rgba(0,51,102,.2)",pointerEvents:"auto",overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"18px 24px",borderBottom:`1px solid ${BORDER}`,background:PRIMARY}}>
            <div>
              <div style={{fontSize:"1rem",fontWeight:800,color:"#fff"}}>{title}</div>
              <div style={{fontSize:"0.7rem",color:"rgba(255,255,255,.65)"}}>กรอกข้อมูลลูกค้า</div>
            </div>
            <button onClick={onClose} style={{width:32,height:32,borderRadius:9,border:"1px solid rgba(255,255,255,.2)",background:"rgba(255,255,255,.1)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={15}/></button>
          </div>
          <div style={{padding:"22px 24px",overflowY:"auto",maxHeight:"65vh"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div style={{gridColumn:"1/-1"}}>
                <label style={LBL}>บริษัท *</label>
                <input value={form.company} onChange={e=>set("company",e.target.value)} placeholder="ชื่อบริษัท" style={INP} autoFocus/>
              </div>
              <div>
                <label style={LBL}>ผู้ติดต่อ *</label>
                <input value={form.name} onChange={e=>set("name",e.target.value)} placeholder="ชื่อผู้ติดต่อ" style={INP}/>
              </div>
              <div>
                <label style={LBL}>โทรศัพท์</label>
                <input value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="0XX-XXX-XXXX" style={INP}/>
              </div>
              <div style={{gridColumn:"1/-1"}}>
                <label style={LBL}>อีเมล</label>
                <input type="email" value={form.email} onChange={e=>set("email",e.target.value)} placeholder="email@company.com" style={INP}/>
              </div>
              <div>
                <label style={LBL}>จังหวัด</label>
                <select value={form.province} onChange={e=>set("province",e.target.value)} style={INP}>
                  {PROVINCES.map(p=><option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={LBL}>หมวดหมู่</label>
                <select value={form.category} onChange={e=>set("category",e.target.value)} style={INP}>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={LBL}>ผู้รับผิดชอบ</label>
                <select value={form.owner} onChange={e=>set("owner",e.target.value)} style={INP}>
                  {OWNERS.map(o=><option key={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label style={LBL}>สถานะ</label>
                <select value={form.status} onChange={e=>set("status",e.target.value as CustomerStatus)} style={INP}>
                  <option value="active">ใช้งาน</option>
                  <option value="inactive">ไม่ใช้งาน</option>
                </select>
              </div>
              <div>
                <label style={LBL}>วันที่เพิ่ม</label>
                <input type="date" value={form.joinDate} onChange={e=>set("joinDate",e.target.value)} style={INP}/>
              </div>
            </div>
          </div>
          <div style={{padding:"14px 24px",borderTop:`1px solid ${BORDER}`,display:"flex",gap:8,justifyContent:"flex-end",background:"#fafafa"}}>
            <button onClick={onClose} style={{padding:"9px 20px",borderRadius:9,border:`1px solid ${BORDER}`,background:"#fff",color:STEEL,fontSize:"0.8rem",fontWeight:600,cursor:"pointer"}}>ยกเลิก</button>
            <button onClick={submit} style={{padding:"9px 22px",borderRadius:9,border:"none",background:PRIMARY,color:"#fff",fontSize:"0.8rem",fontWeight:700,cursor:"pointer",boxShadow:"0 4px 12px rgba(0,51,102,.3)"}}>บันทึก</button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Export CSV ───────────────────────────────────────────────
function exportCSV(rows: CustomerRow[]){
  const header = ["ID","บริษัท","ผู้ติดต่อ","อีเมล","โทรศัพท์","จังหวัด","หมวด","สถานะ","โครงการ","ผู้รับผิดชอบ","วันที่เพิ่ม"];
  const lines  = rows.map(c=>[c.id,c.company,c.name,c.email,c.phone,c.province,c.category,c.status===("active" as CustomerStatus)?"ใช้งาน":"ไม่ใช้งาน",c.projects,c.owner,c.joinDate].join(","));
  const csv    = [header.join(","),...lines].join("\n");
  const blob   = new Blob(["﻿"+csv],{type:"text/csv;charset=utf-8;"});
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement("a"); a.href=url; a.download="customers.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ── Main Page ────────────────────────────────────────────────
export default function CustomersPage(){
  const router = useRouter();
  const [data, setData] = useState<CustomerRow[]>(INIT_CUSTOMERS);
  const [query, setQuery]             = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL"|CustomerStatus>("ALL");
  const [catFilter, setCatFilter]     = useState("ALL");
  const [sortKey, setSortKey]         = useState<SortKey>("company");
  const [sortDir, setSortDir]         = useState<SortDir>("asc");
  const [selected, setSelected]       = useState<CustomerRow|null>(null);
  const [view, setView]               = useState<"card"|"table">("card");
  const [showFilter, setShowFilter]   = useState(false);
  const [showAdd, setShowAdd]         = useState(false);
  const [editingRow, setEditingRow]   = useState<CustomerRow|null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [detailTab, setDetailTab]     = useState<"info"|"projects"|"quotes"|"appts">("info");

  function handleSort(k: SortKey){ if(sortKey===k) setSortDir(d=>d==="asc"?"desc":"asc"); else{setSortKey(k);setSortDir("asc");} }

  const filtered = useMemo(()=>{
    let rows=data.filter(c=>{
      const q=query.toLowerCase();
      const matchQ=!q||c.company.toLowerCase().includes(q)||c.name.toLowerCase().includes(q)||c.province.toLowerCase().includes(q)||c.phone.includes(q);
      const matchS=statusFilter==="ALL"||c.status===statusFilter;
      const matchC=catFilter==="ALL"||c.category===catFilter;
      return matchQ&&matchS&&matchC;
    });
    rows=[...rows].sort((a,b)=>{
      let va: string|number=a[sortKey] as string|number;
      let vb: string|number=b[sortKey] as string|number;
      if(typeof va==="string") va=va.toLowerCase();
      if(typeof vb==="string") vb=vb.toLowerCase();
      if(va<vb) return sortDir==="asc"?-1:1;
      if(va>vb) return sortDir==="asc"?1:-1;
      return 0;
    });
    return rows;
  },[data,query,statusFilter,catFilter,sortKey,sortDir]);

  const totalAll      = data.length;
  const totalActive   = data.filter(c=>c.status==="active").length;
  const totalInactive = data.filter(c=>c.status==="inactive").length;
  const totalValue    = data.reduce((s,c)=>s+c.totalValue,0);

  // Related data for selected customer
  const relatedProjects     = selected ? projects.filter(p=>p.customerId===selected.id) : [];
  const relatedQuotations   = selected ? quotations.filter(q=>q.customerId===selected.id) : [];
  const relatedLeads        = selected ? leads.filter(l=>l.company===selected.company||l.customerId===selected.id) : [];
  const relatedAppointments = selected ? appointments.filter(a=>a.company===selected.company) : [];

  function addCustomer(form: CustomerForm){
    const maxId = Math.max(...data.map(c=>c.id),0);
    const color = PALETTE[maxId % PALETTE.length];
    setData(p=>[...p,{...form,id:maxId+1,initials:initials(form.company),color,invoiceCount:0,totalValue:0,paidValue:0}]);
  }
  function saveEdit(form: CustomerForm){
    if(!editingRow) return;
    setData(p=>p.map(c=>c.id===editingRow.id?{...c,...form,initials:initials(form.company)}:c));
    setSelected(p=>p&&p.id===editingRow.id?{...p,...form,initials:initials(form.company)}:p);
  }
  function deleteCustomer(){
    if(!selected) return;
    setData(p=>p.filter(c=>c.id!==selected.id));
    setSelected(null); setShowDeleteConfirm(false);
  }
  function toggleStatus(id:number){
    setData(p=>p.map(c=>c.id===id?{...c,status:c.status==="active"?"inactive":"active"}:c));
    setSelected(p=>p&&p.id===id?{...p,status:p.status==="active"?"inactive":"active"}:p);
  }

  const SortIcon = ({k}:{k:SortKey})=>sortKey===k
    ? (sortDir==="asc"?<ChevronUp size={11} style={{marginLeft:2}}/>:<ChevronDown size={11} style={{marginLeft:2}}/>)
    : <ChevronDown size={11} style={{marginLeft:2,opacity:0.3}}/>;

  const detailTabs: {key:"info"|"projects"|"quotes"|"appts"; label:string; icon:React.ReactNode}[] = [
    {key:"info",    label:"ข้อมูล",     icon:<Building2 size={11}/>},
    {key:"projects",label:`โครงการ (${relatedProjects.length})`,  icon:<Briefcase size={11}/>},
    {key:"quotes",  label:`ใบเสนอ (${relatedQuotations.length})`, icon:<FileText size={11}/>},
    {key:"appts",   label:`นัดหมาย (${relatedAppointments.length})`,icon:<Calendar size={11}/>},
  ];

  return (
    <div style={{display:"flex",gap:16,alignItems:"flex-start"}}>

      {/* ══ MAIN ══════════════════════════════════════════════ */}
      <div style={{flex:1,minWidth:0}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
          <div>
            <h1 style={{fontSize:"1.55rem",fontWeight:800,color:STEEL,lineHeight:1.2,margin:0}}>ลูกค้า</h1>
            <div style={{fontSize:"0.76rem",color:MUTED,marginTop:4}}>จัดการข้อมูลลูกค้าและความสัมพันธ์ทางธุรกิจ</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={()=>setShowFilter(f=>!f)}
              style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:99,border:`1px solid ${showFilter?PRIMARY:BORDER}`,background:showFilter?PRIMARY:"#fff",color:showFilter?"#fff":STEEL,fontSize:"0.75rem",fontWeight:600,cursor:"pointer"}}>
              <Filter size={13}/> ตัวกรอง
            </button>
            <button onClick={()=>exportCSV(filtered)}
              style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:99,border:`1px solid ${BORDER}`,background:"#fff",color:STEEL,fontSize:"0.75rem",fontWeight:600,cursor:"pointer"}}>
              <Download size={13}/> ส่งออก CSV
            </button>
            <button onClick={()=>setShowAdd(true)}
              style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:99,border:"none",background:PRIMARY,color:"#fff",fontSize:"0.75rem",fontWeight:700,cursor:"pointer",boxShadow:"0 4px 10px rgba(0,51,102,.22)"}}>
              <Plus size={13}/> เพิ่มลูกค้า
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
          {[
            {label:"ลูกค้าทั้งหมด",value:totalAll,      color:"#003366",  bg:"#dce5f0",  key:"ALL"},
            {label:"ใช้งานอยู่",   value:totalActive,   color:"#22c55e",  bg:"#e5faf0",  key:"active"},
            {label:"ไม่ใช้งาน",    value:totalInactive, color:"#64748b",  bg:"#f1f5f9",  key:"inactive"},
            {label:"มูลค่ารวม",    value:fmtMoney(totalValue), color:PRIMARY, bg:"#dce5f0", key:null},
          ].map((s,i)=>(
            <div key={i}
              onClick={()=>s.key!==null?setStatusFilter(s.key as "ALL"|CustomerStatus):undefined}
              style={{...CARD,padding:"14px 16px",cursor:s.key!==null?"pointer":"default"}}
              onMouseEnter={e=>{if(s.key!==null)(e.currentTarget as HTMLElement).style.boxShadow="0 4px 16px rgba(0,51,102,.12)";}}
              onMouseLeave={e=>{if(s.key!==null)(e.currentTarget as HTMLElement).style.boxShadow="0 2px 14px rgba(0,51,102,.07)";}}>
              <div style={{fontSize:"0.7rem",color:MUTED,fontWeight:600,marginBottom:6}}>{s.label}</div>
              <div style={{fontSize:typeof s.value==="number"?"1.5rem":"1.1rem",fontWeight:800,color:s.color}}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              {/* Search */}
              <div style={{display:"flex",alignItems:"center",gap:8,background:"#fff",border:`1px solid ${BORDER}`,borderRadius:10,padding:"7px 12px",minWidth:220,boxShadow:"0 1px 6px rgba(0,51,102,.05)"}}>
                <Search size={13} color="#b0b0d0"/>
                <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ค้นหาลูกค้า..."
                  style={{border:"none",outline:"none",fontSize:"0.78rem",color:STEEL,background:"transparent",flex:1,minWidth:0}}/>
                {query&&<button onClick={()=>setQuery("")} style={{background:"none",border:"none",cursor:"pointer",padding:0,color:MUTED,display:"flex"}}><X size={12}/></button>}
              </div>
              {/* Filter toggle */}
              <button onClick={()=>setShowFilter(f=>!f)}
                style={{display:"flex",alignItems:"center",gap:5,padding:"7px 13px",borderRadius:10,border:`1px solid ${showFilter?PRIMARY:BORDER}`,background:showFilter?PRIMARY:"#fff",color:showFilter?"#fff":MUTED,fontSize:"0.73rem",fontWeight:600,cursor:"pointer"}}>
                <Filter size={13}/> ตัวกรอง
              </button>
            </div>
            {/* View toggle */}
            <div style={{display:"flex",alignItems:"center",background:"#f0f4f8",borderRadius:99,padding:3,border:`1px solid ${BORDER}`}}>
              {(["card","table"] as const).map(v=>(
                <button key={v} onClick={()=>setView(v)}
                  style={{display:"flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:99,border:"none",background:view===v?PRIMARY:"transparent",color:view===v?"#fff":MUTED,fontSize:"0.71rem",fontWeight:700,cursor:"pointer",transition:"all .15s"}}>
                  {v==="card"?<LayoutGrid size={13}/>:<LayoutList size={13}/>}
                  {v==="card"?"การ์ด":"ตาราง"}
                </button>
              ))}
            </div>
          </div>

          {/* Filter panel */}
          {showFilter&&(
            <div style={{marginTop:10,padding:"12px 14px",background:"#f8f9fb",borderRadius:12,border:`1px solid ${BORDER}`,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              <span style={{fontSize:"0.68rem",fontWeight:700,color:MUTED,marginRight:2}}>สถานะ:</span>
              {(["ALL","active","inactive"] as const).map(s=>(
                <button key={s} onClick={()=>setStatusFilter(s)}
                  style={{padding:"5px 12px",borderRadius:99,border:`1px solid ${statusFilter===s?PRIMARY:BORDER}`,background:statusFilter===s?PRIMARY:"#fff",color:statusFilter===s?"#fff":MUTED,fontSize:"0.7rem",fontWeight:700,cursor:"pointer"}}>
                  {s==="ALL"?"ทั้งหมด":s==="active"?"ใช้งาน":"ไม่ใช้งาน"}
                </button>
              ))}
              <div style={{width:1,height:20,background:BORDER,margin:"0 4px"}}/>
              <span style={{fontSize:"0.68rem",fontWeight:700,color:MUTED,marginRight:2}}>หมวด:</span>
              {["ALL",...CATEGORIES].map(cat=>(
                <button key={cat} onClick={()=>setCatFilter(cat)}
                  style={{padding:"5px 11px",borderRadius:99,border:`1px solid ${catFilter===cat?"#C0C0C0":BORDER}`,background:catFilter===cat?"#f0f4f8":"#fff",color:catFilter===cat?STEEL:MUTED,fontSize:"0.68rem",fontWeight:600,cursor:"pointer"}}>
                  {cat==="ALL"?"ทั้งหมด":cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── CARD VIEW ── */}
        {view==="card"&&(
          <div>
            {filtered.length===0?(
              <div style={{...CARD,padding:"48px 0",textAlign:"center",color:MUTED,fontSize:"0.82rem"}}>ไม่พบลูกค้าที่ตรงกับเงื่อนไข</div>
            ):(
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
                {filtered.map(c=>{
                  const isSel=selected?.id===c.id;
                  return (
                    <div key={c.id} onClick={()=>{ setSelected(s=>s?.id===c.id?null:c); setDetailTab("info"); setShowDeleteConfirm(false); }}
                      style={{...CARD,cursor:"pointer",overflow:"hidden",position:"relative",border:isSel?`1.5px solid ${PRIMARY}`:`1px solid ${BORDER}`,boxShadow:isSel?"0 4px 18px rgba(0,51,102,.15)":"0 2px 14px rgba(0,51,102,.07)",transition:"box-shadow .15s,border .15s",opacity:c.status==="inactive"?0.78:1}}
                      onMouseEnter={e=>{if(!isSel)(e.currentTarget as HTMLElement).style.boxShadow="0 6px 22px rgba(0,51,102,.13)";}}
                      onMouseLeave={e=>{if(!isSel)(e.currentTarget as HTMLElement).style.boxShadow="0 2px 14px rgba(0,51,102,.07)";}}>
                      {/* 3-dot menu */}
                      <button onClick={e=>{e.stopPropagation();router.push(`/customers/${c.id}`);}}
                        style={{position:"absolute",top:10,right:10,background:"none",border:`1px solid ${BORDER}`,cursor:"pointer",color:PRIMARY,padding:"3px 8px",borderRadius:7,display:"flex",alignItems:"center",gap:4,fontSize:"0.62rem",fontWeight:700}}>
                        ดู →
                      </button>
                      <div style={{padding:"20px 18px 14px",textAlign:"center"}}>
                        <div style={{width:52,height:52,borderRadius:"50%",background:c.color,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:"1rem",margin:"0 auto 10px",boxShadow:`0 4px 12px ${c.color}55`}}>
                          {c.initials}
                        </div>
                        <div style={{fontSize:"0.88rem",fontWeight:800,color:STEEL,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:36}}>{c.company}</div>
                        <div style={{fontSize:"0.7rem",color:MUTED,marginTop:2,fontWeight:500}}>{c.name} · {c.category}</div>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,marginTop:6,fontSize:"0.7rem",color:MUTED}}>
                          <Phone size={10} color="#C0C0C0"/> {c.phone}
                        </div>
                        {c.totalValue>0&&(
                          <div style={{fontSize:"0.72rem",fontWeight:700,color:PRIMARY,marginTop:5}}>{fmtMoney(c.totalValue)}</div>
                        )}
                      </div>
                      <div style={{padding:"10px 16px 14px",display:"flex",alignItems:"center",justifyContent:"center",gap:6,borderTop:`1px solid #f0f4f8`}}>
                        <span style={{padding:"3px 9px",borderRadius:99,fontSize:"0.62rem",fontWeight:700,background:c.status==="active"?"#e5faf0":"#f1f5f9",color:c.status==="active"?"#22c55e":"#64748b"}}>
                          {c.status==="active"?"ใช้งาน":"ไม่ใช้งาน"}
                        </span>
                        <span style={{padding:"3px 9px",borderRadius:99,fontSize:"0.62rem",fontWeight:700,background:c.projects>0?"#dce5f0":"#f1f5f9",color:c.projects>0?PRIMARY:"#9ca3af"}}>
                          {c.projects} โครงการ
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{marginTop:10,padding:"4px 2px"}}>
              <span style={{fontSize:"0.7rem",color:MUTED}}>แสดง {filtered.length} จาก {data.length} รายการ</span>
            </div>
          </div>
        )}

        {/* ── TABLE VIEW ── */}
        {view==="table"&&(
          <div style={CARD}>
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:"#f8f9fb",borderBottom:`1px solid ${BORDER}`}}>
                    {([{label:"บริษัท / ผู้ติดต่อ",key:"company"},{label:"หมวดหมู่",key:"category"},{label:"สถานะ",key:"status"},{label:"โครงการ",key:"projects"},{label:"จังหวัด",key:"province"},{label:"วันที่เพิ่ม",key:"joinDate"}] as {label:string;key:SortKey}[]).map(col=>(
                      <th key={col.key} onClick={()=>handleSort(col.key)}
                        style={{padding:"10px 14px",textAlign:"left",fontSize:"0.65rem",fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.05em",whiteSpace:"nowrap",cursor:"pointer",userSelect:"none"}}>
                        <span style={{display:"inline-flex",alignItems:"center"}}>{col.label}<SortIcon k={col.key}/></span>
                      </th>
                    ))}
                    <th style={{padding:"10px 14px"}}/>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length===0&&(
                    <tr><td colSpan={7} style={{textAlign:"center",padding:"40px 0",color:MUTED,fontSize:"0.82rem"}}>ไม่พบลูกค้า</td></tr>
                  )}
                  {filtered.map(c=>{
                    const isSel=selected?.id===c.id;
                    return(
                      <tr key={c.id} onClick={()=>{setSelected(s=>s?.id===c.id?null:c);setDetailTab("info");setShowDeleteConfirm(false);}}
                        style={{borderBottom:`1px solid #f0f4f8`,cursor:"pointer",background:isSel?"#f0f6ff":undefined,transition:"background .1s"}}
                        onMouseEnter={e=>{if(!isSel)(e.currentTarget as HTMLElement).style.background="#f8f9fb";}}
                        onMouseLeave={e=>{if(!isSel)(e.currentTarget as HTMLElement).style.background="";}}>
                        <td style={{padding:"11px 14px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            <div style={{width:34,height:34,borderRadius:10,background:c.color,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:"0.7rem"}}>{c.initials}</div>
                            <div>
                              <div style={{fontSize:"0.83rem",fontWeight:700,color:STEEL}}>{c.company}</div>
                              <div style={{fontSize:"0.69rem",color:MUTED,marginTop:1}}>{c.name}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{padding:"11px 14px"}}><span style={{padding:"3px 9px",borderRadius:99,fontSize:"0.67rem",fontWeight:700,background:"#dce5f0",color:PRIMARY}}>{c.category}</span></td>
                        <td style={{padding:"11px 14px"}}>
                          <span style={{padding:"3px 10px",borderRadius:99,fontSize:"0.67rem",fontWeight:700,background:c.status==="active"?"#e5faf0":"#f1f5f9",color:c.status==="active"?"#22c55e":"#64748b"}}>
                            {c.status==="active"?"ใช้งาน":"ไม่ใช้งาน"}
                          </span>
                        </td>
                        <td style={{padding:"11px 14px"}}>
                          <span style={{display:"inline-flex",alignItems:"center",justifyContent:"center",minWidth:24,height:22,padding:"0 8px",borderRadius:99,fontSize:"0.7rem",fontWeight:800,background:c.projects>0?"#dce5f0":"#f1f5f9",color:c.projects>0?PRIMARY:"#9ca3af"}}>{c.projects}</span>
                        </td>
                        <td style={{padding:"11px 14px",fontSize:"0.78rem",color:MUTED}}>{c.province}</td>
                        <td style={{padding:"11px 14px",fontSize:"0.75rem",color:MUTED,whiteSpace:"nowrap"}}>{fmtDate(c.joinDate)}</td>
                        <td style={{padding:"11px 14px"}} onClick={e=>e.stopPropagation()}>
                          <button onClick={()=>router.push(`/customers/${c.id}`)}
                            style={{padding:"4px 10px",borderRadius:8,border:`1px solid ${BORDER}`,background:"#fff",color:PRIMARY,fontSize:"0.68rem",fontWeight:600,cursor:"pointer"}}>ดู →</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div style={{padding:"10px 16px",borderTop:`1px solid ${BORDER}`}}>
              <span style={{fontSize:"0.7rem",color:MUTED}}>แสดง {filtered.length} จาก {data.length} รายการ</span>
            </div>
          </div>
        )}
      </div>

      {/* ══ DETAIL PANEL ══════════════════════════════════════ */}
      {selected&&(
        <div style={{width:340,flexShrink:0,position:"sticky",top:80,maxHeight:"calc(100vh - 100px)",overflowY:"auto"}}>
          <div style={{...CARD,overflow:"hidden"}}>

            {/* Header */}
            <div style={{background:PRIMARY,padding:"16px 16px 12px"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:44,height:44,borderRadius:13,background:"rgba(255,255,255,.18)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:"1rem",border:"2px solid rgba(255,255,255,.25)",flexShrink:0}}>
                    {selected.initials}
                  </div>
                  <div>
                    <div style={{fontSize:"0.92rem",fontWeight:800,color:"#fff",lineHeight:1.2}}>{selected.company}</div>
                    <div style={{fontSize:"0.68rem",color:"rgba(255,255,255,.65)",marginTop:2}}>{selected.category} · {selected.province}</div>
                  </div>
                </div>
                <button onClick={()=>setSelected(null)} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                  <X size={14}/>
                </button>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <button onClick={()=>toggleStatus(selected.id)}
                  style={{padding:"2px 10px",borderRadius:99,fontSize:"0.64rem",fontWeight:700,background:selected.status==="active"?"#e5faf0":"#f1f5f9",color:selected.status==="active"?"#22c55e":"#9ca3af",border:"none",cursor:"pointer"}}>
                  {selected.status==="active"?"ใช้งาน":"ไม่ใช้งาน"}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{display:"flex",borderBottom:`1px solid ${BORDER}`,overflowX:"auto"}}>
              {detailTabs.map(t=>(
                <button key={t.key} onClick={()=>setDetailTab(t.key)}
                  style={{display:"flex",alignItems:"center",gap:4,padding:"9px 12px",border:"none",background:"none",cursor:"pointer",fontSize:"0.68rem",fontWeight:detailTab===t.key?700:500,color:detailTab===t.key?PRIMARY:MUTED,borderBottom:detailTab===t.key?`2px solid ${PRIMARY}`:"2px solid transparent",whiteSpace:"nowrap",marginBottom:-1}}>
                  {t.icon} {t.label}
                </button>
              ))}
            </div>

            {/* Tab: ข้อมูล */}
            {detailTab==="info"&&(
              <>
                <div style={{padding:"14px 16px",borderBottom:`1px solid #f0f4f8`}}>
                  <div style={{fontSize:"0.63rem",fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>ข้อมูลติดต่อ</div>
                  {([
                    {icon:<Building2 size={13} color={PRIMARY}/>,label:"เจ้าของ",   val:selected.name},
                    {icon:<Mail      size={13} color={PRIMARY}/>,label:"อีเมล",     val:selected.email},
                    {icon:<Phone     size={13} color={PRIMARY}/>,label:"โทรศัพท์", val:selected.phone},
                    {icon:<MapPin    size={13} color={PRIMARY}/>,label:"จังหวัด",   val:selected.province},
                  ]).map((row,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:8}}>
                      <div style={{width:28,height:28,borderRadius:8,background:"#dce5f0",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{row.icon}</div>
                      <div>
                        <div style={{fontSize:"0.62rem",color:"#9ca3af",fontWeight:600}}>{row.label}</div>
                        <div style={{fontSize:"0.76rem",color:STEEL,fontWeight:600,marginTop:1}}>{row.val}</div>
                      </div>
                    </div>
                  ))}
                  <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                    <div style={{width:28,height:28,borderRadius:8,background:"#dce5f0",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke={PRIMARY} strokeWidth={2}><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>
                    </div>
                    <div>
                      <div style={{fontSize:"0.62rem",color:"#9ca3af",fontWeight:600}}>ผู้รับผิดชอบ</div>
                      <div style={{fontSize:"0.76rem",color:STEEL,fontWeight:600,marginTop:1}}>{selected.owner}</div>
                    </div>
                  </div>
                </div>

                {/* Finance */}
                <div style={{padding:"14px 16px",borderBottom:`1px solid #f0f4f8`}}>
                  <div style={{fontSize:"0.63rem",fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10}}>สรุปการเงิน</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                    {[
                      {label:"Invoice",val:selected.invoiceCount.toString(),  accent:PRIMARY,  bg:"#dce5f0"},
                      {label:"ยอดรวม", val:fmtMoney(selected.totalValue),     accent:STEEL,    bg:"#f0f4f8"},
                      {label:"ชำระแล้ว",val:fmtMoney(selected.paidValue),    accent:"#22c55e",bg:"#e5faf0"},
                    ].map((item,i)=>(
                      <div key={i} style={{background:item.bg,borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                        <div style={{fontSize:"0.75rem",fontWeight:800,color:item.accent,lineHeight:1.2}}>{item.val}</div>
                        <div style={{fontSize:"0.6rem",color:MUTED,marginTop:3,fontWeight:600}}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                  {selected.totalValue>0&&(
                    <div style={{marginTop:8}}>
                      <div style={{height:4,borderRadius:99,background:"#f0f4f8",overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${Math.round((selected.paidValue/selected.totalValue)*100)}%`,background:"#22c55e",borderRadius:99,transition:"width .3s"}}/>
                      </div>
                      <div style={{fontSize:"0.62rem",color:MUTED,marginTop:4,textAlign:"right"}}>{Math.round((selected.paidValue/selected.totalValue)*100)}% ชำระแล้ว</div>
                    </div>
                  )}
                </div>

                {/* Related leads */}
                {relatedLeads.length>0&&(
                  <div style={{padding:"12px 16px",borderBottom:`1px solid #f0f4f8`}}>
                    <div style={{fontSize:"0.63rem",fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:8}}>ลีดที่เกี่ยวข้อง ({relatedLeads.length})</div>
                    {relatedLeads.map(l=>(
                      <button key={l.id} onClick={()=>router.push(`/leads/${l.numId}`)}
                        style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"7px 10px",borderRadius:9,border:`1px solid ${BORDER}`,background:"#fff",cursor:"pointer",marginBottom:5,textAlign:"left"}}
                        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="#dce5f0";}}
                        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="#fff";}}>
                        <span style={{padding:"2px 7px",borderRadius:6,fontSize:"0.6rem",fontWeight:700,background:"#dce5f0",color:PRIMARY,flexShrink:0}}>ลีด</span>
                        <span style={{fontSize:"0.75rem",fontWeight:700,color:STEEL,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.company}</span>
                        <span style={{fontSize:"0.62rem",color:PRIMARY}}>→</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Tab: โครงการ */}
            {detailTab==="projects"&&(
              <div style={{padding:"12px 16px"}}>
                {relatedProjects.length===0?(
                  <div style={{fontSize:"0.78rem",color:MUTED,textAlign:"center",padding:"24px 0"}}>ยังไม่มีโครงการ</div>
                ):(
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {relatedProjects.map(p=>(
                      <button key={p.id} onClick={()=>router.push(`/projects/${p.id}`)}
                        style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",borderRadius:10,background:"#f8f9fb",border:`1px solid #eef0f4`,cursor:"pointer",textAlign:"left",width:"100%"}}
                        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="#dce5f0";}}
                        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="#f8f9fb";}}>
                        <div style={{minWidth:0,flex:1}}>
                          <div style={{fontSize:"0.78rem",fontWeight:700,color:STEEL,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.title}</div>
                          <div style={{display:"flex",alignItems:"center",gap:8,marginTop:3}}>
                            <span style={{fontSize:"0.68rem",color:MUTED}}>{p.value}</span>
                            <div style={{height:3,flex:1,borderRadius:99,background:"#e5e7eb",overflow:"hidden"}}>
                              <div style={{height:"100%",width:`${p.progress}%`,background:PRIMARY,borderRadius:99}}/>
                            </div>
                            <span style={{fontSize:"0.65rem",color:PRIMARY,fontWeight:700,flexShrink:0}}>{p.progress}%</span>
                          </div>
                        </div>
                        <span style={{padding:"2px 7px",borderRadius:99,fontSize:"0.61rem",fontWeight:700,marginLeft:8,flexShrink:0,background:projectStatusColor[p.status].bg,color:projectStatusColor[p.status].text}}>
                          {projectStatusLabel[p.status]}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: ใบเสนอราคา */}
            {detailTab==="quotes"&&(
              <div style={{padding:"12px 16px"}}>
                {relatedQuotations.length===0?(
                  <div style={{fontSize:"0.78rem",color:MUTED,textAlign:"center",padding:"24px 0"}}>ยังไม่มีใบเสนอราคา</div>
                ):(
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {relatedQuotations.map(q=>(
                      <button key={q.id} onClick={()=>router.push("/quotations")}
                        style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px",borderRadius:10,background:"#f8f9fb",border:`1px solid #eef0f4`,cursor:"pointer",textAlign:"left",width:"100%"}}
                        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="#fef3cd";}}
                        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="#f8f9fb";}}>
                        <div style={{minWidth:0,flex:1}}>
                          <div style={{fontSize:"0.72rem",fontWeight:700,color:PRIMARY,fontFamily:"monospace"}}>{q.id}</div>
                          <div style={{fontSize:"0.75rem",fontWeight:700,color:STEEL,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q.project}</div>
                          <div style={{fontSize:"0.68rem",color:MUTED,marginTop:1}}>{q.total}</div>
                        </div>
                        <span style={{padding:"2px 7px",borderRadius:99,fontSize:"0.61rem",fontWeight:700,marginLeft:8,flexShrink:0,background:quotationStatusColor[q.status].bg,color:quotationStatusColor[q.status].text}}>
                          {quotationStatusLabel[q.status]}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: นัดหมาย */}
            {detailTab==="appts"&&(
              <div style={{padding:"12px 16px"}}>
                {relatedAppointments.length===0?(
                  <div style={{fontSize:"0.78rem",color:MUTED,textAlign:"center",padding:"24px 0"}}>ยังไม่มีนัดหมาย</div>
                ):(
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {relatedAppointments.map(a=>(
                      <button key={a.id} onClick={()=>router.push("/appointments")}
                        style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 12px",borderRadius:10,background:"#f8f9fb",border:`1px solid #eef0f4`,cursor:"pointer",textAlign:"left",width:"100%"}}
                        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="#e5faf0";}}
                        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="#f8f9fb";}}>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:"0.75rem",fontWeight:700,color:STEEL}}>{a.project}</div>
                          <div style={{fontSize:"0.68rem",color:MUTED,marginTop:2}}>{a.date} · {a.time} น.</div>
                        </div>
                        <span style={{padding:"2px 7px",borderRadius:99,fontSize:"0.61rem",fontWeight:700,background:"#dce5f0",color:PRIMARY,flexShrink:0}}>
                          {a.status==="upcoming"?"กำลังจะมาถึง":a.status==="done"?"เสร็จแล้ว":"ยกเลิก"}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div style={{padding:"12px 16px",borderTop:`1px solid ${BORDER}`,display:"flex",flexDirection:"column",gap:6}}>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>setEditingRow(selected)}
                  style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"9px 0",borderRadius:10,background:PRIMARY,color:"#fff",border:"none",fontSize:"0.76rem",fontWeight:700,cursor:"pointer"}}>
                  <Edit2 size={13}/> แก้ไข
                </button>
                <button onClick={()=>router.push(`/customers/${selected.id}`)}
                  style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"9px 0",borderRadius:10,background:"#f0f4f8",color:STEEL,border:`1px solid ${BORDER}`,fontSize:"0.76rem",fontWeight:700,cursor:"pointer"}}>
                  <ExternalLink size={13}/> หน้าเต็ม
                </button>
              </div>
              <button onClick={()=>router.push("/appointments")}
                style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"8px 0",borderRadius:10,background:"#dce5f0",color:PRIMARY,border:"none",fontSize:"0.75rem",fontWeight:700,cursor:"pointer"}}>
                <Calendar size={13}/> เพิ่มนัดหมาย
              </button>
              {/* Delete */}
              {!showDeleteConfirm?(
                <button onClick={()=>setShowDeleteConfirm(true)}
                  style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,padding:"7px 0",borderRadius:10,background:"#fff",color:"#f04d6a",border:`1px solid ${BORDER}`,fontSize:"0.73rem",fontWeight:700,cursor:"pointer"}}>
                  <Trash2 size={13}/> ลบลูกค้า
                </button>
              ):(
                <div style={{borderRadius:10,border:"1px solid #fca5a5",overflow:"hidden"}}>
                  <div style={{padding:"7px 12px",background:"#fdeaed",fontSize:"0.7rem",color:"#f04d6a",fontWeight:600}}>ยืนยันลบ "{selected.company}"?</div>
                  <div style={{display:"flex"}}>
                    <button onClick={deleteCustomer} style={{flex:1,padding:"7px",background:"#f04d6a",border:"none",color:"#fff",fontSize:"0.7rem",fontWeight:700,cursor:"pointer"}}>ลบ</button>
                    <button onClick={()=>setShowDeleteConfirm(false)} style={{flex:1,padding:"7px",background:"#fff",border:"none",borderLeft:"1px solid #fca5a5",color:STEEL,fontSize:"0.7rem",cursor:"pointer"}}>ยกเลิก</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAdd&&<CustomerModal initial={BLANK_FORM} title="เพิ่มลูกค้าใหม่" onSave={addCustomer} onClose={()=>setShowAdd(false)}/>}

      {/* Edit Modal */}
      {editingRow&&(
        <CustomerModal
          initial={{name:editingRow.name,company:editingRow.company,email:editingRow.email,phone:editingRow.phone,province:editingRow.province,category:editingRow.category,status:editingRow.status,projects:editingRow.projects,joinDate:editingRow.joinDate,owner:editingRow.owner}}
          title="แก้ไขข้อมูลลูกค้า" onSave={saveEdit} onClose={()=>setEditingRow(null)}/>
      )}
    </div>
  );
}
