"use client";

import { useState, useMemo } from "react";
import {
  leads, projects, tasks, appointments, customers, payments,
  leadStatusLabel, recentActivity,
} from "@/lib/mock";
import type { LeadStatus } from "@/lib/mock";

// ─── DATA ────────────────────────────────────────────────────────
const MONTHLY = [
  { m:"ม.ค.", a:380, p:450 }, { m:"ก.พ.", a:490, p:520 },
  { m:"มี.ค.", a:650, p:600 }, { m:"เม.ย.", a:420, p:480 },
  { m:"พ.ค.", a:820, p:700 }, { m:"มิ.ย.", a:290, p:350 },
  { m:"ก.ค.", a:0, p:580 },   { m:"ส.ค.", a:0, p:620 },
  { m:"ก.ย.", a:0, p:540 },   { m:"ต.ค.", a:0, p:590 },
  { m:"พ.ย.", a:0, p:610 },   { m:"ธ.ค.", a:0, p:680 },
];
const THAI_DAYS         = ["อา","จ","อ","พ","พฤ","ศ","ส"];
const THAI_MONTHS_FULL  = ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"];
const MONTHS_SHORT      = ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
const APPT_COLOR: Record<string,string> = { survey:"#003366",design_meet:"#003366",contract_sign:"#22c55e",client_meet:"#f59e0b",quotation:"#f04d6a" };
const APPT_LABEL: Record<string,string> = { survey:"สำรวจพื้นที่",design_meet:"ประชุมออกแบบ",contract_sign:"เซ็นสัญญา",client_meet:"พบลูกค้า",quotation:"เสนอราคา" };
const AVATAR_COLORS = ["#003366","#2D2D2D","#0d9488","#f59e0b","#f04d6a","#22c55e","#475569","#C0C0C0"];

// Status → badge class map
const STATUS_BADGE: Record<string,string> = {
  new_lead:    "bj-badge bj-badge-muted",
  contacted:   "bj-badge bj-badge-info",
  meeting:     "bj-badge bj-badge-warning",
  quotation:   "bj-badge bj-badge-success",
  negotiation: "bj-badge bj-badge-warning",
  won:         "bj-badge bj-badge-success",
  lost:        "bj-badge bj-badge-danger",
};

// ─── HELPERS ─────────────────────────────────────────────────────
function fmt(n: number) {
  if (n >= 1e6) return `฿${(n/1e6).toFixed(1)}M`;
  if (n >= 1000) return `฿${(n/1000).toFixed(0)}K`;
  return `฿${n.toLocaleString()}`;
}
function leadValue(v: string): number {
  const n = parseFloat(v.replace(/[฿,]/g,""));
  if (v.includes("M")) return n*1e6;
  if (v.includes("K")) return n*1e3;
  return n||0;
}

// ─── ICONS ───────────────────────────────────────────────────────
const IcoMoney  = ({size=24,color="#22c55e"}:{size?:number;color?:string})=>(
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="1.8">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
  </svg>);
const IcoPhone  = ({size=24,color="#003366"}:{size?:number;color?:string})=>(
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="1.8">
    <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.9 10.82 19.79 19.79 0 01.84 2.18 2 2 0 012.83 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l.98-.98a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
  </svg>);
const IcoFolder = ({size=24,color="#f59e0b"}:{size?:number;color?:string})=>(
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="1.8">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
  </svg>);
const IcoUsers  = ({size=24,color="#003366"}:{size?:number;color?:string})=>(
  <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth="1.8">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
  </svg>);

