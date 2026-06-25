"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Phone, Users,
  FileText, FileSignature, Receipt, CreditCard,
  BarChart2, Percent, UserCog, Workflow, ClipboardList,
  Store, ShieldCheck, Package, Bell, DollarSign, TrendingUp, Settings,
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
  { separator: true, label: "งานขาย" },
  { label: "แผงควบคุม",    href: "/dashboard",  icon: <LayoutDashboard size={15} /> },
  { label: "ผู้สนใจ",      href: "/leads",      icon: <Phone size={15} />,         badge: 6 },
  { label: "Pipeline ขาย", href: "/pipeline",   icon: <Workflow size={15} /> },
  { label: "ลูกค้า",       href: "/customers",  icon: <Users size={15} /> },
  { separator: true, label: "เอกสาร" },
  { label: "ใบเสนอราคา",  href: "/quotations", icon: <FileText size={15} /> },
  { label: "สัญญา",        href: "/contracts",  icon: <FileSignature size={15} /> },
  { label: "ใบแจ้งหนี้",   href: "/invoices",   icon: <Receipt size={15} /> },
  { label: "การชำระเงิน",  href: "/payments",   icon: <CreditCard size={15} /> },
  { separator: true, label: "เครื่องมือ" },
  { label: "แม่แบบ",       href: "/templates",  icon: <ClipboardList size={15} /> },
  { label: "ทีมงาน",       href: "/team",       icon: <UserCog size={15} /> },
  { label: "รายงาน",        href: "/reports",    icon: <BarChart2 size={15} /> },
];

const HQ_NAV: NavGroup[] = [
  {
    group: "งานหลัก",
    items: [
      { label: "แดชบอร์ด",    href: "/hq/dashboard", icon: <LayoutDashboard size={15} /> },
      { label: "ลีดส่วนกลาง", href: "/hq/lead-pool", icon: <Bell size={15} />,        badge: 3 },
      { label: "รออนุมัติ",    href: "/hq/approvals", icon: <ShieldCheck size={15} />, badge: 2 },
      { label: "สาขา",         href: "/hq/dealers",   icon: <Store size={15} /> },
    ],
  },
  {
    group: "รายงาน",
    items: [
      { label: "วิเคราะห์",   href: "/reports/analytics", icon: <BarChart2 size={15} /> },
      { label: "การเงิน",     href: "/reports/finance",   icon: <DollarSign size={15} /> },
      { label: "ยอดขาย",     href: "/reports/sales",     icon: <TrendingUp size={15} /> },
    ],
  },
  {
    group: "จัดการ",
    items: [
      { label: "คอมมิชชัน", href: "/commission", icon: <Percent size={15} /> },
      { label: "ราคากลาง",  href: "/hq/master",  icon: <Package size={15} /> },
      { label: "ตั้งค่า",    href: "/settings",   icon: <Settings size={15} /> },
    ],
  },
];

const SIDEBAR_BG   = "#ffffff";
const ACTIVE_BG    = "#eef4ff";
const HOVER_BG     = "#f5f7fa";
const ACTIVE_COL   = "#003366";
const INACTIVE_COL = "#6b7280";

function navLinkStyle(active: boolean): React.CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "8px 12px 8px 9px",
    borderRadius: 10,
    fontSize: "0.82rem",
    fontWeight: active ? 700 : 500,
    color: active ? ACTIVE_COL : INACTIVE_COL,
    background: active ? ACTIVE_BG : "transparent",
    borderLeft: `3px solid ${active ? "#003366" : "transparent"}`,
    textDecoration: "none",
    marginBottom: 2,
    cursor: "pointer",
    border: "none",
    width: "100%",
    textAlign: "left",
    transition: "background .12s, color .12s",
    boxSizing: "border-box",
  };
}

function hoverIn(el: HTMLElement) {
  el.style.background = HOVER_BG;
  el.style.color = "#374151";
}
function hoverOut(el: HTMLElement, active: boolean) {
  el.style.background = active ? ACTIVE_BG : "transparent";
  el.style.color = active ? ACTIVE_COL : INACTIVE_COL;
}

