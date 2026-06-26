"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, FileText, FileSignature,
  Workflow, ClipboardList, Store, Package,
  Bell, TrendingUp, Settings,
  Percent, ChevronRight, FolderOpen,
  Calendar, ListTodo, ShieldCheck, Banknote,
} from "lucide-react";
import { useRole } from "@/context/RoleContext";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
};
type NavSeparator = { separator: true; label: string };
type NavEntry = NavItem | NavSeparator;
type NavGroup = { group: string; items: NavItem[] };

const DEALER_NAV: NavEntry[] = [
  { separator: true, label: "หลัก" },
  { label: "แผงควบคุม",      href: "/dashboard",     icon: <LayoutDashboard size={15} /> },
  { separator: true, label: "การขาย" },
  { label: "ลีด",             href: "/leads",         icon: <Workflow size={15} />, badge: 6 },
  { separator: true, label: "ลูกค้า" },
  { label: "ลูกค้า",          href: "/customers",     icon: <Users size={15} /> },
  { separator: true, label: "กิจกรรม" },
  { label: "นัดหมาย",         href: "/appointments",  icon: <Calendar size={15} /> },
  { label: "งาน",              href: "/tasks",         icon: <ListTodo size={15} /> },
  { separator: true, label: "เอกสาร" },
  { label: "ใบเสนอราคา",     href: "/quotations",    icon: <FileText size={15} /> },
  { label: "สัญญา",           href: "/contracts",     icon: <FileSignature size={15} /> },
  { label: "การเงิน",         href: "/finance",       icon: <Banknote size={15} /> },
  { label: "ไฟล์",            href: "/files",         icon: <FolderOpen size={15} /> },
  { separator: true, label: "เครื่องมือ" },
  { label: "แม่แบบงาน",       href: "/templates",     icon: <ClipboardList size={15} /> },
];

const HQ_NAV: NavGroup[] = [
  {
    group: "ภาพรวม",
    items: [
      { label: "แดชบอร์ด HQ",  href: "/hq/dashboard",  icon: <LayoutDashboard size={15} /> },
      { label: "ทุกสาขา",       href: "/hq/dealers",    icon: <Store size={15} /> },
      { label: "ลีดส่วนกลาง",  href: "/hq/lead-pool",  icon: <Bell size={15} />, badge: 3 },
    ],
  },
  {
    group: "ติดตามงานขาย",
    items: [
      { label: "Pipeline รวม", href: "/hq/pipeline",   icon: <Workflow size={15} /> },
      { label: "ใบเสนอราคา",  href: "/hq/quotations", icon: <FileText size={15} /> },
      { label: "สัญญา",        href: "/hq/contracts",  icon: <FileSignature size={15} /> },
      { label: "อนุมัติ",      href: "/hq/approvals",  icon: <ShieldCheck size={15} /> },
    ],
  },
  {
    group: "รายงาน & จัดการ",
    items: [
      { label: "รายงานยอดขาย", href: "/reports/sales", icon: <TrendingUp size={15} /> },
      { label: "คอมมิชชัน",    href: "/commission",    icon: <Percent size={15} /> },
      { label: "ราคากลาง",     href: "/hq/master",     icon: <Package size={15} /> },
      { label: "ตั้งค่าระบบ",  href: "/settings",      icon: <Settings size={15} /> },
    ],
  },
];