// ─── MONTHLY BAR CHART ───────────────────────────────────────────
function MonthlyBarChart() {
  const [hov,setHov] = useState<number|null>(null);
  const W=680,H=200,PL=42,PR=14,PT=18,PB=30;
  const cW=W-PL-PR, cH=H-PT-PB;
  const maxV=Math.max(...MONTHLY.flatMap(d=>[d.a,d.p]))*1.18||1;
  const n=MONTHLY.length, gW=cW/n;
  const bW=Math.min(16,gW*0.26), gap=4;
  function yp(v:number){return PT+cH-(v/maxV)*cH;}
  return (
    <div style={{overflowX:"auto"}}>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{minWidth:420,display:"block"}}>
        {[0,0.25,0.5,0.75,1].map(f=>{
          const v=Math.round(maxV*f/100)*100, y=yp(v);
          return (<g key={f}>
            <line x1={PL} y1={y} x2={W-PR} y2={y} stroke="#eef0f5" strokeWidth="1"/>
            {f>0&&<text x={PL-6} y={y+3.5} textAnchor="end" fontSize="8" fill="#c4cbd4">{v>=1000?`${v/1000}K`:v}</text>}
          </g>);
        })}
        {MONTHLY.map((d,i)=>{
          const cx=PL+i*gW+gW/2;
          const ax=cx-bW-gap/2, px=cx+gap/2;
          const pY=yp(d.p), pH=cH-(pY-PT);
          const aY=yp(d.a), aH=d.a>0?cH-(aY-PT):0;
          const isHov=hov===i;
          return (
            <g key={i} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)} style={{cursor:"pointer"}}>
              {isHov&&<rect x={cx-gW/2+2} y={PT} width={gW-4} height={cH} rx="6" fill="#f8f9fc"/>}
              <rect x={px} y={pY} width={bW} height={pH} rx="4" fill="#f59e0b" opacity={d.a===0?0.2:0.6}/>
              {d.a>0&&<rect x={ax} y={aY} width={bW} height={aH} rx="4" fill="#003366" opacity={isHov?1:0.85}/>}
              <text x={cx} y={H-6} textAnchor="middle" fontSize="8.5" fill={isHov?"#003366":"#c4cbd4"} fontWeight={isHov?"700":"400"}>{d.m}</text>
              {isHov&&d.a>0&&(()=>{
                const ttW=110,ttH=40,tx=Math.min(Math.max(cx-ttW/2,2),W-ttW-2),ty=Math.min(aY,pY)-ttH-8;
                return (<g>
                  <rect x={tx} y={ty} width={ttW} height={ttH} rx="8" fill="#2D2D2D"/>
                  <text x={tx+10} y={ty+14} fontSize="8.5" fill="#9ca3af">จริง</text>
                  <text x={tx+ttW-8} y={ty+14} textAnchor="end" fontSize="8.5" fill="#4ade80" fontWeight="700">{d.a}K฿</text>
                  <text x={tx+10} y={ty+28} fontSize="8.5" fill="#9ca3af">แผน</text>
                  <text x={tx+ttW-8} y={ty+28} textAnchor="end" fontSize="8.5" fill="#f59e0b" fontWeight="700">{d.p}K฿</text>
                </g>);
              })()}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── MINI CALENDAR ───────────────────────────────────────────────
function MiniCalendar({year,month,apptDates}:{year:number;month:number;apptDates:Set<string>}) {
  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const cells:(number|null)[] = [];
  for(let i=0;i<firstDay;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) cells.push(d);
  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",marginBottom:6}}>
        {THAI_DAYS.map(d=>(
          <div key={d} style={{textAlign:"center",fontSize:"0.6rem",fontWeight:700,color:"#c4cbd4",padding:"2px 0"}}>{d}</div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)"}}>
        {cells.map((day,idx)=>{
          if(!day) return <div key={`e-${idx}`} style={{height:32}}/>;
          const ds=`${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
          const isToday=ds==="2026-06-24";
          const hasAppt=apptDates.has(ds);
          return (
            <div key={idx} style={{display:"flex",alignItems:"center",justifyContent:"center",height:32,position:"relative"}}>
              <div style={{width:28,height:28,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",
                background:isToday?"#003366":"transparent",cursor:"pointer",transition:"background .1s"}}
                onMouseEnter={e=>{if(!isToday)(e.currentTarget as HTMLElement).style.background="var(--muted)";}}
                onMouseLeave={e=>{if(!isToday)(e.currentTarget as HTMLElement).style.background="transparent";}}>
                <span style={{fontSize:"0.75rem",fontWeight:isToday?700:400,color:isToday?"#fff":"#374151"}}>{day}</span>
              </div>
              {hasAppt&&!isToday&&(
                <div style={{position:"absolute",bottom:2,left:"50%",transform:"translateX(-50%)",
                  width:4,height:4,borderRadius:"50%",background:"#f59e0b"}}/>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── LEAD DONUT ──────────────────────────────────────────────────
function LeadDonut() {
  const total=leads.length;
  const paid=leads.filter(l=>l.status==="won").length;
  const active=leads.filter(l=>l.status!=="won"&&l.status!=="lost").length;
  const paidPct=total>0?Math.round(paid/total*100):0;
  const activePct=total>0?Math.round(active/total*100):0;
  const R1=54,R2=38,CX=80,CY=80,SW=14;
  const c1=2*Math.PI*R1, c2=2*Math.PI*R2;
  const d1=paidPct/100*c1, d2=activePct/100*c2;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center"}}>
      <svg width="160" height="160" viewBox="0 0 160 160">
        <circle cx={CX} cy={CY} r={R1} fill="none" stroke="var(--muted)" strokeWidth={SW}/>
        <circle cx={CX} cy={CY} r={R1} fill="none" stroke="#f59e0b" strokeWidth={SW}
          strokeDasharray={`${d1} ${c1-d1}`} strokeDashoffset={c1*0.25}
          strokeLinecap="round" style={{transition:"stroke-dasharray .6s"}}/>
        <circle cx={CX} cy={CY} r={R2} fill="none" stroke="var(--muted)" strokeWidth={SW}/>
        <circle cx={CX} cy={CY} r={R2} fill="none" stroke="#003366" strokeWidth={SW}
          strokeDasharray={`${d2} ${c2-d2}`} strokeDashoffset={c2*0.25}
          strokeLinecap="round" style={{transition:"stroke-dasharray .6s"}}/>
        <text x={CX} y={CY-8} textAnchor="middle" fontSize="9" fill="var(--muted-foreground)">ลีดทั้งหมด</text>
        <text x={CX} y={CY+12} textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--foreground)">{total}</text>
      </svg>
      <div style={{display:"flex",gap:20,marginTop:2}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:"0.62rem",color:"var(--muted-foreground)",marginBottom:2}}>ชำระแล้ว</div>
          <div style={{fontSize:"1rem",fontWeight:800,color:"#f59e0b"}}>{paidPct}%</div>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:"0.62rem",color:"var(--muted-foreground)",marginBottom:2}}>ดำเนินการ</div>
          <div style={{fontSize:"1rem",fontWeight:800,color:"#003366"}}>{activePct}%</div>
        </div>
      </div>
    </div>
  );
}

// ─── RECENT ACTIVITY ─────────────────────────────────────────────
const ACT_ICON: Record<string,string> = {
  lead_status: "🔄", task_done: "✅", quotation: "📄", payment: "💳", note: "📝",
};
const PRODUCT_COLOR: Record<string,string> = {
  "อาคารสำเร็จรูป":   "#003366",
  "อาคารโรงงาน":      "#f59e0b",
  "โกดังสินค้า":      "#22c55e",
  "อาคารสำนักงาน":    "#0d9488",
  "อาคารเชิงพาณิชย์": "#0369a1",
  "สนามกีฬาในร่ม":    "#f04d6a",
};

function RecentActivityFeed() {
  return (
    <div className="bj-card" style={{height:"100%"}}>
      <div className="bj-card-header" style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div className="bj-card-title">กิจกรรมล่าสุด</div>
        <div className="bj-card-desc" style={{fontSize:"0.65rem"}}>อัพเดทล่าสุดของทีม</div>
      </div>
      <div className="bj-card-content" style={{paddingTop:4}}>
        <div style={{display:"flex",flexDirection:"column",gap:0}}>
          {recentActivity.map((act,idx)=>(
            <div key={act.id} style={{display:"flex",gap:12,padding:"10px 0",
              borderBottom:idx<recentActivity.length-1?"1px solid var(--border)":"none",
              alignItems:"flex-start"}}>
              {/* Avatar */}
              <div style={{width:32,height:32,borderRadius:"50%",background:act.userColor+"1a",
                border:`2px solid ${act.userColor}22`,display:"flex",alignItems:"center",
                justifyContent:"center",fontSize:"0.58rem",fontWeight:900,color:act.userColor,flexShrink:0}}>
                {act.userInitials}
              </div>
              {/* Content */}
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:"0.73rem",color:"var(--foreground)",lineHeight:1.45}}>
                  <span style={{fontWeight:700}}>{act.user}</span>
                  {" "}{act.action}{" "}
                  <span style={{color:"#003366",fontWeight:600}}>{act.subject}</span>
                  {act.subjectId&&<span style={{color:"var(--muted-foreground)",fontSize:"0.62rem"}}> ({act.subjectId})</span>}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
                  {act.newStatus&&(
                    <span style={{fontSize:"0.6rem",fontWeight:700,padding:"1px 7px",
                      borderRadius:99,background:"var(--muted)",color:"var(--muted-foreground)"}}>
                      → {act.newStatus}
                    </span>
                  )}
                  <span style={{fontSize:"0.6rem",fontWeight:700,padding:"1px 7px",borderRadius:99,
                    background:PRODUCT_COLOR[act.product]+"18",color:PRODUCT_COLOR[act.product]}}>
                    {act.product}
                  </span>
                  <span style={{fontSize:"0.6rem",color:"var(--muted-foreground)",marginLeft:"auto"}}>
                    {act.timeAgo}
                  </span>
                </div>
              </div>
              <span style={{fontSize:"0.85rem",flexShrink:0,marginTop:2}}>{ACT_ICON[act.type]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [tab,setTab]           = useState<"week"|"month"|"year">("month");
  const [calYear,setCalYear]   = useState(2026);
  const [calMonth,setCalMonth] = useState(5);

  const totalRevenue = useMemo(()=>payments.filter(p=>p.status==="confirmed").reduce((s,p)=>s+p.amount,0),[]);
  const activeLeads  = useMemo(()=>leads.filter(l=>l.status!=="won"&&l.status!=="lost"),[]);
  const upcomingAppts= useMemo(()=>[...appointments].filter(a=>a.date>="2026-06-24"&&a.status==="upcoming").sort((a,b)=>a.date.localeCompare(b.date)).slice(0,2),[]);
  const apptDates    = useMemo(()=>new Set(appointments.map(a=>a.date)),[]);
  const inProgressP  = useMemo(()=>projects.filter(p=>p.status==="in_progress"),[]);

  const leadLimit = tab==="week"?4:tab==="month"?6:8;
  const sortedLeads = [...leads].sort((a,b)=>leadValue(b.value)-leadValue(a.value)).slice(0,leadLimit);

  return (
    <div style={{minHeight:"100vh",paddingBottom:40}}>

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="bj-page-header" style={{marginBottom:20}}>
        <div>
          <h1 className="bj-page-title">แผงควบคุม</h1>
          <p className="bj-page-sub">Benjamin PMS · {(() => { const d=new Date(); const m=["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม"]; return `วันที่ ${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()+543}`; })()}</p>
        </div>
        <a href="/leads">
          <button className="bj-btn bj-btn-primary bj-btn-md" style={{gap:6}}>
            <span style={{fontSize:"1.1rem",lineHeight:1}}>+</span> เพิ่มลีดใหม่
          </button>
        </a>
      </div>

      {/* ── 4 Stat Cards ────────────────────────────────────── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:18}}>
        {[
          {icon:<IcoMoney/>,label:"รายได้รวม",value:fmt(totalRevenue),sub:"ยืนยันชำระแล้ว",iconBg:"var(--success-bg)",href:"/payments"},
          {icon:<IcoPhone/>,label:"ลีดทั้งหมด",value:String(leads.length),sub:`${activeLeads.length} กำลังดำเนินการ`,iconBg:"var(--info-bg)",href:"/leads"},
          {icon:<IcoFolder/>,label:"โครงการ",value:String(projects.length),sub:`${inProgressP.length} กำลังดำเนินการ`,iconBg:"var(--warning-bg)",href:"/projects"},
          {icon:<IcoUsers/>,label:"ลูกค้า",value:String(customers.length),sub:"ทั้งหมดในระบบ",iconBg:"var(--primary-light)",href:"/customers"},
        ].map((s,i)=>(
          <a key={i} href={s.href} style={{textDecoration:"none"}}>
            <div className="bj-stat-card" style={{display:"flex",alignItems:"center",gap:14}}>
              <div style={{width:50,height:50,borderRadius:"var(--radius-lg)",background:s.iconBg,
                display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                {s.icon}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div className="bj-stat-label">{s.label}</div>
                <div className="bj-stat-value" style={{fontSize:"1.55rem"}}>{s.value}</div>
                <div className="bj-stat-sub">{s.sub}</div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* ── Chart + Calendar ─────────────────────────────────── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 308px",gap:14,marginBottom:14}}>

        {/* Bar Chart */}
        <div className="bj-card">
          <div className="bj-card-header" style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingBottom:14}}>
            <div>
              <div className="bj-card-title">ยอดขายรายเดือน</div>
              <div className="bj-card-desc">แผนงาน เทียบ ยอดขายจริง (K฿) · 2569</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:14}}>
              {[["#003366","ยอดจริง"],["#f59e0b","แผน"]].map(([c,l])=>(
                <div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:"0.7rem",color:"var(--muted-foreground)"}}>
                  <div style={{width:10,height:10,borderRadius:3,background:c,flexShrink:0}}/>{l}
                </div>
              ))}
            </div>
          </div>
          <div className="bj-card-content" style={{paddingTop:0}}>
            <MonthlyBarChart/>
          </div>
        </div>

        {/* Calendar */}
        <div className="bj-card">
          <div className="bj-card-header" style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div className="bj-card-title">ปฏิทินนัดหมาย</div>
            <a href="/appointments" style={{fontSize:"0.68rem",color:"var(--muted-foreground)",textDecoration:"none",
              fontWeight:600,background:"var(--muted)",borderRadius:8,padding:"3px 10px"}}>ดูทั้งหมด →</a>
          </div>
          <div className="bj-card-content">
            {/* Upcoming events */}
            {upcomingAppts.map(a=>{
              const [,mm,dd]=a.date.split("-");
              const col=APPT_COLOR[a.type]??"#4299e1";
              return (
                <div key={a.id} style={{display:"flex",alignItems:"center",gap:10,
                  padding:"9px 11px",background:"var(--muted)",borderRadius:"var(--radius-lg)",marginBottom:8,cursor:"pointer",
                  border:"1px solid var(--border)",transition:"background .1s"}}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="var(--primary-llight)"}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="var(--muted)"}>
                  <div style={{width:36,height:36,borderRadius:"var(--radius-md)",flexShrink:0,
                    background:col+"18",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                    <span style={{fontSize:"0.72rem",fontWeight:800,color:col,lineHeight:1}}>{dd}</span>
                    <span style={{fontSize:"0.5rem",color:col,fontWeight:600}}>{MONTHS_SHORT[parseInt(mm)-1]}</span>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:"0.75rem",fontWeight:700,color:"var(--foreground)",
                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{a.company}</div>
                    <div style={{fontSize:"0.62rem",color:"var(--muted-foreground)"}}>
                      {APPT_LABEL[a.type]??a.type} · {a.time}
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="bj-divider" style={{margin:"10px 0"}}/>

            {/* Month nav */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
              <button onClick={()=>{let m=calMonth-1,y=calYear;if(m<0){m=11;y--;}setCalMonth(m);setCalYear(y);}}
                style={{background:"none",border:"none",cursor:"pointer",color:"var(--muted-foreground)",
                  fontSize:"1.1rem",padding:"0 4px",lineHeight:1,borderRadius:6,transition:"color .1s"}}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color="var(--foreground)"}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color="var(--muted-foreground)"}>‹</button>
              <span style={{fontSize:"0.78rem",fontWeight:700,color:"var(--foreground)"}}>
                {THAI_MONTHS_FULL[calMonth]} {calYear+543}
              </span>
              <button onClick={()=>{let m=calMonth+1,y=calYear;if(m>11){m=0;y++;}setCalMonth(m);setCalYear(y);}}
                style={{background:"none",border:"none",cursor:"pointer",color:"var(--muted-foreground)",
                  fontSize:"1.1rem",padding:"0 4px",lineHeight:1,borderRadius:6,transition:"color .1s"}}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color="var(--foreground)"}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color="var(--muted-foreground)"}>›</button>
            </div>
            <MiniCalendar year={calYear} month={calMonth} apptDates={apptDates}/>
          </div>
        </div>
      </div>

      {/* ── Recent Activity + Project Stats ─────────────────── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 280px",gap:14,marginBottom:14}}>

        <RecentActivityFeed/>

        {/* Project Stats — เหมือนที่ต้นฉบับแสดงสรุปโครงการ */}
        <div className="bj-card">
          <div className="bj-card-header">
            <div className="bj-card-title">โครงการ</div>
            <div className="bj-card-desc">สรุปสถานะทั้งหมด</div>
          </div>
          <div className="bj-card-content" style={{paddingTop:4}}>
            {([
              { label:"ยังไม่เริ่ม",     status:"not_started", color:"#6b7280",  bg:"#f0f0f5" },
              { label:"กำลังดำเนินการ",  status:"in_progress",  color:"#003366", bg:"#dce5f0" },
              { label:"หยุดชั่วคราว",    status:"on_hold",      color:"#f59e0b", bg:"#fef3cd" },
              { label:"เสร็จแล้ว",       status:"completed",    color:"#22c55e", bg:"#e5faf0" },
            ] as const).map(s=>{
              const count = projects.filter(p=>p.status===s.status).length;
              const myCount = projects.filter(p=>p.status===s.status&&p.assigned.includes("สมชาย")).length;
              return (
                <div key={s.status} style={{display:"flex",alignItems:"center",gap:10,
                  padding:"11px 12px",borderRadius:10,background:s.bg,marginBottom:8,border:`1px solid ${s.color}18`}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:s.color,flexShrink:0}}/>
                  <div style={{flex:1}}>
                    <div style={{fontSize:"0.72rem",fontWeight:600,color:"var(--foreground)"}}>{s.label}</div>
                    <div style={{fontSize:"0.62rem",color:"var(--muted-foreground)",marginTop:1}}>มอบหมายให้ฉัน: {myCount}</div>
                  </div>
                  <div style={{fontSize:"1.4rem",fontWeight:900,color:s.color,lineHeight:1}}>{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bottom Row ───────────────────────────────────────── */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 210px 232px",gap:14}}>

        {/* Top Leads */}
        <div className="bj-card">
          <div className="bj-card-header" style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div className="bj-card-title">ลีดยอดเยี่ยม</div>
            {/* Pill tabs */}
            <div className="bj-tab-list">
              {(["week","month","year"] as const).map(t=>(
                <button key={t} className={`bj-tab${tab===t?" active":""}`} onClick={()=>setTab(t)}>
                  {t==="week"?"สัปดาห์":t==="month"?"เดือน":"ปี"}
                </button>
              ))}
            </div>
          </div>
          <div className="bj-card-content" style={{paddingTop:8}}>
            <div className="bj-table-wrap" style={{borderRadius:"var(--radius-lg)"}}>
              <table className="bj-table">
                <thead>
                  <tr>
                    {["ลูกค้า","สินค้า","มูลค่า","จังหวัด","สถานะ"].map(h=>(
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedLeads.map((l,i)=>{
                    const ac = AVATAR_COLORS[i%AVATAR_COLORS.length];
                    return (
                      <tr key={l.id} style={{cursor:"pointer"}}>
                        <td>
                          <div style={{display:"flex",alignItems:"center",gap:9}}>
                            <div style={{width:30,height:30,borderRadius:"var(--radius-md)",
                              background:ac+"1a",display:"flex",alignItems:"center",justifyContent:"center",
                              fontSize:"0.65rem",fontWeight:800,color:ac,flexShrink:0}}>
                              {l.name.charAt(0)}
                            </div>
                            <span style={{fontSize:"0.8rem",fontWeight:600,color:"var(--foreground)"}}>{l.name}</span>
                          </div>
                        </td>
                        <td style={{color:"var(--muted-foreground)",fontSize:"0.75rem"}}>{l.product}</td>
                        <td style={{fontWeight:700,color:"var(--foreground)"}}>{l.value}</td>
                        <td style={{color:"var(--muted-foreground)",fontSize:"0.75rem"}}>{l.province}</td>
                        <td>
                          <span className={STATUS_BADGE[l.status]??STATUS_BADGE.new_lead}>
                            {leadStatusLabel[l.status as LeadStatus]??l.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Lead Donut */}
        <div className="bj-card" style={{display:"flex",flexDirection:"column"}}>
          <div className="bj-card-header">
            <div className="bj-card-title">สถานะลีด</div>
            <div className="bj-card-desc">Pipeline ภาพรวม</div>
          </div>
          <div className="bj-card-content" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",paddingTop:0}}>
            <LeadDonut/>
          </div>
        </div>

        {/* Quick Action — Dark Card */}
        <div className="bj-card" style={{background:"#003366",position:"relative",overflow:"hidden",display:"flex",flexDirection:"column"}}>
          {/* Decorative circles */}
          <div style={{position:"absolute",right:-36,top:-36,width:130,height:130,borderRadius:"50%",border:"28px solid rgba(255,255,255,0.05)",pointerEvents:"none"}}/>
          <div style={{position:"absolute",right:-8,bottom:-46,width:170,height:170,borderRadius:"50%",border:"28px solid rgba(255,255,255,0.04)",pointerEvents:"none"}}/>

          <div className="bj-card-header" style={{position:"relative",zIndex:1,paddingBottom:8}}>
            <div className="bj-overline" style={{color:"rgba(255,255,255,.35)",marginBottom:8}}>BENJAMIN PMS</div>
            <div style={{fontSize:"1.05rem",fontWeight:800,color:"#fff",lineHeight:1.4,marginBottom:6}}>เพิ่มข้อมูล<br/>เข้าระบบ</div>
            <div style={{fontSize:"0.68rem",color:"rgba(255,255,255,.5)",lineHeight:1.65}}>
              จัดการลีด โครงการ และ<br/>เอกสารได้ทันที
            </div>
          </div>

          <div className="bj-card-content" style={{position:"relative",zIndex:1,paddingTop:0,display:"flex",flexDirection:"column",gap:8,marginTop:"auto"}}>
            <a href="/leads" style={{display:"flex",alignItems:"center",gap:7,
              padding:"9px 13px",background:"rgba(255,255,255,.12)",borderRadius:"var(--radius-lg)",
              textDecoration:"none",color:"#fff",fontSize:"0.75rem",fontWeight:600,
              border:"1px solid rgba(255,255,255,.12)",transition:"background .12s"}}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,.2)"}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,.12)"}>
              <span style={{fontSize:"1rem",lineHeight:1}}>+</span> เพิ่มลีดใหม่
            </a>
            <a href="/quotations" style={{display:"flex",alignItems:"center",gap:7,
              padding:"9px 13px",background:"#fff",borderRadius:"var(--radius-lg)",
              textDecoration:"none",color:"#003366",fontSize:"0.75rem",fontWeight:700,
              transition:"opacity .12s"}}
              onMouseEnter={e=>(e.currentTarget as HTMLElement).style.opacity="0.9"}
              onMouseLeave={e=>(e.currentTarget as HTMLElement).style.opacity="1"}>
              <span style={{fontSize:"1rem",lineHeight:1}}>+</span> สร้างใบเสนอราคา
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
