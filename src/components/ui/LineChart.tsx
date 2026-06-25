"use client";

import { salesByMonth } from "@/lib/mock";

type DataPoint = { month: string; value: number };

type Props = {
  data?: DataPoint[];
  title?: string;
  subtitle?: string;
};

export function LineChartCard({ data = salesByMonth, title = "ยอดขายรายเดือน", subtitle = "มูลค่าใบเสนอราคาที่ชนะ (หมื่นบาท)" }: Props) {
  const max = Math.max(...data.map((d) => d.value));
  const H = 120;
  const W = 480;
  const padX = 24;
  const padY = 12;
  const innerW = W - padX * 2;
  const innerH = H - padY * 2;

  const points = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * innerW,
    y: padY + (1 - d.value / max) * innerH,
    ...d,
  }));

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const area =
    `M${points[0].x},${padY + innerH} ` +
    points.map((p) => `L${p.x},${p.y}`).join(" ") +
    ` L${points[points.length - 1].x},${padY + innerH} Z`;

  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: 18,
      border: "1px solid #cfd4dc", boxShadow: "0 2px 14px rgba(0,51,102,.07)",
    }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: "0.88rem", fontWeight: 700, color: "#2D2D2D" }}>{title}</div>
          <div style={{ fontSize: "0.68rem", color: "#6b7280", marginTop: 2 }}>{subtitle}</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.68rem", color: "#6b7280" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#003366", display: "inline-block" }} />
              เดือนนี้
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.68rem", color: "#6b7280" }}>
              <span style={{ display: "inline-block", width: 14, borderTop: "2px dashed #C0C0C0" }} />
              เดือนก่อน
            </span>
          </div>
          <select style={{
            fontSize: "0.72rem", border: "1px solid #cfd4dc", borderRadius: 99,
            padding: "4px 12px", color: "#2D2D2D", background: "#fff", outline: "none",
          }}>
            <option>รายเดือน</option>
            <option>รายไตรมาส</option>
          </select>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 140 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#003366" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#003366" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={padX} y1={padY + t * innerH}
            x2={W - padX} y2={padY + t * innerH}
            stroke="#f0eeff" strokeWidth="1.5"
          />
        ))}

        <path d={area} fill="url(#areaGrad)" />

        <polyline
          points={polyline}
          fill="none"
          stroke="#003366"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {points.map((p) => (
          <circle key={p.month} cx={p.x} cy={p.y} r="4" fill="white" stroke="#003366" strokeWidth="2.5" />
        ))}

        {points.map((p) => (
          <text key={p.month} x={p.x} y={H - 2} textAnchor="middle"
            fontSize="9" fill="#6b7280" fontFamily="var(--font-sans)">
            {p.month}
          </text>
        ))}
      </svg>
    </div>
  );
}
