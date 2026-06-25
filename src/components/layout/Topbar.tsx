"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useRole } from "@/context/RoleContext";
import { leads, projects, customers } from "@/lib/mock";

const PRIMARY = "#003366";
const BORDER   = "#cfd4dc";
const STEEL    = "#2D2D2D";
const BG       = "#f4f6f9";

// ── mock notifications ────────────────────────────────────────────
const NOTIFS = [
  { id: 1, icon: "💬", title: "ลีดใหม่เข้ามา", body: "บจ. สมุทรโกดัง — ต้องการโกดัง 1,200 ตร.ม.", time: "3 นาทีที่แล้ว", href: "/leads/4" },
  { id: 2, icon: "✅", title: "อนุมัติใบเสนอราคา", body: "Q-2026-0097 ได้รับการอนุมัติจาก HQ", time: "1 ชั่วโมงที่แล้ว", href: "/quotations" },
  { id: 3, icon: "⚠️", title: "โครงการใกล้ deadline", body: "EASYBUILD แม่สอด — เหลือ 7 วัน", time: "ผ่านมา 2 ชั่วโมง", href: "/projects/6" },
  { id: 4, icon: "📋", title: "งานใหม่ถูกมอบหมาย", body: "เตรียมเอกสารส่งมอบ EASYBUILD", time: "เมื่อวาน", href: "/tasks" },
  { id: 5, icon: "💰", title: "รับชำระเงินสำเร็จ", body: "โครงการระยอง VCS Asia — ฿6.2M", time: "เมื่อวาน", href: "/payments" },
];

type SearchResult = { type: string; label: string; sub: string; href: string };

function useClickOutside(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, cb]);
}