function Badge({ n }: { n: number }) {
  return (
    <span style={{
      marginLeft: "auto",
      fontSize: "0.58rem",
      fontWeight: 700,
      borderRadius: 99,
      padding: "2px 6px",
      background: "#f04d6a",
      color: "#fff",
      lineHeight: 1,
    }}>{n}</span>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { isHQ } = useRole();

  return (
    <aside style={{
      width: 214, display: "flex", flexDirection: "column",
      height: "100vh", background: SIDEBAR_BG, flexShrink: 0, overflowY: "auto",
      borderRight: "1px solid #e5e7eb",
    }}>

      {/* Brand */}
      <div style={{ padding: "18px 16px 14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9, flexShrink: 0, overflow: "hidden",
            background: "#003366",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/benjamin-logo-white.png" alt="Benjamin" style={{ width: 28, height: 28, objectFit: "contain" }} />
          </div>
          <div>
            <div style={{ fontWeight: 900, color: "#003366", fontSize: "0.9rem", letterSpacing: "0.04em", lineHeight: 1 }}>
              BENJAMIN
            </div>
            <div style={{ fontSize: "0.52rem", color: "#9ca3af", fontWeight: 500,
              letterSpacing: "0.06em", marginTop: 2 }}>
              PRE-ENGINEERED BUILDING
            </div>
          </div>
        </div>
        {/* Role tag */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 4,
          background: "#f0f4f8", border: "1px solid #e5e7eb", borderRadius: 6, padding: "3px 8px" }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: isHQ ? "#22c55e" : "#ECC94B" }} />
          <span style={{ fontSize: "0.6rem", color: "#6b7280", fontWeight: 600 }}>
            {isHQ ? "HQ · สำนักงานใหญ่" : "Dealer · สาขา"}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "#f0f4f8", margin: "0 14px 8px" }} />

      {/* Nav */}
      <nav style={{ flex: 1, padding: "4px 10px 8px", display: "flex", flexDirection: "column" }}>

        {/* DEALER NAV */}
        {!isHQ && DEALER_NAV.map((entry, idx) => {
          if ("separator" in entry) {
            return (
              <div key={`sep-${idx}`} style={{ margin: "10px 4px 5px" }}>
                <span style={{
                  fontSize: "0.59rem", fontWeight: 700,
                  color: "#b0b8c4",
                  textTransform: "uppercase", letterSpacing: "0.08em",
                  padding: "0 4px",
                }}>
                  {entry.label}
                </span>
              </div>
            );
          }

          const item = entry as NavItem;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={navLinkStyle(active)}
              onMouseEnter={e => { if (!active) hoverIn(e.currentTarget as HTMLElement); }}
              onMouseLeave={e => { if (!active) hoverOut(e.currentTarget as HTMLElement, active); }}
            >
              <span style={{ flexShrink: 0, opacity: active ? 1 : 0.65, color: active ? "#003366" : "inherit" }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge ? <Badge n={item.badge} /> : null}
            </Link>
          );
        })}

        {/* HQ NAV */}
        {isHQ && HQ_NAV.map(group => (
          <div key={group.group} style={{ marginBottom: 10 }}>
            <p style={{
              fontSize: "0.59rem", fontWeight: 700, color: "#b0b8c4",
              textTransform: "uppercase", letterSpacing: "0.08em",
              padding: "0 12px", marginBottom: 4,
            }}>
              {group.group}
            </p>
            {group.items.map(item => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={navLinkStyle(active)}
                  onMouseEnter={e => { if (!active) hoverIn(e.currentTarget as HTMLElement); }}
                  onMouseLeave={e => { if (!active) hoverOut(e.currentTarget as HTMLElement, false); }}
                >
                  <span style={{ flexShrink: 0, opacity: active ? 1 : 0.65, color: active ? "#003366" : "inherit" }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge ? <Badge n={item.badge} /> : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div style={{ paddingBottom: 16 }} />
    </aside>
  );
}
