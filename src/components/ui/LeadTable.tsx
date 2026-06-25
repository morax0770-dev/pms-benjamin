"use client";

import { useState } from "react";
import { leads } from "@/lib/mock";
import { StatusBadge } from "./StatusBadge";
import { Search, SlidersHorizontal } from "lucide-react";

export function LeadTable() {
  const [query, setQuery] = useState("");
  const filtered = leads.filter(
    (l) =>
      l.name.toLowerCase().includes(query.toLowerCase()) ||
      l.province.includes(query) ||
      l.id.includes(query)
  );

  return (
    <div style={{
      background: "#fff", borderRadius: 16, overflow: "hidden",
      border: "1px solid #cfd4dc", boxShadow: "0 2px 14px rgba(0,51,102,.07)",
    }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between" style={{ padding: "14px 18px", borderBottom: "1px solid #cfd4dc" }}>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2" style={{
            background: "#fff", border: "1px solid #cfd4dc", borderRadius: 10,
            padding: "7px 12px", minWidth: 200, boxShadow: "0 2px 14px rgba(0,51,102,.07)",
          }}>
            <Search size={13} color="#6b7280" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาลีด..."
              style={{ border: "none", outline: "none", fontSize: "0.8rem", color: "#2D2D2D", background: "transparent", flex: 1 }}
            />
          </div>
          <button style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "#fff", border: "1px solid #cfd4dc", borderRadius: 10,
            padding: "7px 13px", fontSize: "0.77rem", fontWeight: 600, color: "#6b7280",
            boxShadow: "0 2px 14px rgba(0,51,102,.07)", cursor: "pointer",
          }}>
            <SlidersHorizontal size={13} /> ตัวกรอง
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button style={{ fontSize: "0.7rem", color: "#003366", fontWeight: 600, background: "none", border: "none", cursor: "pointer" }}>
            ดูทั้งหมด
          </button>
          <button style={{
            display: "flex", alignItems: "center", gap: 6,
            background: "#003366", color: "#fff", border: "none", borderRadius: 10,
            padding: "7px 14px", fontSize: "0.77rem", fontWeight: 700,
            boxShadow: "0 4px 10px rgba(0,51,102,.25)", cursor: "pointer",
          }}>
            + เพิ่มลีด
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #cfd4dc", background: "#f8f9fb" }}>
              <th style={{ width: 36, padding: "11px 14px" }}>
                <input type="checkbox" style={{ accentColor: "#003366" }} />
              </th>
              {["รหัส", "ชื่อลูกค้า", "จังหวัด", "สินค้า", "สถานะ", "มูลค่า", ""].map((h) => (
                <th key={h} style={{
                  fontSize: "0.68rem", fontWeight: 700, color: "#6b7280",
                  textTransform: "uppercase", letterSpacing: "0.05em",
                  padding: "11px 14px", textAlign: "left", whiteSpace: "nowrap",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.id}
                style={{ borderBottom: "1px solid #f0f4f8" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f8f9fb"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <td style={{ padding: "11px 14px" }}>
                  <input type="checkbox" style={{ accentColor: "#003366" }} />
                </td>
                <td style={{ padding: "11px 14px", fontSize: "0.75rem", color: "#6b7280", fontWeight: 600 }}>
                  {lead.id}
                </td>
                <td style={{ padding: "11px 14px" }}>
                  <div style={{ fontSize: "0.84rem", fontWeight: 600, color: "#2D2D2D" }}>{lead.name}</div>
                </td>
                <td style={{ padding: "11px 14px", fontSize: "0.82rem", color: "#6b7280" }}>{lead.province}</td>
                <td style={{ padding: "11px 14px" }}>
                  <span style={{
                    display: "inline-block", padding: "3px 10px", borderRadius: 99,
                    fontSize: "0.68rem", fontWeight: 700,
                    background: "#dce5f0", color: "#003366",
                  }}>
                    {lead.product}
                  </span>
                </td>
                <td style={{ padding: "11px 14px" }}>
                  <StatusBadge status={lead.status} />
                </td>
                <td style={{ padding: "11px 14px", fontSize: "0.82rem", fontWeight: 600, color: "#2D2D2D" }}>
                  {lead.value}
                </td>
                <td style={{ padding: "11px 14px" }}>
                  <button style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    width: 29, height: 29, borderRadius: 8,
                    border: "1px solid #cfd4dc", background: "#fff",
                    color: "#6b7280", cursor: "pointer",
                  }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "#f0f4f8";
                      (e.currentTarget as HTMLElement).style.borderColor = "#003366";
                      (e.currentTarget as HTMLElement).style.color = "#003366";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "#fff";
                      (e.currentTarget as HTMLElement).style.borderColor = "#cfd4dc";
                      (e.currentTarget as HTMLElement).style.color = "#6b7280";
                    }}
                  >
                    →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between" style={{ padding: "12px 16px", borderTop: "1px solid #cfd4dc" }}>
        <span style={{ fontSize: "0.74rem", color: "#6b7280" }}>
          แสดง {filtered.length} จาก {leads.length} รายการ
        </span>
        <div className="flex items-center gap-1">
          {[1, 2, 3].map((p) => (
            <button key={p} style={{
              minWidth: 30, height: 30, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.78rem", fontWeight: 600, cursor: "pointer",
              border: "none", fontFamily: "inherit",
              background: p === 1 ? "#003366" : "none",
              color: p === 1 ? "#fff" : "#6b7280",
            }}>
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
