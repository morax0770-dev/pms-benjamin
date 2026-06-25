import { pipelineBreakdown } from "@/lib/mock";

function polarToXY(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function slicePath(cx: number, cy: number, r: number, start: number, end: number) {
  const s = polarToXY(cx, cy, r, start);
  const e = polarToXY(cx, cy, r, end);
  const large = end - start > 180 ? 1 : 0;
  return `M${cx},${cy} L${s.x},${s.y} A${r},${r} 0 ${large},1 ${e.x},${e.y} Z`;
}

export function DonutChart() {
  const total = pipelineBreakdown.reduce((s, d) => s + d.value, 0);
  const cx = 80; const cy = 80; const r = 65; const ir = 42;
  let cursor = 0;

  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: 18,
      border: "1px solid #cfd4dc", boxShadow: "0 2px 14px rgba(0,51,102,.07)",
    }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
        <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#2D2D2D" }}>สถิติลีด</div>
        <button style={{
          fontSize: "0.7rem", border: "1px solid #cfd4dc", borderRadius: 99,
          padding: "3px 10px", color: "#6b7280", cursor: "pointer", background: "none",
        }}>
          สถานะ ▾
        </button>
      </div>
      <div style={{ fontSize: "0.7rem", color: "#6b7280", marginBottom: 14, lineHeight: 1.5 }}>
        ลีดเพิ่มขึ้นหลายหมวดหมู่<br />เดือนนี้เทียบกับเดือนที่แล้ว
      </div>

      <div className="flex items-center justify-center" style={{ marginBottom: 14 }}>
        <svg viewBox="0 0 160 160" style={{ width: 140, height: 140 }}>
          {pipelineBreakdown.map((d) => {
            const deg = (d.value / total) * 360;
            const path = slicePath(cx, cy, r, cursor, cursor + deg);
            cursor += deg;
            return <path key={d.label} d={path} fill={d.color} />;
          })}
          <circle cx={cx} cy={cy} r={ir} fill="white" />
          <text x={cx} y={cy - 6} textAnchor="middle" fontSize="16" fontWeight="800" fill="#2D2D2D">
            {total}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize="8" fill="#6b7280">
            ลีดทั้งหมด
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 0 }}>
        {pipelineBreakdown.map((d, i) => (
          <div key={d.label} className="flex items-center gap-1.5"
            style={{
              width: "50%", padding: "5px 0", fontSize: "0.7rem", color: "#6b7280",
              borderTop: i >= 2 ? "1px solid #cfd4dc" : "none",
            }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
            <span>{d.label}</span>
            <span style={{ marginLeft: "auto", fontWeight: 700, fontSize: "0.72rem", color: "#2D2D2D" }}>
              {d.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
