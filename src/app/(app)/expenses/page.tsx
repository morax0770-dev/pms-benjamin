"use client";

import { useState, useMemo } from "react";
import { LayoutList, PieChart } from "lucide-react";
import {
  expenses,
  expenseCategoryLabel,
  billingStatusLabel,
  billingStatusColor,
  BillingStatus,
  ExpenseCategory,
  ExpenseMock,
} from "@/lib/mock";

const CARD = {
  background: "#fff",
  borderRadius: 16,
  border: "1px solid #cfd4dc",
  boxShadow: "0 2px 14px rgba(0,51,102,.07)",
};

type SortKey = "date" | "amount" | "client";
type SortDir = "asc" | "desc";
type View = "list" | "summary";

const categoryOptions: { value: "" | ExpenseCategory; label: string }[] = [
  { value: "", label: "ทั้งหมด" },
  { value: "travel", label: expenseCategoryLabel["travel"] },
  { value: "printing", label: expenseCategoryLabel["printing"] },
  { value: "testing", label: expenseCategoryLabel["testing"] },
  { value: "equipment", label: expenseCategoryLabel["equipment"] },
  { value: "other", label: expenseCategoryLabel["other"] },
];

const categoryBadgeColor: Record<ExpenseCategory, { bg: string; text: string }> = {
  travel:    { bg: "#dce5f0", text: "#003366" },
  printing:  { bg: "#fef3cd", text: "#f59e0b" },
  testing:   { bg: "#dbeafe", text: "#3b82f6" },
  equipment: { bg: "#e5faf0", text: "#22c55e" },
  other:     { bg: "#f0f0f5", text: "#6b7280" },
};

const categoryAccentColor: Record<ExpenseCategory, string> = {
  travel:    "#3b82f6",
  printing:  "#f59e0b",
  testing:   "#3b82f6",
  equipment: "#22c55e",
  other:     "#6b7280",
};

function formatAmount(n: number) {
  return "฿" + n.toLocaleString("th-TH");
}

function formatDate(d: string) {
  const [y, m, day] = d.split("-");
  const months = ["","ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค."];
  return `${parseInt(day)} ${months[parseInt(m)]} ${parseInt(y) + 543}`;
}

