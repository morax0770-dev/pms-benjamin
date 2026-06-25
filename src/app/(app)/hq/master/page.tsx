"use client";

import { useState } from "react";

const CARD: React.CSSProperties = { background:"#fff", borderRadius:16, border:"1px solid #cfd4dc", boxShadow:"0 2px 14px rgba(0,51,102,.07)" };
const PRIMARY = "#003366"; const STEEL = "#2D2D2D"; const BORDER = "#cfd4dc"; const SUCCESS = "#22c55e";

type PriceRow = { code:string; name:string; unit:string; price:string; vip:string; updated:string };

const PRICE_DATA: Record<string, PriceRow[]> = {
  EASYBUILD: [
    { code:"EB-S100", name:"โครงสร้างหลัก ขนาด 10×10 ม.",     unit:"ชุด",   price:"485,000", vip:"460,000", updated:"1 มิ.ย. 2569" },
    { code:"EB-S150", name:"โครงสร้างหลัก ขนาด 15×20 ม.",     unit:"ชุด",   price:"920,000", vip:"875,000", updated:"1 มิ.ย. 2569" },
    { code:"EB-R01",  name:"แผ่นหลังคา Metal Sheet 0.35mm",    unit:"ตร.ม.", price:"320",     vip:"300",     updated:"15 พ.ค. 2569" },
    { code:"EB-W01",  name:"แผ่นผนัง Metal Sheet 0.30mm",      unit:"ตร.ม.", price:"280",     vip:"260",     updated:"15 พ.ค. 2569" },
    { code:"EB-D01",  name:"ประตูม้วน 3×3 ม.",                  unit:"บาน",  price:"28,000",  vip:"26,000",  updated:"1 มิ.ย. 2569" },
  ],
  RANBUILD: [
    { code:"RB-R01",  name:"หลังคา Hi-Rib 0.47mm",              unit:"ตร.ม.", price:"380",     vip:"350",     updated:"1 มิ.ย. 2569" },
    { code:"RB-R02",  name:"หลังคา Longrib 0.47mm",             unit:"ตร.ม.", price:"420",     vip:"390",     updated:"1 มิ.ย. 2569" },
    { code:"RB-G01",  name:"รางน้ำ Seamless Gutter",            unit:"เมตร",  price:"650",     vip:"600",     updated:"15 พ.ค. 2569" },
    { code:"RB-F01",  name:"ผ้าใบกันความร้อน",                   unit:"ตร.ม.", price:"120",     vip:"110",     updated:"15 พ.ค. 2569" },
  ],
  PREFAB: [
    { code:"PF-M01",  name:"โมดูล 6×3 ม. — ห้องสำนักงาน",     unit:"โมดูล", price:"320,000", vip:"300,000", updated:"1 มิ.ย. 2569" },
    { code:"PF-M02",  name:"โมดูล 6×3 ม. — ห้องน้ำ",           unit:"โมดูล", price:"280,000", vip:"260,000", updated:"1 มิ.ย. 2569" },
    { code:"PF-C01",  name:"คอนเนคเตอร์เชื่อมโมดูล",            unit:"ชุด",   price:"45,000",  vip:"42,000",  updated:"15 พ.ค. 2569" },
  ],
  Custom: [
    { code:"CS-D01",  name:"งานออกแบบสถาปัตยกรรม",              unit:"โครงการ",price:"ตามข้อตกลง",vip:"—",   updated:"1 มิ.ย. 2569" },
    { code:"CS-E01",  name:"งานวิศวกรรมโครงสร้าง",              unit:"โครงการ",price:"ตามข้อตกลง",vip:"—",   updated:"1 มิ.ย. 2569" },
    { code:"CS-P01",  name:"บริการจัดการโครงการ (PM)",          unit:"เดือน",  price:"85,000",  vip:"80,000",  updated:"1 มิ.ย. 2569" },
  ],
};

const PRODUCT_LINES = [
  { name:"EASYBUILD", desc:"โรงงานสำเร็จรูปขนาดกลาง", items:PRICE_DATA.EASYBUILD.length, status:"active" },
  { name:"RANBUILD",  desc:"ระบบหลังคาและผนังโลหะ",   items:PRICE_DATA.RANBUILD.length,  status:"active" },
  { name:"PREFAB",    desc:"อาคารสำเร็จรูปแบบโมดูล",  items:PRICE_DATA.PREFAB.length,    status:"active" },
  { name:"Custom",    desc:"งานออกแบบเฉพาะโครงการ",   items:PRICE_DATA.Custom.length,    status:"draft"  },
];

const LINE_COLORS: Record<string,string> = {
  EASYBUILD:"#003366", RANBUILD:"#3b82f6", PREFAB:"#f59e0b", Custom:"#f04d6a",
};

type AddForm = { code:string; name:string; unit:string; price:string; vip:string };
const BLANK: AddForm = { code:"", name:"", unit:"", price:"", vip:"" };