export function Topbar() {
  const { session, isHQ, currentKey, login, logout } = useRole();
  const router = useRouter();
  const initial = session.name.charAt(0).toUpperCase();
  const roleLabel = isHQ ? "ผู้บริหาร HQ"
    : ({ DEALER_ADMIN: "ผู้จัดการสาขา", DEALER_SALES: "เซลส์", DEALER_SITE: "ช่างหน้างาน" } as Record<string, string>)[session.role] ?? "สมาชิก";

  // ── states ──
  const [showSearch, setShowSearch]     = useState(false);
  const [showNotifs, setShowNotifs]     = useState(false);
  const [showUser,   setShowUser]       = useState(false);
  const [searchQ,    setSearchQ]        = useState("");
  const [readIds,    setReadIds]        = useState<Set<number>>(new Set());

  const notifsRef = useRef<HTMLDivElement>(null);
  const userRef   = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const closeNotifs = useCallback(() => setShowNotifs(false), []);
  const closeUser   = useCallback(() => setShowUser(false),   []);
  useClickOutside(notifsRef, closeNotifs);
  useClickOutside(userRef,   closeUser);

  // open search overlay
  useEffect(() => {
    if (showSearch) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [showSearch]);

  // close on Esc
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") { setShowSearch(false); setShowNotifs(false); setShowUser(false); } }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // ── search results ──
  const q = searchQ.trim().toLowerCase();
  const results: SearchResult[] = q.length < 1 ? [] : [
    ...leads.filter(l =>
      l.name.toLowerCase().includes(q) || l.contact.toLowerCase().includes(q) || l.province.toLowerCase().includes(q)
    ).slice(0, 4).map(l => ({ type: "ลีด", label: l.name, sub: `${l.contact} · ${l.province} · ${l.value}`, href: `/leads/${l.numId}` })),
    ...projects.filter(p =>
      p.title.toLowerCase().includes(q) || p.client.toLowerCase().includes(q)
    ).slice(0, 3).map(p => ({ type: "โครงการ", label: p.title, sub: `${p.client} · ${p.value}`, href: `/projects/${p.id}` })),
    ...customers.filter(c =>
      c.name.toLowerCase().includes(q) || c.company.toLowerCase().includes(q) || c.province.toLowerCase().includes(q)
    ).slice(0, 3).map(c => ({ type: "ลูกค้า", label: c.company, sub: `${c.name} · ${c.province}`, href: `/customers/${c.id}` })),
  ];

  const unreadCount = NOTIFS.filter(n => !readIds.has(n.id)).length;

  function markAll() { setReadIds(new Set(NOTIFS.map(n => n.id))); }
  function markOne(id: number) { setReadIds(prev => new Set([...prev, id])); }

  function handleLogout() {
    setShowUser(false);
    logout();
    router.push("/login");
  }

  function handleSwitch(key: "hq" | "dealer") {
    setShowUser(false);
    login(key);
    router.push(key === "hq" ? "/hq/dashboard" : "/dashboard");
  }

  function goTo(href: string) {
    setShowSearch(false);
    setSearchQ("");
    router.push(href);
  }

  // ── type badge color ──
  const typeColor: Record<string, { bg: string; text: string }> = {
    ลีด:     { bg: "#dce5f0", text: PRIMARY },
    โครงการ: { bg: "#fef3cd", text: "#f59e0b" },
    ลูกค้า:  { bg: "#e5faf0", text: "#22c55e" },
  };

  return (
    <>
      {/* ── Search overlay ──────────────────────────────────────── */}
      {showSearch && (
        <div
          onClick={() => { setShowSearch(false); setSearchQ(""); }}
          style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.45)", zIndex:400, display:"flex", alignItems:"flex-start", justifyContent:"center", paddingTop:80 }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{ width:"100%", maxWidth:560, background:"#fff", borderRadius:16, boxShadow:"0 24px 64px rgba(0,51,102,.22)", overflow:"hidden" }}>
            {/* Input */}
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"14px 16px", borderBottom:`1px solid ${BORDER}` }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={searchInputRef}
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                placeholder="ค้นหาลีด โครงการ ลูกค้า…"
                style={{ flex:1, border:"none", outline:"none", fontSize:"0.95rem", color:STEEL, background:"transparent" }}/>
              <button onClick={() => { setShowSearch(false); setSearchQ(""); }}
                style={{ fontSize:"0.72rem", color:"#9ca3af", background:"none", border:`1px solid ${BORDER}`, borderRadius:6, padding:"3px 8px", cursor:"pointer" }}>
                Esc
              </button>
            </div>
            {/* Results */}
            {results.length > 0 ? (
              <div style={{ maxHeight:360, overflowY:"auto" }}>
                {results.map((r, i) => {
                  const tc = typeColor[r.type] ?? { bg:"#f0f0f5", text:"#6b7280" };
                  return (
                    <button key={i} onClick={() => goTo(r.href)}
                      style={{ display:"flex", alignItems:"center", gap:12, width:"100%", padding:"11px 16px",
                        border:"none", borderBottom:`1px solid ${BG}`, background:"#fff", cursor:"pointer", textAlign:"left" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = BG; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}>
                      <span style={{ padding:"2px 8px", borderRadius:99, fontSize:"0.63rem", fontWeight:700, background:tc.bg, color:tc.text, flexShrink:0 }}>{r.type}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:"0.84rem", fontWeight:700, color:STEEL, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.label}</div>
                        <div style={{ fontSize:"0.7rem", color:"#6b7280", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{r.sub}</div>
                      </div>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
                    </button>
                  );
                })}
              </div>
            ) : q.length > 0 ? (
              <div style={{ padding:"28px 16px", textAlign:"center", fontSize:"0.82rem", color:"#9ca3af" }}>
                ไม่พบผลลัพธ์สำหรับ &ldquo;{searchQ}&rdquo;
              </div>
            ) : (
              <div style={{ padding:"16px", display:"flex", flexDirection:"column", gap:6 }}>
                <div style={{ fontSize:"0.68rem", color:"#9ca3af", fontWeight:700, marginBottom:4, letterSpacing:"0.05em" }}>ค้นหาด่วน</div>
                {[{ label:"ดูลีดทั้งหมด", href:"/leads" }, { label:"ดูโครงการทั้งหมด", href:"/projects" }, { label:"ดูลูกค้าทั้งหมด", href:"/customers" }].map(s => (
                  <button key={s.href} onClick={() => goTo(s.href)}
                    style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 10px", border:`1px solid ${BORDER}`, borderRadius:9, background:"#fff", color:STEEL, fontSize:"0.8rem", fontWeight:600, cursor:"pointer", textAlign:"left" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = BG; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}>
                    <span style={{ color:"#9ca3af" }}>→</span> {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Topbar ──────────────────────────────────────────────── */}
      <header style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap:10, padding:"10px 24px", flexShrink:0 }}>

        {/* Search button */}
        <button
          onClick={() => setShowSearch(true)}
          style={{ display:"flex", alignItems:"center", justifyContent:"center", width:40, height:40, borderRadius:"50%", background:"#fff", border:`1px solid ${BORDER}`, color:"#6b7280", boxShadow:"0 2px 14px rgba(0,51,102,.07)", cursor:"pointer", flexShrink:0 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f0f4f8"; (e.currentTarget as HTMLElement).style.color = PRIMARY; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.color = "#6b7280"; }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
        </button>

        {/* Bell + dropdown */}
        <div ref={notifsRef} style={{ position:"relative" }}>
          <button
            onClick={() => { setShowNotifs(p => !p); setShowUser(false); }}
            style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center", width:40, height:40, borderRadius:"50%", background:"#fff", border:`1px solid ${BORDER}`, color:"#6b7280", boxShadow:"0 2px 14px rgba(0,51,102,.07)", cursor:"pointer", flexShrink:0 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f0f4f8"; (e.currentTarget as HTMLElement).style.color = PRIMARY; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.color = "#6b7280"; }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            {unreadCount > 0 && (
              <span style={{ position:"absolute", top:-3, right:-3, minWidth:18, height:18, background:"#f04d6a", borderRadius:"50%", border:"2px solid #f4f6f9",
                fontSize:"0.52rem", fontWeight:900, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", padding:"0 3px" }}>
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications panel */}
          {showNotifs && (
            <div style={{ position:"fixed", top:70, right:24, width:340, background:"#fff", borderRadius:14, border:`1px solid ${BORDER}`, boxShadow:"0 16px 48px rgba(0,51,102,.16)", zIndex:300, overflow:"hidden" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", borderBottom:`1px solid ${BORDER}` }}>
                <span style={{ fontSize:"0.85rem", fontWeight:800, color:STEEL }}>การแจ้งเตือน</span>
                <button onClick={markAll} style={{ fontSize:"0.7rem", color:PRIMARY, background:"none", border:"none", cursor:"pointer", fontWeight:600 }}>อ่านทั้งหมด</button>
              </div>
              <div style={{ maxHeight:340, overflowY:"auto" }}>
                {NOTIFS.map(n => {
                  const isRead = readIds.has(n.id);
                  return (
                    <button key={n.id}
                      onClick={() => { markOne(n.id); setShowNotifs(false); router.push(n.href); }}
                      style={{ display:"flex", alignItems:"flex-start", gap:10, width:"100%", padding:"11px 16px", border:"none",
                        borderBottom:`1px solid ${BG}`, background:isRead ? "#fff" : "#f6f9ff",
                        cursor:"pointer", textAlign:"left" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = BG; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isRead ? "#fff" : "#f6f9ff"; }}>
                      <span style={{ fontSize:"1.2rem", lineHeight:1, flexShrink:0, marginTop:1 }}>{n.icon}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                          <span style={{ fontSize:"0.78rem", fontWeight:700, color:STEEL }}>{n.title}</span>
                          {!isRead && <span style={{ width:6, height:6, borderRadius:"50%", background:"#f04d6a", flexShrink:0 }}/>}
                        </div>
                        <div style={{ fontSize:"0.7rem", color:"#6b7280", lineHeight:1.4 }}>{n.body}</div>
                        <div style={{ fontSize:"0.63rem", color:"#9ca3af", marginTop:3 }}>{n.time}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div style={{ padding:"10px 16px", borderTop:`1px solid ${BORDER}` }}>
                <button onClick={() => { setShowNotifs(false); router.push("/tasks"); }}
                  style={{ width:"100%", padding:"7px", border:`1px solid ${BORDER}`, borderRadius:9, background:"#fff", color:STEEL, fontSize:"0.75rem", fontWeight:600, cursor:"pointer" }}>
                  ดูทั้งหมด →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User pill + dropdown */}
        <div ref={userRef} style={{ position:"relative" }}>
          <button
            onClick={() => { setShowUser(p => !p); setShowNotifs(false); }}
            style={{ display:"flex", alignItems:"center", gap:10, background:"#fff", border:`1px solid ${BORDER}`, borderRadius:12,
              padding:"5px 14px 5px 6px", boxShadow:"0 2px 14px rgba(0,51,102,.07)", cursor:"pointer" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f0f4f8"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}>
            <div style={{ width:32, height:32, borderRadius:"50%", background:PRIMARY, display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:"0.8rem", fontWeight:900, color:"#fff", flexShrink:0 }}>
              {initial}
            </div>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontSize:"0.78rem", fontWeight:700, color:STEEL, lineHeight:1.2 }}>{session.name}</div>
              <div style={{ fontSize:"0.6rem", color:"#6b7280" }}>{roleLabel}</div>
            </div>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" style={{ marginLeft:2, transform: showUser ? "rotate(180deg)" : "none", transition:"transform .15s" }}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>

          {/* User menu */}
          {showUser && (
            <div style={{ position:"fixed", top:70, right:24, width:240, background:"#fff", borderRadius:14, border:`1px solid ${BORDER}`, boxShadow:"0 16px 48px rgba(0,51,102,.16)", zIndex:300, overflow:"hidden" }}>
              {/* Profile header */}
              <div style={{ padding:"14px 16px", borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:40, height:40, borderRadius:"50%", background:PRIMARY, display:"flex", alignItems:"center", justifyContent:"center",
                  fontSize:"1rem", fontWeight:900, color:"#fff", flexShrink:0 }}>
                  {initial}
                </div>
                <div>
                  <div style={{ fontSize:"0.85rem", fontWeight:800, color:STEEL }}>{session.name}</div>
                  <div style={{ fontSize:"0.68rem", color:"#6b7280" }}>{roleLabel}</div>
                  <div style={{ fontSize:"0.63rem", color:"#9ca3af", marginTop:1 }}>{session.dealerName}</div>
                </div>
              </div>

              {/* Menu items */}
              <div style={{ padding:"6px 0" }}>
                {[
                  { icon:"👤", label:"โปรไฟล์", href:"/settings" },
                  { icon:"⚙️", label:"ตั้งค่า", href:"/settings" },
                ].map(item => (
                  <button key={item.label} onClick={() => { setShowUser(false); router.push(item.href); }}
                    style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"9px 16px", border:"none", background:"none", cursor:"pointer", color:STEEL, fontSize:"0.8rem", fontWeight:600, textAlign:"left" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = BG; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; }}>
                    <span style={{ fontSize:"0.9rem" }}>{item.icon}</span> {item.label}
                  </button>
                ))}

                {/* Switch role */}
                <div style={{ margin:"6px 12px", padding:"8px 10px", background:BG, borderRadius:9 }}>
                  <div style={{ fontSize:"0.63rem", color:"#9ca3af", fontWeight:700, marginBottom:6, letterSpacing:"0.05em" }}>สลับบทบาท</div>
                  <div style={{ display:"flex", gap:6 }}>
                    {(["dealer","hq"] as const).map(k => (
                      <button key={k} onClick={() => handleSwitch(k)}
                        style={{ flex:1, padding:"5px 0", borderRadius:8, border:"none", cursor:"pointer", fontSize:"0.72rem", fontWeight:700, transition:"all .12s",
                          background: currentKey===k ? PRIMARY : "#fff",
                          color: currentKey===k ? "#fff" : "#6b7280",
                          boxShadow: currentKey===k ? "0 2px 8px rgba(0,51,102,.25)" : "none" }}>
                        {k === "dealer" ? "ดีลเลอร์" : "HQ"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Logout */}
              <div style={{ padding:"6px 0 8px", borderTop:`1px solid ${BORDER}` }}>
                <button onClick={handleLogout}
                  style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"9px 16px", border:"none", background:"none", cursor:"pointer", color:"#f04d6a", fontSize:"0.8rem", fontWeight:700, textAlign:"left" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fdeaed"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "none"; }}>
                  <span style={{ fontSize:"0.9rem" }}>🚪</span> ออกจากระบบ
                </button>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
