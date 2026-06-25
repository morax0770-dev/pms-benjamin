"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  payments as INIT_PAY, invoices, contracts, customers,
  paymentMethodLabel, paymentMethodColor,
  paymentStatusLabel, paymentStatusColor,
  invoiceStatusLabel, invoiceStatusColor,
  contractStatusLabel, contractStatusColor,
  type PaymentStatus, type PaymentMethod, type PaymentMock,
} from "@/lib/mock";
import {
  Plus, Search, X, Wallet, LayoutList, LayoutGrid,
  Download, Edit2, Trash2, ChevronUp, ChevronDown,
  ArrowRight, ExternalLink, Receipt, FileSignature,
  Banknote, CreditCard, CheckCircle2,
} from "lucide-react";

// ── Tokens ─────────────────────────────────────────────────────
const PRIMARY = "#003366";
const STEEL   = "#2D2D2D";
const BORDER  = "#cfd4dc";
const MUTED   = "#6b7280";
const CARD: React.CSSProperties = {
  background:"#fff", borderRadius:16, border:`1px solid ${BORDER}`,
  boxShadow:"0 2px 14px rgba(0,51,102,.07)",
};

// ── Status workflow ────────────────────────────────────────────
const STATUS_ACTIONS: Record<PaymentStatus,{label:string;next:PaymentStatus;bg:string;color:string}[]> = {
  pending:   [{label:"ยืนยันการรับเงิน",next:"confirmed",bg:"#e5faf0",color:"#22c55e"},{label:"ยกเลิก",next:"cancelled",bg:"#fdeaed",color:"#f04d6a"}],
  confirmed: [],
  cancelled: [{label:"เปิดรายการใหม่",next:"pending",bg:"#fef3cd",color:"#f59e0b"}],
};

const ALL_STATUSES: PaymentStatus[] = ["pending","confirmed","cancelled"];
const ALL_METHODS: PaymentMethod[]  = ["transfer","cheque","cash"];
const AGENTS = ["สมชาย","วิภา","วิชัย","กาญจนา","สมชาย เชียงใหม่"];

type SortKey = "id"|"client"|"amount"|"paidDate"|"status"|"method";
type SortDir = "asc"|"desc";
type PForm = {
  invoiceRef:string; client:string; amount:number;
  method:PaymentMethod; paidDate:string; salesPerson:string;
  note:string; status:PaymentStatus;
};

// ── Helpers ───────────────────────────────────────────────────
function fmt(n:number){ return "฿"+n.toLocaleString("th-TH"); }
function nextPayId(data:PaymentMock[]){
  const nums=data.map(p=>parseInt(p.id.split("-")[2]??"")||0);
  return `PAY-2026-${String(Math.max(...nums,0)+1).padStart(3,"0")}`;
}
function fmtDate(d:string){ if(!d||d==="—") return "—"; const [y,m,day]=d.split("-"); const mo=["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."]; return `${parseInt(day)} ${mo[parseInt(m)-1]} ${parseInt(y)+543}`; }
function exportCSV(rows:PaymentMock[]){
  const h=["เลขที่","ใบแจ้งหนี้","ลูกค้า","ยอดชำระ","วิธีชำระ","วันที่","เซลล์","สถานะ","หมายเหตุ"];
  const lines=rows.map(p=>[p.id,p.invoiceRef,p.client,p.amount,paymentMethodLabel[p.method],p.paidDate,p.salesPerson,paymentStatusLabel[p.status],p.note].join(","));
  const blob=new Blob(["﻿"+[h.join(","),...lines].join("\n")],{type:"text/csv;charset=utf-8;"});
  const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="payments.csv"; a.click(); URL.revokeObjectURL(url);
}
const TODAY = "2026-06-23";
function buildBlank():PForm{
  return {invoiceRef:"",client:customers[0].company,amount:0,method:"transfer",paidDate:TODAY,salesPerson:"สมชาย",note:"",status:"pending"};
}

const METHOD_ICONS: Record<PaymentMethod,React.ReactNode> = {
  transfer: <Banknote size={15}/>,
  cheque:   <CreditCard size={15}/>,
  cash:     <Wallet size={15}/>,
};