function Badge({ n }: { n: number }) {
  return (
    <span style={{
      marginLeft: "auto",
      minWidth: 18,
      height: 18,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "0.56rem",
      fontWeight: 700,
      borderRadius: 99,
      padding: "0 5px",
      background: "#f04d6a",
      color: "#fff",
      lineHeight: 1,
      flexShrink: 0,
    }}>{n}</span>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { isHQ, session } = useRole();

  function navItem(item: NavItem) {
    const active = pathname === item.href || (
      item.href !== "/dashboard" &&
      item.href !== "/hq/dashboard" &&
      pathname.startsWith(item.href)
    );
    return (
      <Link
        key={item.href}
        href={item.href}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          padding: "8px 12px",
          borderRadius: 9,
          fontSize: "0.8rem",
          fontWeight: active ? 600 : 400,
          color: active ? "#ffffff" : "#C0C0C0",
          background: active ? "rgba(192,192,192,0.15)" : "transparent",
          textDecoration: "none",
          marginBottom: 1,
          cursor: "pointer",
          border: "none",
          borderLeft: `3px solid ${active ? "#C0C0C0" : "transparent"}`,
          transition: "all .13s",
          width: "100%",
          textAlign: "left",
          boxSizing: "border-box",
          letterSpacing: "0.01em",
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement;
          if (!active) {
            el.style.background = "rgba(192,192,192,0.08)";
            el.style.color = "#ffffff";
          }
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement;
          if (!active) {
            el.style.background = "transparent";
            el.style.color = "#C0C0C0";
          }
        }}
      >
        <span style={{ flexShrink: 0, opacity: active ? 1 : 0.7, display: "flex" }}>{item.icon}</span>
        <span style={{ flex: 1 }}>{item.label}</span>
        {item.badge ? <Badge n={item.badge} /> : null}
        {active && <ChevronRight size={11} style={{ flexShrink: 0, opacity: 0.5 }} />}
      </Link>
    );
  }

  return (
    <aside style={{
      width: 220,
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      background: "#003366",
      flexShrink: 0,
      overflowY: "auto",
      overflowX: "hidden",
      borderRight: "1px solid rgba(0,0,0,0.18)",
    }}>

      {/* Brand */}
      <div style={{ padding: "20px 16px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0, overflow: "hidden",
            background: "rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid rgba(255,255,255,0.15)",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/benjamin-logo-white.png" alt="Benjamin" style={{ width: 28, height: 28, objectFit: "contain" }} />
          </div>
          <div>
            <div style={{ fontWeight: 900, color: "#ffffff", fontSize: "0.92rem", letterSpacing: "0.06em", lineHeight: 1 }}>
              BENJAMIN
            </div>
            <div style={{ fontSize: "0.5rem", color: "rgba(255,255,255,0.45)", fontWeight: 500, letterSpacing: "0.08em", marginTop: 3 }}>
              SALES MANAGEMENT
            </div>
          </div>
        </div>

        {/* Role tag */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          background: "rgba(255,255,255,0.1)",
          border: "1px solid rgba(255,255,255,0.14)",
          borderRadius: 7, padding: "4px 9px",
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: isHQ ? "#4ade80" : "#fbbf24", flexShrink: 0 }} />
          <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.75)", fontWeight: 600, letterSpacing: "0.03em" }}>
            {isHQ ? "HQ · สำนักงานใหญ่" : "Dealer · สาขา"}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "0 16px 8px" }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: "6px 10px 12px", display: "flex", flexDirection: "column" }}>

        {/* DEALER NAV */}
        {!isHQ && DEALER_NAV.map((entry, idx) => {
          if ("separator" in entry) {
            return (
              <div key={`sep-${idx}`} style={{ margin: "12px 4px 4px" }}>
                <span style={{
                  fontSize: "0.57rem",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.3)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  padding: "0 4px",
                }}>
                  {entry.label}
                </span>
              </div>
            );
          }
          return navItem(entry as NavItem);
        })}

        {/* HQ NAV */}
        {isHQ && HQ_NAV.map(group => (
          <div key={group.group} style={{ marginBottom: 6 }}>
            <div style={{ margin: "12px 4px 4px" }}>
              <span style={{
                fontSize: "0.57rem",
                fontWeight: 700,
                color: "rgba(255,255,255,0.3)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                padding: "0 4px",
              }}>
                {group.group}
              </span>
            </div>
            {group.items.map(item => navItem(item))}
          </div>
        ))}
      </nav>

      {/* Bottom user card */}
      <div style={{
        margin: "0 10px 16px",
        padding: "10px 12px",
        borderRadius: 10,
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.1)",
        display: "flex",
        alignItems: "center",
        gap: 9,
        cursor: "pointer",
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: "50%",
          background: "#C0C0C0",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.7rem", fontWeight: 800, color: "#003366", flexShrink: 0,
        }}>{session.name.charAt(0)}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "rgba(255,255,255,0.9)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session.name}</div>
          <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.4)", marginTop: 1 }}>
            {isHQ ? "ผู้บริหาร HQ" : "ผู้จัดการสาขา"} · {session.dealerName}
          </div>
        </div>
        <Settings size={13} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
      </div>
    </aside>
  );
}
