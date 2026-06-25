"use client";

import {
  Target, TrendingUp, Award, Building2, DollarSign, Clock,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  target: Target,
  trending: TrendingUp,
  award: Award,
  building: Building2,
  dollar: DollarSign,
  clock: Clock,
};

type KpiCardProps = {
  label: string;
  value: string;
  delta: number;
  icon: string;
  sub?: string;
};

export function KpiCard({ label, value, delta, icon, sub }: KpiCardProps) {
  const Icon = iconMap[icon] ?? TrendingUp;
  const positive = delta >= 0;

  return (
    <div
      className="bg-white flex items-center gap-3.5 transition-all cursor-default"
      style={{
        borderRadius: 16,
        padding: "16px 18px",
        border: "1px solid #cfd4dc",
        boxShadow: "0 2px 14px rgba(0,51,102,.07)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 24px rgba(0,51,102,.12)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 14px rgba(0,51,102,.07)";
      }}
    >
      {/* Icon */}
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: 42, height: 42,
          borderRadius: 12,
          background: "#dce5f0",
        }}
      >
        <Icon size={20} color="#003366" />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: "1.5rem", fontWeight: 800, color: "#2D2D2D", lineHeight: 1 }} className="mt-0.5">
          {value}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <span
            style={{
              fontSize: "0.64rem", fontWeight: 700,
              padding: "2px 8px", borderRadius: 99,
              background: positive ? "#e5faf0" : "#fdeaed",
              color: positive ? "#22c55e" : "#f04d6a",
            }}
          >
            {positive ? "↑" : "↓"} {Math.abs(delta)}%
          </span>
          {sub && (
            <span style={{ fontSize: "0.64rem", color: "#6b7280" }}>{sub}</span>
          )}
        </div>
      </div>
    </div>
  );
}