// ── Modal ─────────────────────────────────────────────────────
function PaymentModal({initial,title,onSave,onClose}:{
  initial:PForm; title:string; onSave:(f:PForm)=>void; onClose:()=>void;
}){
  const [form,setForm]=useState<PForm>(initial);
  const INP:React.CSSProperties={width:"100%",border:`1px solid ${BORDER}`,borderRadius:9,padding:"8px 12px",fontSize:"0.82rem",outline:"none",color:STEEL,boxSizing:"border-box"};
  const LBL:React.CSSProperties={fontSize:"0.68rem",fontWeight:700,color:MUTED,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.04em"};
  function set<K extends keyof PForm>(k:K,v:PForm[K]){setForm(p=>({...p,[k]:v}));}
  function pickInvoice(id:string){
    const inv=invoices.find(i=>i.id===id); if(!inv) return;
    setForm(p=>({...p,invoiceRef:id,client:inv.client,amount:inv.total}));
  }
  function pickCustomer(cid:number){
    const cu=customers.find(c=>c.id===cid); if(!cu) return;
    setForm(p=>({...p,client:cu.company}));
  }
  function submit(){if(!form.client||form.amount<=0) return; onSave(form); onClose();}
  return (
    <>
      <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(45,45,45,.4)",zIndex:200}}/>
      <div onClick={e=>e.stopPropagation()} style={{position:"fixed",inset:0,zIndex:210,display:"flex",alignItems:"center",justifyContent:"center",padding:20,pointerEvents:"none"}}>
        <div style={{...CARD,width:"100%",maxWidth:520,pointerEvents:"auto",overflow:"hidden",boxShadow:"0 24px 80px rgba(0,51,102,.2)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 22px",borderBottom:`1px solid ${BORDER}`,background:PRIMARY}}>
            <div style={{fontSize:"0.92rem",fontWeight:800,color:"#fff"}}>{title}</div>
            <button onClick={onClose} style={{width:28,height:28,borderRadius:8,border:"1px solid rgba(255,255,255,.2)",background:"rgba(255,255,255,.1)",color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={13}/></button>
          </div>
          <div style={{padding:"20px 22px",overflowY:"auto",maxHeight:"66vh",display:"flex",flexDirection:"column",gap:13}}>
            {/* Invoice picker */}
            <div>
              <label style={LBL}>อ้างอิงใบแจ้งหนี้</label>
              <select onChange={e=>pickInvoice(e.target.value)} style={INP} defaultValue="">
                <option value="">— เลือกใบแจ้งหนี้ (ไม่บังคับ) —</option>
                {invoices.map(i=><option key={i.id} value={i.id}>{i.id} — {i.client} — {fmt(i.total)}</option>)}
              </select>
              <input value={form.invoiceRef} onChange={e=>set("invoiceRef",e.target.value)} placeholder="เลขที่ใบแจ้งหนี้ เช่น INV-2026-0041" style={{...INP,marginTop:6}}/>
            </div>
            {/* Client */}
            <div>
              <label style={LBL}>ลูกค้า *</label>
              <select onChange={e=>pickCustomer(Number(e.target.value))} style={INP} defaultValue="">
                <option value="" disabled>— เลือกลูกค้า —</option>
                {customers.map(c=><option key={c.id} value={c.id}>{c.company}</option>)}
              </select>
              <input value={form.client} onChange={e=>set("client",e.target.value)} placeholder="ชื่อลูกค้า" style={{...INP,marginTop:6}}/>
            </div>
            {/* Amount */}
            <div>
              <label style={LBL}>ยอดชำระ (บาท) *</label>
              <input type="number" value={form.amount||""} onChange={e=>set("amount",Number(e.target.value))} placeholder="0" style={INP}/>
              {form.amount>0&&<div style={{marginTop:6,padding:"8px 12px",background:"#e5faf0",borderRadius:9,fontSize:"0.8rem",fontWeight:800,color:"#22c55e"}}>{fmt(form.amount)}</div>}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div>
                <label style={LBL}>วิธีชำระ</label>
                <select value={form.method} onChange={e=>set("method",e.target.value as PaymentMethod)} style={INP}>
                  {ALL_METHODS.map(m=><option key={m} value={m}>{paymentMethodLabel[m]}</option>)}
                </select>
              </div>
              <div>
                <label style={LBL}>สถานะ</label>
                <select value={form.status} onChange={e=>set("status",e.target.value as PaymentStatus)} style={INP}>
                  {ALL_STATUSES.map(s=><option key={s} value={s}>{paymentStatusLabel[s]}</option>)}
                </select>
              </div>
              <div>
                <label style={LBL}>วันที่ชำระ</label>
                <input type="date" value={form.paidDate==="—"?"":form.paidDate} onChange={e=>set("paidDate",e.target.value||"—")} style={INP}/>
              </div>
              <div>
                <label style={LBL}>เซลล์ / ผู้รับ</label>
                <select value={form.salesPerson} onChange={e=>set("salesPerson",e.target.value)} style={INP}>
                  {AGENTS.map(a=><option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={LBL}>หมายเหตุ</label>
              <textarea value={form.note} onChange={e=>set("note",e.target.value)} placeholder="หมายเหตุเพิ่มเติม" rows={2}
                style={{...INP,resize:"none",lineHeight:1.5}}/>
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

// ── Main ──────────────────────────────────────────────────────
export default function PaymentsPage(){
  const router = useRouter();
  const [data,setData]             = useState<PaymentMock[]>(INIT_PAY);
  const [query,setQuery]           = useState("");
  const [filterStatus,setFilterStatus] = useState<PaymentStatus|"ALL">("ALL");
  const [filterMethod,setFilterMethod] = useState<PaymentMethod|"ALL">("ALL");
  const [view,setView]             = useState<"list"|"card">("list");
  const [sortKey,setSortKey]       = useState<SortKey>("paidDate");
  const [sortDir,setSortDir]       = useState<SortDir>("desc");
  const [selected,setSelected]     = useState<PaymentMock|null>(null);
  const [showModal,setShowModal]   = useState(false);
  const [editingPay,setEditingPay] = useState<PaymentMock|null>(null);
  const [delConfirm,setDelConfirm] = useState(false);
  const [detailTab,setDetailTab]   = useState<"info"|"invoice"|"contract"|"customer">("info");

  function handleSort(k:SortKey){if(sortKey===k)setSortDir(d=>d==="asc"?"desc":"asc");else{setSortKey(k);setSortDir("asc");}}
  const SortIcon=({k}:{k:SortKey})=>sortKey===k?(sortDir==="asc"?<ChevronUp size={10} style={{marginLeft:2}}/>:<ChevronDown size={10} style={{marginLeft:2}}/>):<ChevronDown size={10} style={{marginLeft:2,opacity:.3}}/>;

  const filtered = useMemo(()=>{
    let rows=data.filter(p=>{
      const matchQ=!query||p.id.toLowerCase().includes(query.toLowerCase())||p.client.toLowerCase().includes(query.toLowerCase())||p.invoiceRef.toLowerCase().includes(query.toLowerCase())||p.salesPerson.includes(query);
      const matchS=filterStatus==="ALL"||p.status===filterStatus;
      const matchM=filterMethod==="ALL"||p.method===filterMethod;
      return matchQ&&matchS&&matchM;
    });
    rows=[...rows].sort((a,b)=>{
      const va=a[sortKey] as string|number;
      const vb=b[sortKey] as string|number;
      const cmp=typeof va==="number"?(va as number)-(vb as number):(va as string).localeCompare(vb as string,"th");
      return sortDir==="asc"?cmp:-cmp;
    });
    return rows;
  },[data,query,filterStatus,filterMethod,sortKey,sortDir]);

  // Stats
  const confirmed   = data.filter(p=>p.status==="confirmed");
  const pending     = data.filter(p=>p.status==="pending");
  const cancelled   = data.filter(p=>p.status==="cancelled");
  const totalRec    = confirmed.reduce((s,p)=>s+p.amount,0);
  const totalPend   = pending.reduce((s,p)=>s+p.amount,0);
  // Method breakdown
  const byMethod    = ALL_METHODS.map(m=>({m,total:confirmed.filter(p=>p.method===m).reduce((s,p)=>s+p.amount,0),cnt:confirmed.filter(p=>p.method===m).length}));

  // Related data for selected
  const relInvoice  = selected ? invoices.find(i=>i.id===selected.invoiceRef) : null;
  const relContract = relInvoice ? contracts.find(c=>c.id===relInvoice.contractRef) : null;
  const relCustomer = selected ? customers.find(c=>c.company===selected.client) : null;

  function openAdd(){ setEditingPay(null); setShowModal(true); }
  function openEdit(p:PaymentMock){ setEditingPay(p); setShowModal(true); }
  function savePayment(form:PForm){
    if(editingPay){
      const updated={...editingPay,...form};
      setData(p=>p.map(x=>x.id===editingPay.id?updated:x));
      setSelected(p=>p?.id===editingPay.id?updated:p);
    } else {
      setData(p=>[{...form,id:nextPayId(data)},...p]);
    }
  }
  function changeStatus(id:string,s:PaymentStatus){
    setData(p=>p.map(x=>x.id===id?{...x,status:s}:x));
    setSelected(p=>p?.id===id?{...p,status:s}:p);
  }
  function deletePayment(){
    if(!selected) return;
    setData(p=>p.filter(x=>x.id!==selected.id));
    setSelected(null); setDelConfirm(false);
  }
  function selectRow(p:PaymentMock){setSelected(x=>x?.id===p.id?null:p); setDetailTab("info"); setDelConfirm(false);}
  function toForm(p:PaymentMock):PForm{
    return {invoiceRef:p.invoiceRef,client:p.client,amount:p.amount,method:p.method,paidDate:p.paidDate,salesPerson:p.salesPerson,note:p.note,status:p.status};
  }

  const dtabs:[string,string][]=[["info","ข้อมูล"],["invoice","ใบแจ้งหนี้"],["contract","สัญญา"],["customer","ลูกค้า"]];

  return (
    <div style={{display:"flex",gap:16,alignItems:"flex-start"}}>

      {/* ══ MAIN ════════════════════════════════════════════ */}
      <div style={{flex:1,minWidth:0}}>

        {/* Header */}
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12}}>
          <div>
            <h1 style={{fontSize:"1.55rem",fontWeight:800,color:STEEL,lineHeight:1.2,margin:0}}>การชำระเงิน</h1>
            <div style={{fontSize:"0.76rem",color:MUTED,marginTop:4}}>บันทึกและติดตามการรับชำระเงิน</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={()=>exportCSV(filtered)}
              style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:99,border:`1px solid ${BORDER}`,background:"#fff",color:STEEL,fontSize:"0.75rem",fontWeight:600,cursor:"pointer"}}>
              <Download size={13}/> ส่งออก
            </button>
            <button onClick={openAdd}
              style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",borderRadius:99,border:"none",background:PRIMARY,color:"#fff",fontSize:"0.75rem",fontWeight:700,cursor:"pointer",boxShadow:"0 4px 10px rgba(0,51,102,.22)"}}>
              <Plus size={13}/> บันทึกการรับเงิน
            </button>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:12}}>
          {[
            {label:"ยอดรับทั้งหมด",  value:fmt(totalRec),         color:"#22c55e",  key:"confirmed"},
            {label:"รอยืนยัน",        value:fmt(totalPend),        color:"#f59e0b",  key:"pending"},
            {label:"ยืนยันแล้ว",      value:`${confirmed.length} รายการ`, color:PRIMARY, key:"confirmed"},
            {label:"ทั้งหมด",         value:`${data.length} รายการ`, color:STEEL,    key:"ALL"},
          ].map((s,i)=>(
            <div key={i} onClick={()=>setFilterStatus(s.key as PaymentStatus|"ALL")}
              style={{...CARD,padding:"14px 16px",cursor:"pointer"}}
              onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.boxShadow="0 4px 16px rgba(0,51,102,.12)";}}
              onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.boxShadow="0 2px 14px rgba(0,51,102,.07)";}}>
              <div style={{fontSize:"0.7rem",color:MUTED,fontWeight:600,marginBottom:6}}>{s.label}</div>
              <div style={{fontSize:i<2?"0.92rem":"1.1rem",fontWeight:800,color:s.color}}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Method breakdown */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
          {byMethod.map(({m,total,cnt})=>{
            const mc=paymentMethodColor[m]; const active=filterMethod===m;
            return (
              <div key={m} onClick={()=>setFilterMethod(active?"ALL":m)}
                style={{...CARD,padding:"12px 16px",cursor:"pointer",border:active?`1.5px solid ${mc.text}`:undefined,background:active?mc.bg:"#fff"}}
                onMouseEnter={e=>{if(!active)(e.currentTarget as HTMLElement).style.background="#f8f9fb";}}
                onMouseLeave={e=>{if(!active)(e.currentTarget as HTMLElement).style.background="#fff";}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <div style={{width:30,height:30,borderRadius:9,background:mc.bg,display:"flex",alignItems:"center",justifyContent:"center",color:mc.text}}>
                    {METHOD_ICONS[m]}
                  </div>
                  <div style={{fontSize:"0.72rem",fontWeight:700,color:active?mc.text:MUTED}}>{paymentMethodLabel[m]}</div>
                </div>
                <div style={{fontSize:"0.88rem",fontWeight:800,color:active?mc.text:STEEL}}>{fmt(total)}</div>
                <div style={{fontSize:"0.65rem",color:MUTED,marginTop:2}}>{cnt} รายการ</div>
              </div>
            );
          })}
        </div>

        {/* Status filter */}
        <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
          {([["ALL","ทั้งหมด",data.length],...ALL_STATUSES.map(s=>[s,paymentStatusLabel[s],data.filter(p=>p.status===s).length])] as [string,string,number][]).map(([key,label,cnt])=>{
            const active=filterStatus===key;
            const col=key==="ALL"?{bg:"#dce5f0",text:PRIMARY}:paymentStatusColor[key as PaymentStatus]??{bg:"#dce5f0",text:PRIMARY};
            return (
              <button key={key} onClick={()=>setFilterStatus(key as PaymentStatus|"ALL")}
                style={{padding:"5px 14px",borderRadius:99,border:`1px solid ${active?col.text+"60":BORDER}`,background:active?col.bg:"#fff",color:active?col.text:MUTED,fontSize:"0.72rem",fontWeight:600,cursor:"pointer"}}>
                {label} ({cnt})
              </button>
            );
          })}
          {filterMethod!=="ALL"&&(
            <button onClick={()=>setFilterMethod("ALL")}
              style={{display:"flex",alignItems:"center",gap:4,padding:"5px 12px",borderRadius:99,border:"1px solid #f59e0b60",background:"#fef3cd",color:"#f59e0b",fontSize:"0.72rem",fontWeight:600,cursor:"pointer"}}>
              {paymentMethodLabel[filterMethod]} <X size={10}/>
            </button>
          )}
        </div>

        {/* Toolbar */}
        <div style={{...CARD,borderRadius:"14px 14px 0 0",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"none",gap:10,flexWrap:"wrap"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,background:"#fafafa",border:`1px solid ${BORDER}`,borderRadius:10,padding:"7px 12px",minWidth:280}}>
            <Search size={13} color={MUTED}/>
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="ค้นหา PAY / INV / ลูกค้า / เซลล์..."
              style={{border:"none",outline:"none",fontSize:"0.78rem",color:STEEL,background:"transparent",flex:1}}/>
            {query&&<button onClick={()=>setQuery("")} style={{background:"none",border:"none",cursor:"pointer",padding:0,color:MUTED,display:"flex"}}><X size={12}/></button>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{display:"flex",alignItems:"center",background:"#f0f4f8",borderRadius:99,padding:3,border:`1px solid ${BORDER}`}}>
              {(["list","card"] as const).map(v=>(
                <button key={v} onClick={()=>setView(v)}
                  style={{display:"flex",alignItems:"center",gap:5,padding:"5px 12px",borderRadius:99,border:"none",background:view===v?PRIMARY:"transparent",color:view===v?"#fff":MUTED,fontSize:"0.71rem",fontWeight:700,cursor:"pointer",transition:"all .15s"}}>
                  {v==="list"?<LayoutList size={12}/>:<LayoutGrid size={12}/>}{v==="list"?"รายการ":"การ์ด"}
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
                    {([{l:"เลขที่",k:"id"},{l:"ใบแจ้งหนี้",k:null},{l:"ลูกค้า",k:"client"},{l:"ยอดชำระ",k:"amount"},{l:"วิธีชำระ",k:"method"},{l:"วันที่",k:"paidDate"},{l:"เซลล์",k:null},{l:"สถานะ",k:"status"},{l:"",k:null}] as {l:string;k:SortKey|null}[]).map((col,i)=>(
                      <th key={i} onClick={col.k?()=>handleSort(col.k as SortKey):undefined}
                        style={{fontSize:"0.63rem",fontWeight:700,color:MUTED,textTransform:"uppercase",letterSpacing:"0.05em",padding:"10px 14px",textAlign:"left",whiteSpace:"nowrap",cursor:col.k?"pointer":"default",userSelect:"none"}}>
                        <span style={{display:"inline-flex",alignItems:"center"}}>{col.l}{col.k&&<SortIcon k={col.k}/>}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length===0&&<tr><td colSpan={9} style={{textAlign:"center",padding:"40px 0",color:MUTED,fontSize:"0.82rem"}}>ไม่พบรายการชำระเงิน</td></tr>}
                  {filtered.map(p=>{
                    const mc=paymentMethodColor[p.method]; const sc=paymentStatusColor[p.status]; const isSel=selected?.id===p.id;
                    return (
                      <tr key={p.id} onClick={()=>selectRow(p)}
                        style={{borderBottom:"1px solid #f0f4f8",cursor:"pointer",background:isSel?"#f0f6ff":undefined,transition:"background .1s"}}
                        onMouseEnter={e=>{if(!isSel)(e.currentTarget as HTMLElement).style.background="#f8f9fb";}}
                        onMouseLeave={e=>{if(!isSel)(e.currentTarget as HTMLElement).style.background="";}}>
                        <td style={{padding:"11px 14px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{width:28,height:28,borderRadius:8,background:sc.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                              <Wallet size={12} color={sc.text}/>
                            </div>
                            <span style={{fontSize:"0.78rem",fontWeight:700,color:STEEL,fontFamily:"monospace"}}>{p.id}</span>
                          </div>
                        </td>
                        <td style={{padding:"11px 14px"}}>
                          <button onClick={e=>{e.stopPropagation();router.push("/invoices");}}
                            style={{background:"none",border:"none",cursor:"pointer",color:PRIMARY,fontSize:"0.78rem",fontWeight:700,padding:0}}>
                            {p.invoiceRef||"—"}
                          </button>
                        </td>
                        <td style={{padding:"11px 14px"}}>
                          <button onClick={e=>{e.stopPropagation();const cu=customers.find(c=>c.company===p.client);if(cu)router.push(`/customers/${cu.id}`);}}
                            style={{background:"none",border:"none",cursor:"pointer",color:PRIMARY,fontSize:"0.82rem",fontWeight:700,padding:0,textAlign:"left"}}>
                            {p.client}
                          </button>
                        </td>
                        <td style={{padding:"11px 14px",fontSize:"0.92rem",fontWeight:800,color:STEEL,whiteSpace:"nowrap"}}>{fmt(p.amount)}</td>
                        <td style={{padding:"11px 14px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:5}}>
                            <span style={{padding:"3px 9px",borderRadius:99,fontSize:"0.65rem",fontWeight:700,background:mc.bg,color:mc.text}}>{paymentMethodLabel[p.method]}</span>
                          </div>
                        </td>
                        <td style={{padding:"11px 14px",fontSize:"0.75rem",color:MUTED,whiteSpace:"nowrap"}}>{fmtDate(p.paidDate)}</td>
                        <td style={{padding:"11px 14px",fontSize:"0.76rem",color:MUTED}}>{p.salesPerson}</td>
                        <td style={{padding:"11px 14px"}}>
                          <span style={{padding:"3px 9px",borderRadius:99,fontSize:"0.65rem",fontWeight:700,background:sc.bg,color:sc.text}}>{paymentStatusLabel[p.status]}</span>
                        </td>
                        <td style={{padding:"11px 14px"}} onClick={e=>e.stopPropagation()}>
                          <div style={{display:"flex",gap:4}}>
                            {STATUS_ACTIONS[p.status].length>0&&(
                              <button onClick={()=>changeStatus(p.id,STATUS_ACTIONS[p.status][0].next)}
                                style={{padding:"4px 8px",borderRadius:7,border:"none",background:STATUS_ACTIONS[p.status][0].bg,color:STATUS_ACTIONS[p.status][0].color,fontSize:"0.62rem",fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
                                {STATUS_ACTIONS[p.status][0].label.split(" ")[0]}
                              </button>
                            )}
                            <button onClick={()=>openEdit(p)}
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
              <span style={{fontSize:"0.72rem",color:MUTED}}>แสดง {filtered.length} จาก {data.length} รายการ · ยอดรวม: {fmt(filtered.reduce((s,p)=>s+p.amount,0))}</span>
            </div>
          </div>
        )}

        {/* ── CARD VIEW ── */}
        {view==="card"&&(
          <div style={{...CARD,borderRadius:"0 0 14px 14px",borderTop:"none",padding:16}}>
            {filtered.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:MUTED}}>ไม่พบรายการชำระเงิน</div>}
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:14}}>
              {filtered.map(p=>{
                const mc=paymentMethodColor[p.method]; const sc=paymentStatusColor[p.status]; const isSel=selected?.id===p.id;
                return (
                  <div key={p.id} onClick={()=>selectRow(p)}
                    style={{borderRadius:14,border:isSel?`1.5px solid ${PRIMARY}`:`1px solid ${BORDER}`,boxShadow:isSel?"0 4px 18px rgba(0,51,102,.15)":"0 2px 10px rgba(0,51,102,.06)",overflow:"hidden",cursor:"pointer",transition:"all .15s",background:"#fff"}}
                    onMouseEnter={e=>{if(!isSel)(e.currentTarget as HTMLElement).style.boxShadow="0 6px 22px rgba(0,51,102,.13)";}}
                    onMouseLeave={e=>{if(!isSel)(e.currentTarget as HTMLElement).style.boxShadow="0 2px 10px rgba(0,51,102,.06)";}}>
                    {/* Header */}
                    <div style={{padding:"12px 14px",background:p.status==="confirmed"?"#e5faf0":p.status==="pending"?"#fef3cd":"#fdeaed",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <div style={{width:30,height:30,borderRadius:9,background:mc.bg,display:"flex",alignItems:"center",justifyContent:"center",color:mc.text,flexShrink:0}}>
                          {METHOD_ICONS[p.method]}
                        </div>
                        <div>
                          <div style={{fontSize:"0.72rem",fontWeight:800,color:STEEL,fontFamily:"monospace"}}>{p.id}</div>
                          <div style={{fontSize:"0.62rem",color:MUTED,marginTop:1}}>{fmtDate(p.paidDate)}</div>
                        </div>
                      </div>
                      <span style={{padding:"3px 8px",borderRadius:99,fontSize:"0.62rem",fontWeight:700,background:sc.bg,color:sc.text}}>{paymentStatusLabel[p.status]}</span>
                    </div>
                    {/* Body */}
                    <div style={{padding:"12px 14px"}}>
                      <button onClick={e=>{e.stopPropagation();const cu=customers.find(c=>c.company===p.client);if(cu)router.push(`/customers/${cu.id}`);}}
                        style={{background:"none",border:"none",cursor:"pointer",color:PRIMARY,fontSize:"0.88rem",fontWeight:800,padding:0,textAlign:"left",display:"block",marginBottom:3}}>
                        {p.client}
                      </button>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                        {p.invoiceRef&&<button onClick={e=>{e.stopPropagation();router.push("/invoices");}} style={{background:"none",border:"none",cursor:"pointer",color:PRIMARY,fontSize:"0.68rem",fontWeight:700,padding:0}}>{p.invoiceRef}</button>}
                        <span style={{fontSize:"0.65rem",color:MUTED}}>· {p.salesPerson}</span>
                      </div>
                      <div style={{fontSize:"1.5rem",fontWeight:800,color:p.status==="confirmed"?"#22c55e":p.status==="pending"?"#f59e0b":MUTED,textAlign:"center",padding:"8px 0"}}>
                        {fmt(p.amount)}
                      </div>
                      <div style={{textAlign:"center",marginBottom:6}}>
                        <span style={{padding:"3px 10px",borderRadius:99,fontSize:"0.65rem",fontWeight:700,background:mc.bg,color:mc.text}}>{paymentMethodLabel[p.method]}</span>
                      </div>
                      {p.note&&<div style={{fontSize:"0.67rem",color:MUTED,borderTop:`1px solid ${BORDER}`,paddingTop:8,marginTop:4}}>{p.note}</div>}
                    </div>
                    {/* Footer */}
                    <div style={{padding:"8px 14px",borderTop:`1px solid ${BORDER}`,display:"flex",gap:4}} onClick={e=>e.stopPropagation()}>
                      {STATUS_ACTIONS[p.status].length>0&&STATUS_ACTIONS[p.status].slice(0,1).map(action=>(
                        <button key={action.next} onClick={()=>changeStatus(p.id,action.next)}
                          style={{flex:1,padding:"6px 0",borderRadius:8,border:"none",background:action.bg,color:action.color,fontSize:"0.68rem",fontWeight:700,cursor:"pointer"}}>
                          {action.label}
                        </button>
                      ))}
                      <button onClick={()=>openEdit(p)}
                        style={{flex:1,padding:"6px 0",borderRadius:8,border:`1px solid ${BORDER}`,background:"#fff",color:PRIMARY,fontSize:"0.68rem",fontWeight:600,cursor:"pointer"}}>แก้ไข</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{padding:"10px 16px",borderTop:`1px solid ${BORDER}`,marginTop:16}}>
              <span style={{fontSize:"0.72rem",color:MUTED}}>แสดง {filtered.length} จาก {data.length} รายการ · ยอดรวม: {fmt(filtered.reduce((s,p)=>s+p.amount,0))}</span>
            </div>
          </div>
        )}
      </div>

      {/* ══ DETAIL PANEL ════════════════════════════════════ */}
      {selected&&(
        <div style={{width:330,flexShrink:0,position:"sticky",top:80,maxHeight:"calc(100vh - 100px)",overflowY:"auto"}}>
          <div style={{...CARD,overflow:"hidden"}}>

            {/* Panel header */}
            <div style={{background:selected.status==="confirmed"?"#1a7a4a":selected.status==="pending"?"#c97c00":"#b03050",padding:"16px 16px 12px"}}>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:10}}>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:"0.64rem",fontWeight:700,color:"rgba(255,255,255,.55)",fontFamily:"monospace",letterSpacing:"0.05em"}}>{selected.id}</div>
                  <div style={{fontSize:"0.9rem",fontWeight:800,color:"#fff",lineHeight:1.25,marginTop:2}}>{selected.client}</div>
                  <div style={{fontSize:"0.68rem",color:"rgba(255,255,255,.65)",marginTop:2}}>{paymentMethodLabel[selected.method]} · {fmtDate(selected.paidDate)}</div>
                </div>
                <button onClick={()=>setSelected(null)} style={{background:"rgba(255,255,255,.15)",border:"none",borderRadius:8,width:28,height:28,cursor:"pointer",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginLeft:8}}>
                  <X size={14}/>
                </button>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <span style={{padding:"2px 10px",borderRadius:99,fontSize:"0.63rem",fontWeight:700,background:paymentStatusColor[selected.status].bg,color:paymentStatusColor[selected.status].text}}>
                  {paymentStatusLabel[selected.status]}
                </span>
                <span style={{fontSize:"1.1rem",fontWeight:800,color:"rgba(255,255,255,.95)"}}>{fmt(selected.amount)}</span>
              </div>
            </div>

            {/* Tabs */}
            <div style={{display:"flex",borderBottom:`1px solid ${BORDER}`}}>
              {dtabs.map(([key,label])=>(
                <button key={key} onClick={()=>setDetailTab(key as typeof detailTab)}
                  style={{flex:1,padding:"8px 6px",border:"none",background:"none",cursor:"pointer",fontSize:"0.63rem",fontWeight:detailTab===key?700:500,color:detailTab===key?PRIMARY:MUTED,borderBottom:detailTab===key?`2px solid ${PRIMARY}`:"2px solid transparent",whiteSpace:"nowrap",marginBottom:-1}}>
                  {label}
                </button>
              ))}
            </div>

            {/* Tab: ข้อมูล */}
            {detailTab==="info"&&(
              <div style={{padding:"14px 16px"}}>
                {/* Amount highlight */}
                <div style={{textAlign:"center",padding:"14px 0 10px",marginBottom:12,borderBottom:`1px solid ${BORDER}`}}>
                  {selected.status==="confirmed"&&<CheckCircle2 size={20} color="#22c55e" style={{marginBottom:6}}/>}
                  <div style={{fontSize:"1.8rem",fontWeight:800,color:selected.status==="confirmed"?"#22c55e":selected.status==="pending"?"#f59e0b":"#f04d6a"}}>{fmt(selected.amount)}</div>
                  <div style={{fontSize:"0.7rem",color:MUTED,marginTop:4}}>{paymentMethodLabel[selected.method]} · {fmtDate(selected.paidDate)}</div>
                </div>
                {/* Details */}
                {[
                  {label:"ใบแจ้งหนี้",  val:selected.invoiceRef||"—"},
                  {label:"เซลล์ / ผู้รับ",val:selected.salesPerson},
                  {label:"หมายเหตุ",    val:selected.note||"—"},
                ].map((r,i,arr)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<arr.length-1?"1px solid #f0f4f8":"none",flexWrap:"wrap",gap:4}}>
                    <span style={{fontSize:"0.72rem",color:MUTED,fontWeight:600}}>{r.label}</span>
                    <span style={{fontSize:"0.76rem",color:STEEL,fontWeight:700,maxWidth:180,textAlign:"right"}}>{r.val}</span>
                  </div>
                ))}
                {/* Workflow */}
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
            {detailTab==="invoice"&&(
              <div style={{padding:"14px 16px"}}>
                {relInvoice?(
                  <>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                      <div style={{width:36,height:36,borderRadius:10,background:"#dce5f0",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Receipt size={15} color={PRIMARY}/></div>
                      <div>
                        <div style={{fontSize:"0.75rem",fontWeight:800,color:PRIMARY,fontFamily:"monospace"}}>{relInvoice.id}</div>
                        <span style={{marginTop:3,display:"inline-block",padding:"2px 7px",borderRadius:99,fontSize:"0.6rem",fontWeight:700,background:invoiceStatusColor[relInvoice.status].bg,color:invoiceStatusColor[relInvoice.status].text}}>
                          {invoiceStatusLabel[relInvoice.status]}
                        </span>
                      </div>
                    </div>
                    {[
                      {label:"งวด",     val:relInvoice.milestone},
                      {label:"โครงการ", val:relInvoice.project},
                      {label:"ก่อน VAT",val:fmt(relInvoice.subtotal)},
                      {label:"VAT 7%",  val:fmt(relInvoice.vatAmount)},
                      {label:"ยอดรวม",  val:fmt(relInvoice.total)},
                      {label:"ครบกำหนด",val:relInvoice.dueDate},
                    ].map((r,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<5?"1px solid #f0f4f8":"none"}}>
                        <span style={{fontSize:"0.7rem",color:MUTED,fontWeight:600}}>{r.label}</span>
                        <span style={{fontSize:"0.75rem",color:STEEL,fontWeight:700,maxWidth:160,textAlign:"right",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.val}</span>
                      </div>
                    ))}
                    <button onClick={()=>router.push("/invoices")}
                      style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,width:"100%",padding:"9px 0",borderRadius:10,background:PRIMARY,color:"#fff",border:"none",fontSize:"0.76rem",fontWeight:700,cursor:"pointer",marginTop:14}}>
                      <ExternalLink size={13}/> ดูใบแจ้งหนี้
                    </button>
                  </>
                ):(
                  <div style={{textAlign:"center",padding:"28px 0",color:MUTED,fontSize:"0.78rem"}}>
                    {selected.invoiceRef?`ไม่พบ ${selected.invoiceRef}`:"ไม่มีใบแจ้งหนี้อ้างอิง"}
                  </div>
                )}
              </div>
            )}

            {/* Tab: สัญญา */}
            {detailTab==="contract"&&(
              <div style={{padding:"14px 16px"}}>
                {relContract?(
                  <>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                      <div style={{width:36,height:36,borderRadius:10,background:"#dce5f0",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><FileSignature size={15} color={PRIMARY}/></div>
                      <div>
                        <div style={{fontSize:"0.75rem",fontWeight:800,color:PRIMARY,fontFamily:"monospace"}}>{relContract.id}</div>
                        <span style={{marginTop:3,display:"inline-block",padding:"2px 7px",borderRadius:99,fontSize:"0.6rem",fontWeight:700,background:contractStatusColor[relContract.status].bg,color:contractStatusColor[relContract.status].text}}>
                          {contractStatusLabel[relContract.status]}
                        </span>
                      </div>
                    </div>
                    {[
                      {label:"ลูกค้า",     val:relContract.client},
                      {label:"โครงการ",    val:relContract.project},
                      {label:"มูลค่า",     val:fmt(relContract.value)},
                      {label:"มัดจำ",      val:fmt(relContract.deposit)},
                      {label:"คงค้าง",     val:fmt(relContract.remaining)},
                    ].map((r,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<4?"1px solid #f0f4f8":"none"}}>
                        <span style={{fontSize:"0.7rem",color:MUTED,fontWeight:600}}>{r.label}</span>
                        <span style={{fontSize:"0.75rem",color:STEEL,fontWeight:700,maxWidth:160,textAlign:"right",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.val}</span>
                      </div>
                    ))}
                    <button onClick={()=>router.push("/contracts")}
                      style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,width:"100%",padding:"9px 0",borderRadius:10,background:PRIMARY,color:"#fff",border:"none",fontSize:"0.76rem",fontWeight:700,cursor:"pointer",marginTop:14}}>
                      <ExternalLink size={13}/> ดูสัญญา
                    </button>
                  </>
                ):(
                  <div style={{textAlign:"center",padding:"28px 0",color:MUTED,fontSize:"0.78rem"}}>ไม่พบข้อมูลสัญญา</div>
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
                    {[{label:"โทรศัพท์",val:relCustomer.phone},{label:"อีเมล",val:relCustomer.email},{label:"จังหวัด",val:relCustomer.province},{label:"หมวด",val:relCustomer.category}].map((r,i)=>(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:i<3?"1px solid #f0f4f8":"none"}}>
                        <span style={{fontSize:"0.7rem",color:MUTED,fontWeight:600}}>{r.label}</span>
                        <span style={{fontSize:"0.75rem",color:STEEL,fontWeight:700,maxWidth:160,textAlign:"right",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.val}</span>
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
                <button onClick={()=>openEdit(selected)}
                  style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"9px 0",borderRadius:10,background:PRIMARY,color:"#fff",border:"none",fontSize:"0.74rem",fontWeight:700,cursor:"pointer"}}>
                  <Edit2 size={13}/> แก้ไข
                </button>
                <button onClick={()=>{if(relCustomer)router.push(`/customers/${relCustomer.id}`);}} disabled={!relCustomer}
                  style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"9px 0",borderRadius:10,background:"#dce5f0",color:PRIMARY,border:"none",fontSize:"0.74rem",fontWeight:700,cursor:relCustomer?"pointer":"not-allowed",opacity:relCustomer?1:0.5}}>
                  ลูกค้า
                </button>
              </div>
              {!delConfirm?(
                <button onClick={()=>setDelConfirm(true)}
                  style={{display:"flex",alignItems:"center",justifyContent:"center",gap:5,padding:"7px 0",borderRadius:10,background:"#fff",color:"#f04d6a",border:"1px solid #fdeaed",fontSize:"0.72rem",fontWeight:700,cursor:"pointer"}}>
                  <Trash2 size={12}/> ลบรายการ
                </button>
              ):(
                <div style={{borderRadius:10,border:"1px solid #fca5a5",overflow:"hidden"}}>
                  <div style={{padding:"7px 12px",background:"#fdeaed",fontSize:"0.7rem",color:"#f04d6a",fontWeight:600}}>ยืนยันลบ "{selected.id}"?</div>
                  <div style={{display:"flex"}}>
                    <button onClick={deletePayment} style={{flex:1,padding:"7px",background:"#f04d6a",border:"none",color:"#fff",fontSize:"0.7rem",fontWeight:700,cursor:"pointer"}}>ลบ</button>
                    <button onClick={()=>setDelConfirm(false)} style={{flex:1,padding:"7px",background:"#fff",border:"none",borderLeft:"1px solid #fca5a5",color:STEEL,fontSize:"0.7rem",cursor:"pointer"}}>ยกเลิก</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showModal&&(
        <PaymentModal
          title={editingPay?"แก้ไขการชำระเงิน":"บันทึกการรับเงิน"}
          initial={editingPay?toForm(editingPay):buildBlank()}
          onSave={savePayment} onClose={()=>setShowModal(false)}/>
      )}
    </div>
  );
}