export default function HQMasterPage() {
  const [selectedLine, setSelectedLine] = useState("EASYBUILD");
  const [prices, setPrices]             = useState<Record<string,PriceRow[]>>(PRICE_DATA);
  const [editCell, setEditCell]         = useState<{ code:string; field:"price"|"vip"; value:string }|null>(null);
  const [showAdd, setShowAdd]           = useState(false);
  const [addForm, setAddForm]           = useState<AddForm>(BLANK);

  const rows = prices[selectedLine] ?? [];

  function commitEdit() {
    if (!editCell) return;
    setPrices(prev => ({
      ...prev,
      [selectedLine]: prev[selectedLine].map(r =>
        r.code===editCell.code ? { ...r, [editCell.field]:editCell.value, updated:"23 มิ.ย. 2569" } : r
      ),
    }));
    setEditCell(null);
  }

  function addRow() {
    if (!addForm.code||!addForm.name) return;
    setPrices(prev => ({
      ...prev,
      [selectedLine]: [...prev[selectedLine], { ...addForm, updated:"23 มิ.ย. 2569" }],
    }));
    setAddForm(BLANK);
    setShowAdd(false);
  }

  function deleteRow(code:string) {
    if (confirm("ลบรายการนี้?")) {
      setPrices(prev => ({ ...prev, [selectedLine]: prev[selectedLine].filter(r=>r.code!==code) }));
    }
  }

  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:16 }}>
        <div>
          <h1 style={{ fontSize:"1.6rem", fontWeight:800, color:STEEL, marginBottom:3 }}>ราคากลาง</h1>
          <p style={{ fontSize:"0.76rem", color:"#6b7280" }}>จัดการราคากลางและ Master Price List สำหรับดีลเลอร์ทุกสาขา</p>
        </div>
      </div>

      {/* Product line cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:12, marginBottom:20 }}>
        {PRODUCT_LINES.map(p => {
          const selected = selectedLine===p.name;
          return (
            <div key={p.name} onClick={() => setSelectedLine(p.name)}
              style={{ ...CARD, padding:"18px 18px 14px", cursor:"pointer", border:`2px solid ${selected?LINE_COLORS[p.name]:"#cfd4dc"}`, transition:"border-color .15s" }}>
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:10 }}>
                <div>
                  <div style={{ fontSize:"0.96rem", fontWeight:800, color:selected?LINE_COLORS[p.name]:STEEL }}>{p.name}</div>
                  <div style={{ fontSize:"0.72rem", color:"#6b7280", marginTop:2 }}>{p.desc}</div>
                </div>
                <span style={{ padding:"3px 10px", borderRadius:99, fontSize:"0.65rem", fontWeight:700, background:p.status==="active"?"#e5faf0":"#f0f0f5", color:p.status==="active"?SUCCESS:"#6b7280" }}>
                  {p.status==="active"?"เปิดใช้งาน":"ร่าง"}
                </span>
              </div>
              <div style={{ paddingTop:10, borderTop:"1px solid #f0f4f8", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:"0.72rem", color:"#6b7280" }}>{prices[p.name]?.length ?? p.items} รายการ</span>
                {selected && <span style={{ fontSize:"0.68rem", fontWeight:700, color:LINE_COLORS[p.name] }}>กำลังแสดง ▸</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Price table */}
      <div style={CARD}>
        <div style={{ padding:"14px 16px", borderBottom:"1px solid #cfd4dc", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
          <div>
            <div style={{ fontSize:"0.88rem", fontWeight:700, color:STEEL }}>{selectedLine} — ตารางราคา</div>
            <div style={{ fontSize:"0.7rem", color:"#6b7280", marginTop:2 }}>คลิกที่ราคาเพื่อแก้ไข · อัปเดตล่าสุด: 1 มิ.ย. 2569</div>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={() => setShowAdd(true)}
              style={{ padding:"7px 16px", borderRadius:9, border:`1px solid ${BORDER}`, background:"#fff", color:STEEL, fontSize:"0.76rem", fontWeight:600, cursor:"pointer" }}>
              + เพิ่มรายการ
            </button>
            <button style={{ display:"flex", alignItems:"center", gap:6, background:STEEL, color:"#fff", border:"none", borderRadius:9, padding:"7px 16px", fontSize:"0.76rem", fontWeight:700, cursor:"pointer" }}>
              ↓ ส่งออก Excel
            </button>
          </div>
        </div>

        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ borderBottom:"1px solid #cfd4dc", background:"#f8f9fb" }}>
                {["รหัสสินค้า","รายการ","หน่วย","ราคา (฿)","ราคา VIP (฿)","อัปเดตล่าสุด",""].map(h => (
                  <th key={h} style={{ fontSize:"0.67rem", fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.05em", padding:"10px 14px", textAlign:"left", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => (
                <tr key={row.code} style={{ borderBottom:"1px solid #f0f4f8" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f8f9fb"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; }}>
                  <td style={{ padding:"11px 14px", fontSize:"0.72rem", color:"#6b7280", fontFamily:"monospace" }}>{row.code}</td>
                  <td style={{ padding:"11px 14px", fontSize:"0.84rem", color:STEEL, fontWeight:600 }}>{row.name}</td>
                  <td style={{ padding:"11px 14px", fontSize:"0.78rem", color:"#6b7280" }}>{row.unit}</td>

                  {/* Editable price */}
                  <td style={{ padding:"11px 14px" }}>
                    {editCell?.code===row.code&&editCell.field==="price" ? (
                      <input value={editCell.value}
                        autoFocus
                        onChange={e => setEditCell(prev => prev?{...prev,value:e.target.value}:null)}
                        onBlur={commitEdit}
                        onKeyDown={e => { if(e.key==="Enter") commitEdit(); if(e.key==="Escape") setEditCell(null); }}
                        style={{ width:100, fontSize:"0.84rem", fontWeight:700, border:`1px solid ${PRIMARY}`, borderRadius:6, padding:"3px 6px", outline:"none", color:STEEL }}/>
                    ) : (
                      <button onClick={() => setEditCell({ code:row.code, field:"price", value:row.price })}
                        style={{ background:"none", border:"none", cursor:"pointer", fontSize:"0.84rem", fontWeight:700, color:STEEL, padding:"2px 6px", borderRadius:6 }}
                        title="คลิกเพื่อแก้ไข">
                        ฿{row.price}
                      </button>
                    )}
                  </td>

                  {/* Editable VIP price */}
                  <td style={{ padding:"11px 14px" }}>
                    {editCell?.code===row.code&&editCell.field==="vip" ? (
                      <input value={editCell.value}
                        autoFocus
                        onChange={e => setEditCell(prev => prev?{...prev,value:e.target.value}:null)}
                        onBlur={commitEdit}
                        onKeyDown={e => { if(e.key==="Enter") commitEdit(); if(e.key==="Escape") setEditCell(null); }}
                        style={{ width:100, fontSize:"0.84rem", fontWeight:700, border:`1px solid ${SUCCESS}`, borderRadius:6, padding:"3px 6px", outline:"none", color:SUCCESS }}/>
                    ) : (
                      <button onClick={() => row.vip!=="—"&&setEditCell({ code:row.code, field:"vip", value:row.vip })}
                        style={{ background:"none", border:"none", cursor:row.vip==="—"?"default":"pointer", fontSize:"0.84rem", fontWeight:700, color:row.vip==="—"?"#9ca3af":SUCCESS, padding:"2px 6px", borderRadius:6 }}
                        title={row.vip==="—"?"":"คลิกเพื่อแก้ไข"}>
                        {row.vip==="—"?"—":`฿${row.vip}`}
                      </button>
                    )}
                  </td>

                  <td style={{ padding:"11px 14px", fontSize:"0.72rem", color:"#6b7280" }}>{row.updated}</td>
                  <td style={{ padding:"11px 14px" }}>
                    <button onClick={() => deleteRow(row.code)}
                      style={{ padding:"3px 10px", borderRadius:7, border:"1px solid #fdeaed", background:"#fff", color:"#f04d6a", fontSize:"0.7rem", fontWeight:600, cursor:"pointer" }}>ลบ</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add row modal */}
      {showAdd && (
        <>
          <div onClick={() => setShowAdd(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.3)", zIndex:200 }}/>
          <div style={{ position:"fixed", top:"50%", left:"50%", transform:"translate(-50%,-50%)", zIndex:201,
            ...CARD, padding:"24px 28px", width:420, boxShadow:"0 16px 48px rgba(0,51,102,.18)" }}>
            <div style={{ fontSize:"0.9rem", fontWeight:800, color:STEEL, marginBottom:18 }}>เพิ่มรายการราคา — {selectedLine}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {([
                { key:"code" as const, label:"รหัสสินค้า", ph:`${selectedLine.substring(0,2)}-XXX` },
                { key:"name" as const, label:"ชื่อรายการ",  ph:"ชื่อ..." },
                { key:"unit" as const, label:"หน่วย",       ph:"ชุด / ตร.ม. / เมตร" },
                { key:"price" as const, label:"ราคา (฿)",   ph:"000,000" },
                { key:"vip" as const,   label:"ราคา VIP (฿)",ph:"000,000 หรือ —" },
              ]).map(f => (
                <div key={f.key}>
                  <label style={{ fontSize:"0.72rem", fontWeight:700, color:"#6b7280", display:"block", marginBottom:5 }}>{f.label}</label>
                  <input value={addForm[f.key]} onChange={e => setAddForm(p => ({ ...p, [f.key]:e.target.value }))}
                    placeholder={f.ph}
                    style={{ width:"100%", fontSize:"0.84rem", border:`1px solid ${BORDER}`, borderRadius:9, padding:"8px 12px", outline:"none", color:STEEL, boxSizing:"border-box" }}/>
                </div>
              ))}
              <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:4 }}>
                <button onClick={() => setShowAdd(false)}
                  style={{ padding:"8px 18px", borderRadius:9, border:`1px solid ${BORDER}`, background:"#fff", color:STEEL, fontSize:"0.78rem", fontWeight:600, cursor:"pointer" }}>ยกเลิก</button>
                <button onClick={addRow}
                  style={{ padding:"8px 22px", borderRadius:9, border:"none", background:PRIMARY, color:"#fff", fontSize:"0.78rem", fontWeight:700, cursor:"pointer" }}>บันทึก</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