export default function ExpensesPage() {
  const [billingFilter, setBillingFilter] = useState<"" | BillingStatus>("");
  const [categoryFilter, setCategoryFilter] = useState<"" | ExpenseCategory>("");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [view, setView] = useState<View>("list");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const filtered = useMemo(() => {
    let rows: ExpenseMock[] = [...expenses];
    if (billingFilter) rows = rows.filter((r) => r.billingStatus === billingFilter);
    if (categoryFilter) rows = rows.filter((r) => r.category === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.client.toLowerCase().includes(q) ||
          r.project.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q)
      );
    }
    rows.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") cmp = a.date.localeCompare(b.date);
      else if (sortKey === "amount") cmp = a.amount - b.amount;
      else if (sortKey === "client") cmp = a.client.localeCompare(b.client);
      return sortDir === "asc" ? cmp : -cmp;
    });
    return rows;
  }, [billingFilter, categoryFilter, search, sortKey, sortDir]);

  const totalAll = expenses.length;
  const totalBillable = expenses.filter((e) => e.billingStatus === "billable").length;
  const totalNotBillable = expenses.filter((e) => e.billingStatus === "not_billable").length;
  const sumAll = expenses.reduce((s, e) => s + e.amount, 0);

  const sumFiltered = filtered.reduce((s, e) => s + e.amount, 0);
  const sumBillableFiltered = filtered
    .filter((e) => e.billingStatus === "billable" || e.billingStatus === "billed")
    .reduce((s, e) => s + e.amount, 0);

  const billingPills: { value: "" | BillingStatus; label: string }[] = [
    { value: "", label: "ทั้งหมด" },
    { value: "billable", label: billingStatusLabel["billable"] },
    { value: "not_billable", label: billingStatusLabel["not_billable"] },
    { value: "billed", label: billingStatusLabel["billed"] },
  ];

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      <span style={{ marginLeft: 4, fontSize: 11, color: "#003366" }}>
        {sortDir === "asc" ? "▲" : "▼"}
      </span>
    ) : (
      <span style={{ marginLeft: 4, fontSize: 11, color: "#C0C0C0" }}>▼</span>
    );

  // Summary view data
  const categoryBreakdown = useMemo(() => {
    const cats: ExpenseCategory[] = ["travel", "printing", "testing", "equipment", "other"];
    return cats.map((cat) => {
      const rows = expenses.filter((e) => e.category === cat);
      const total = rows.reduce((s, e) => s + e.amount, 0);
      const pct = sumAll > 0 ? (total / sumAll) * 100 : 0;
      return { cat, count: rows.length, total, pct };
    });
  }, [sumAll]);

  const top5 = useMemo(() => {
    return [...expenses].sort((a, b) => b.amount - a.amount).slice(0, 5);
  }, []);

  return (
    <div
      style={{
        background: "#f4f6f9",
        minHeight: "100vh",
        padding: "32px 28px",
        fontFamily: "inherit",
        color: "#2D2D2D",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#003366", margin: 0 }}>
            ค่าใช้จ่าย
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: "4px 0 0" }}>
            ติดตามและจัดการค่าใช้จ่ายทั้งหมดของโครงการ
          </p>
        </div>
        <button
          style={{
            background: "#003366",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 22px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "inherit",
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span>
          เพิ่มค่าใช้จ่าย
        </button>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[
          {
            label: "ทั้งหมด",
            value: `${totalAll} รายการ`,
            sub: "รายการค่าใช้จ่าย",
            accent: "#003366",
            bg: "#dce5f0",
          },
          {
            label: "เรียกเก็บได้",
            value: `${totalBillable} รายการ`,
            sub: "รอส่งใบแจ้งหนี้",
            accent: "#22c55e",
            bg: "#e5faf0",
          },
          {
            label: "ไม่เรียกเก็บ",
            value: `${totalNotBillable} รายการ`,
            sub: "บริษัทรับผิดชอบ",
            accent: "#f04d6a",
            bg: "#fdeaed",
          },
          {
            label: "ยอดรวมทั้งหมด",
            value: formatAmount(sumAll),
            sub: "มูลค่าค่าใช้จ่ายสะสม",
            accent: "#f59e0b",
            bg: "#fef3cd",
          },
        ].map((s) => (
          <div key={s.label} style={{ ...CARD, padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: s.accent,
                }}
              />
              <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#2D2D2D", marginBottom: 2 }}>
              {s.value}
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filter + Search Bar */}
      <div style={{ ...CARD, padding: "18px 22px", marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {/* Billing Pill Filters */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {billingPills.map((p) => {
              const active = billingFilter === p.value;
              return (
                <button
                  key={p.value}
                  onClick={() => setBillingFilter(p.value)}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 20,
                    border: active ? "1.5px solid #003366" : "1.5px solid #cfd4dc",
                    background: active ? "#003366" : "#fff",
                    color: active ? "#fff" : "#2D2D2D",
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all .15s",
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <div
            style={{
              width: 1,
              height: 28,
              background: "#cfd4dc",
              margin: "0 4px",
            }}
          />

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as "" | ExpenseCategory)}
            style={{
              padding: "7px 12px",
              borderRadius: 8,
              border: "1px solid #cfd4dc",
              background: "#fff",
              fontSize: 13,
              color: "#2D2D2D",
              fontFamily: "inherit",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {categoryOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>

          {/* Search */}
          <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
            <span
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#C0C0C0",
                fontSize: 15,
              }}
            >
              &#128269;
            </span>
            <input
              type="text"
              placeholder="ค้นหา ลูกค้า โครงการ รายละเอียด..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "7px 12px 7px 32px",
                borderRadius: 8,
                border: "1px solid #cfd4dc",
                fontSize: 13,
                color: "#2D2D2D",
                fontFamily: "inherit",
                outline: "none",
                background: "#fff",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* View Toggle */}
          <div
            style={{
              display: "flex",
              borderRadius: 8,
              border: "1px solid #cfd4dc",
              overflow: "hidden",
              marginLeft: "auto",
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => setView("list")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                border: "none",
                background: view === "list" ? "#003366" : "transparent",
                color: view === "list" ? "#fff" : "#6b7280",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all .15s",
              }}
            >
              <LayoutList size={15} />
              รายการ
            </button>
            <button
              onClick={() => setView("summary")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 14px",
                border: "none",
                borderLeft: "1px solid #cfd4dc",
                background: view === "summary" ? "#003366" : "transparent",
                color: view === "summary" ? "#fff" : "#6b7280",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all .15s",
              }}
            >
              <PieChart size={15} />
              สรุป
            </button>
          </div>
        </div>
      </div>

      {/* Conditional View */}
      {view === "list" ? (
        /* Table */
        <div style={{ ...CARD, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 860 }}>
              <thead>
                <tr style={{ background: "#f4f6f9" }}>
                  {[
                    {
                      label: "วันที่",
                      col: "date" as SortKey,
                      sortable: true,
                      width: 110,
                    },
                    {
                      label: "ลูกค้า",
                      col: "client" as SortKey,
                      sortable: true,
                      width: 160,
                    },
                    { label: "โครงการ", col: null, sortable: false, width: 200 },
                    { label: "หมวดหมู่", col: null, sortable: false, width: 120 },
                    { label: "รายละเอียด", col: null, sortable: false, width: undefined },
                    {
                      label: "ยอด",
                      col: "amount" as SortKey,
                      sortable: true,
                      width: 110,
                    },
                    { label: "สถานะการเรียกเก็บ", col: null, sortable: false, width: 150 },
                  ].map((h, i) => (
                    <th
                      key={i}
                      onClick={() => h.sortable && h.col && handleSort(h.col)}
                      style={{
                        padding: "12px 16px",
                        textAlign: "left",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#6b7280",
                        letterSpacing: 0.3,
                        borderBottom: "1px solid #cfd4dc",
                        cursor: h.sortable ? "pointer" : "default",
                        userSelect: "none",
                        whiteSpace: "nowrap",
                        width: h.width,
                      }}
                    >
                      {h.label}
                      {h.sortable && h.col && <SortIcon col={h.col} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        padding: "40px 16px",
                        textAlign: "center",
                        color: "#9ca3af",
                        fontSize: 14,
                      }}
                    >
                      ไม่พบรายการค่าใช้จ่าย
                    </td>
                  </tr>
                ) : (
                  filtered.map((row, idx) => {
                    const catColor = categoryBadgeColor[row.category];
                    const blColor = billingStatusColor[row.billingStatus];
                    return (
                      <tr
                        key={row.id}
                        style={{
                          background: idx % 2 === 0 ? "#fff" : "#fafbfc",
                          borderBottom: "1px solid #f0f1f3",
                          transition: "background .12s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#f0f4fa")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            idx % 2 === 0 ? "#fff" : "#fafbfc")
                        }
                      >
                        {/* วันที่ */}
                        <td
                          style={{
                            padding: "13px 16px",
                            fontSize: 13,
                            color: "#6b7280",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatDate(row.date)}
                        </td>

                        {/* ลูกค้า */}
                        <td style={{ padding: "13px 16px" }}>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#003366",
                            }}
                          >
                            {row.client}
                          </span>
                        </td>

                        {/* โครงการ */}
                        <td
                          style={{
                            padding: "13px 16px",
                            fontSize: 13,
                            color: "#2D2D2D",
                            maxWidth: 200,
                          }}
                        >
                          <span
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {row.project}
                          </span>
                        </td>

                        {/* หมวดหมู่ */}
                        <td style={{ padding: "13px 16px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 10px",
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 600,
                              background: catColor.bg,
                              color: catColor.text,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {expenseCategoryLabel[row.category]}
                          </span>
                        </td>

                        {/* รายละเอียด */}
                        <td
                          style={{
                            padding: "13px 16px",
                            fontSize: 13,
                            color: "#2D2D2D",
                          }}
                        >
                          {row.description}
                        </td>

                        {/* ยอด */}
                        <td
                          style={{
                            padding: "13px 16px",
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#003366",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatAmount(row.amount)}
                        </td>

                        {/* สถานะ */}
                        <td style={{ padding: "13px 16px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 12px",
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 600,
                              background: blColor.bg,
                              color: blColor.text,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {billingStatusLabel[row.billingStatus]}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div
            style={{
              padding: "14px 20px",
              borderTop: "1px solid #cfd4dc",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
              background: "#f4f6f9",
            }}
          >
            <span style={{ fontSize: 13, color: "#6b7280" }}>
              แสดง {filtered.length} จาก {expenses.length} รายการ
            </span>
            <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>ยอดรวม:</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#003366" }}>
                  {formatAmount(sumFiltered)}
                </span>
              </div>
              <div
                style={{
                  width: 1,
                  height: 18,
                  background: "#cfd4dc",
                }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>เรียกเก็บได้รวม:</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#22c55e" }}>
                  {formatAmount(sumBillableFiltered)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Summary View */
        <div>
          {/* Category Breakdown Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 16,
              marginBottom: 24,
            }}
          >
            {categoryBreakdown.map(({ cat, count, total, pct }) => {
              const accent = categoryAccentColor[cat];
              const badge = categoryBadgeColor[cat];
              return (
                <div key={cat} style={{ ...CARD, padding: "22px 24px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 14,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: badge.bg,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <PieChart size={18} color={accent} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#2D2D2D" }}>
                          {expenseCategoryLabel[cat]}
                        </div>
                        <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 1 }}>
                          {count} รายการ
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: "#003366" }}>
                        {formatAmount(total)}
                      </div>
                      <div
                        style={{
                          display: "inline-block",
                          marginTop: 3,
                          padding: "2px 8px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 600,
                          background: badge.bg,
                          color: accent,
                        }}
                      >
                        {pct.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div
                    style={{
                      height: 6,
                      borderRadius: 6,
                      background: "#f0f1f3",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        borderRadius: 6,
                        background: accent,
                        transition: "width .4s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Top 5 Expenses Table */}
          <div style={{ ...CARD, overflow: "hidden" }}>
            <div
              style={{
                padding: "16px 20px 0",
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 0,
              }}
            >
              <h3
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#003366",
                  margin: 0,
                  padding: "0 0 14px",
                  borderBottom: "1px solid #cfd4dc",
                  width: "100%",
                }}
              >
                Top 5 ค่าใช้จ่ายสูงสุด
              </h3>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
                <thead>
                  <tr style={{ background: "#f4f6f9" }}>
                    {["#", "วันที่", "ลูกค้า", "รายละเอียด", "ยอด", "สถานะการเรียกเก็บ"].map(
                      (h, i) => (
                        <th
                          key={i}
                          style={{
                            padding: "11px 16px",
                            textAlign: i === 4 ? "right" : "left",
                            fontSize: 12,
                            fontWeight: 600,
                            color: "#6b7280",
                            letterSpacing: 0.3,
                            borderBottom: "1px solid #cfd4dc",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {top5.map((row, idx) => {
                    const blColor = billingStatusColor[row.billingStatus];
                    return (
                      <tr
                        key={row.id}
                        style={{
                          background: idx % 2 === 0 ? "#fff" : "#fafbfc",
                          borderBottom: "1px solid #f0f1f3",
                          transition: "background .12s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "#f0f4fa")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background =
                            idx % 2 === 0 ? "#fff" : "#fafbfc")
                        }
                      >
                        <td
                          style={{
                            padding: "13px 16px",
                            fontSize: 13,
                            fontWeight: 700,
                            color: "#C0C0C0",
                            width: 40,
                          }}
                        >
                          {idx + 1}
                        </td>
                        <td
                          style={{
                            padding: "13px 16px",
                            fontSize: 13,
                            color: "#6b7280",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatDate(row.date)}
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#003366" }}>
                            {row.client}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "13px 16px",
                            fontSize: 13,
                            color: "#2D2D2D",
                          }}
                        >
                          {row.description}
                        </td>
                        <td
                          style={{
                            padding: "13px 16px",
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#003366",
                            whiteSpace: "nowrap",
                            textAlign: "right",
                          }}
                        >
                          {formatAmount(row.amount)}
                        </td>
                        <td style={{ padding: "13px 16px" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "3px 12px",
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 600,
                              background: blColor.bg,
                              color: blColor.text,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {billingStatusLabel[row.billingStatus]}
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
      )}
    </div>
  );
}
