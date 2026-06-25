"use client";

import { schedule, upcoming } from "@/lib/mock";
import { MapPin, ChevronRight, CalendarDays } from "lucide-react";

const days = ["จ.", "อ.", "พ.", "พฤ.", "ศ."];
const dates = [16, 17, 18, 19, 20];
const activeIdx = 2;

const CARD_STYLE = {
  background: "#fff", borderRadius: 16, padding: 18,
  border: "1px solid #cfd4dc", boxShadow: "0 2px 14px rgba(0,51,102,.07)",
} as const;

export function SchedulePanel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

      {/* Week strip card */}
      <div style={CARD_STYLE}>
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#2D2D2D" }}>มิถุนายน 2026</div>
          <button style={{ fontSize: "0.72rem", color: "#003366", fontWeight: 600,
            background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
            <CalendarDays size={12} /> เพิ่มนัด
          </button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 4 }}>
          {days.map((d, i) => (
            <div key={d} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "8px 0", borderRadius: 12, cursor: "pointer",
              background: i === activeIdx ? "#003366" : "transparent",
              color: i === activeIdx ? "#fff" : "#6b7280",
              boxShadow: "none",
            }}>
              <span style={{ fontSize: "0.6rem", fontWeight: 500 }}>{d}</span>
              <span style={{ fontSize: "0.88rem", fontWeight: 700, marginTop: 2 }}>{dates[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Today schedule */}
      <div style={CARD_STYLE}>
        <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#2D2D2D", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            นัดวันนี้
          </div>
          <button style={{ fontSize: "0.7rem", color: "#003366", background: "none", border: "none", cursor: "pointer" }}>
            ดูทั้งหมด
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {schedule.map((s) => (
            <div key={s.title} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "10px 12px", borderRadius: 12,
              border: "1px solid #cfd4dc", cursor: "pointer",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f0f4f8"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <div style={{ width: 3, alignSelf: "stretch", borderRadius: 99, background: "#003366", flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#2D2D2D", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {s.title}
                </div>
                <div style={{ fontSize: "0.66rem", color: "#6b7280", marginTop: 2 }}>{s.time}</div>
                <div style={{ fontSize: "0.66rem", color: "#6b7280", display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                  <MapPin size={9} /> {s.place}
                </div>
              </div>
              <ChevronRight size={13} color="#C0C0C0" style={{ flexShrink: 0, marginTop: 2 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming */}
      <div style={CARD_STYLE}>
        <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "#2D2D2D", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            ใกล้ถึงกำหนด
          </div>
          <button style={{ fontSize: "0.7rem", color: "#003366", background: "none", border: "none", cursor: "pointer" }}>
            ดูทั้งหมด
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {upcoming.map((u) => (
            <div key={u.title} style={{
              display: "flex", alignItems: "flex-start", gap: 10,
              padding: "10px 12px", borderRadius: 12,
              border: "1px solid #cfd4dc", cursor: "pointer",
            }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f0f4f8"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: "#dce5f0", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <CalendarDays size={14} color="#003366" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "#2D2D2D", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {u.title}
                </div>
                <div style={{ fontSize: "0.66rem", color: "#6b7280", marginTop: 2 }}>{u.date}</div>
                <div style={{ fontSize: "0.66rem", color: "#6b7280" }}>{u.who}</div>
              </div>
              <ChevronRight size={13} color="#C0C0C0" style={{ flexShrink: 0, marginTop: 2 }} />
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
