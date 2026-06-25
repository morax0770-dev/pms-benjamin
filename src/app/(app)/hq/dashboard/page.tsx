import { hqKpis, hqSalesByMonth } from "@/lib/mock";
import { KpiCard } from "@/components/ui/KpiCard";
import { LineChartCard } from "@/components/ui/LineChart";
import { LeaderboardCard } from "@/components/hq/LeaderboardCard";
import { LeadPoolTable } from "@/components/hq/LeadPoolTable";
import { ApprovalQueue } from "@/components/hq/ApprovalQueue";

export default function HQDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 800, color: "#2D2D2D", marginBottom: 3 }}>แดชบอร์ด HQ</h1>
        <p style={{ fontSize: "0.76rem", color: "#6b7280" }}>สรุปยอดขาย · สาขา · ลีดส่วนกลาง — มิถุนายน 2026</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {hqKpis.map((k) => (
          <KpiCard
            key={k.key}
            label={k.label}
            value={k.value}
            delta={k.delta}
            icon={k.icon}
          />
        ))}
      </div>

      {/* Middle row: chart + leaderboard */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-4">
        <LineChartCard
          data={hqSalesByMonth}
          title="ยอดขายรวมทั้งเครือ รายเดือน"
          subtitle="มูลค่าทุกดีลเลอร์รวมกัน (หมื่นบาท)"
        />
        <LeaderboardCard />
      </div>

      {/* Bottom row: lead pool + approvals */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-4">
        <LeadPoolTable />
        <ApprovalQueue />
      </div>
    </div>
  );
}
