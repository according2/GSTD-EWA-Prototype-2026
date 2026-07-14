/**
 * DashboardPage — Analytical Command Dashboard
 * SAP Fiori Pattern: Analytical Page — KPI cards, charts, alerts
 * Design: Enterprise Fintech — Navy (#100841) + Teal (#31d891) | Sharp corners | Structured
 */
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";
import {
  TrendingUp, TrendingDown, Users, ArrowUpRight, Building2, AlertTriangle,
  Clock, CheckCircle2, AlertCircle, DollarSign, Repeat, ShieldAlert, Lock,
  LayoutGrid, ArrowRight
} from "lucide-react";
import { formatMMK, companies, transactions, employees, riskAssessments } from "@/data/mockData";
import { useView } from "@/contexts/ViewContext";
import {
  EnterpriseCard,
  EnterpriseKpiCard,
  EnterpriseMessageStrip,
  LedgerDivider
} from "@/components/EnterpriseComponents";

const COLORS = ["#100841", "#31d891", "#10b981", "#f59e0b", "#c62828"];

export function DashboardPage() {
  const { view } = useView();

  const totalDisbursed = transactions.reduce((s, t) => s + t.amount, 0);
  const totalRepaid = transactions.filter(t => t.status === "Repaid").reduce((s, t) => s + t.amount, 0);
  const totalOutstanding = transactions.filter(t => t.status === "Overdue").reduce((s, t) => s + t.amount, 0);
  const activeEmployees = employees.filter(e => e.status === "Active").length;
  const pendingVerification = employees.filter(e => e.status === "Pending Verification").length;
  const overdueCount = transactions.filter(t => t.status === "Overdue").length;
  const totalBudget = companies.reduce((s, c) => s + c.totalBudget, 0);
  const totalUtilized = companies.reduce((s, c) => s + c.utilized, 0);
  const utilizationPct = Math.round((totalUtilized / totalBudget) * 100);

  const companyData = companies.map(c => ({
    name: c.name.split(" ")[0],
    budget: c.totalBudget / 1000000,
    used: c.utilized / 1000000,
  }));

  const statusData = [
    { name: "Repaid", value: transactions.filter(t => t.status === "Repaid").length },
    { name: "Active", value: transactions.filter(t => t.status === "Approved" || t.status === "Disbursing").length },
    { name: "Overdue", value: overdueCount },
    { name: "Pending", value: transactions.filter(t => t.status === "Pending").length },
  ];

  const monthlyTrend = [
    { month: "Jan", disbursed: 420000, repaid: 310000, feeRevenue: 12000 },
    { month: "Feb", disbursed: 680000, repaid: 520000, feeRevenue: 18000 },
    { month: "Mar", disbursed: 920000, repaid: 780000, feeRevenue: 24000 },
    { month: "Apr", disbursed: 1100000, repaid: 950000, feeRevenue: 28000 },
    { month: "May", disbursed: 1350000, repaid: 1120000, feeRevenue: 32000 },
    { month: "Jun", disbursed: 1580000, repaid: 1280000, feeRevenue: 35000 },
    { month: "Jul", disbursed: totalDisbursed, repaid: totalRepaid, feeRevenue: 43295 },
  ];

  return (
    <div className="space-y-4">
      {/* ===== Page Header — SAP Fiori Object Page Header ===== */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-4 h-4 text-[#31d891]" />
          <div>
            <h1 className="text-[15px] font-bold text-[#100841] uppercase tracking-wide">Command Dashboard</h1>
            <p className="text-[10px] text-[#4f525d] uppercase tracking-wider">
              {view === "HR" && "Employee lifecycle, onboarding, and payroll oversight"}
              {view === "Sales" && "Corporate portfolio, revenue, and client health"}
              {view === "Operations" && "Daily operations, disbursements, and settlements"}
              {view === "Back Office" && "Transaction processing, verification, and reconciliation"}
              {view === "Finance" && "GL ledger, accounting entries, and financial health"}
              {view === "Risk" && "Credit risk, compliance, and fraud detection"}
              {view === "Platform Admin" && "System configuration, policies, and platform health"}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono text-[#4f525d] border border-[#dfdfdf] rounded-[2px] px-2 py-1 bg-white font-semibold">
          12 JUL 2026
        </span>
      </div>

      <LedgerDivider />

      {/* ===== KPI Row 1 — Primary Metrics ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <EnterpriseKpiCard
          label="Active Companies"
          value={String(companies.filter(c => c.status === "Active").length)}
          change="1"
          changeDir="up"
          accentColor="navy"
          icon={<Building2 className="w-3.5 h-3.5 text-[#100841]" />}
          subValue={`${companies.length} total registered`}
        />
        <EnterpriseKpiCard
          label="Active Employees"
          value={String(activeEmployees)}
          change="3"
          changeDir="up"
          accentColor="teal"
          icon={<Users className="w-3.5 h-3.5 text-[#31d891]" />}
          subValue={`${employees.length} total onboarded`}
        />
        <EnterpriseKpiCard
          label="Total Budget"
          value={formatMMK(totalBudget)}
          change="15%"
          changeDir="up"
          accentColor="emerald"
          icon={<DollarSign className="w-3.5 h-3.5 text-[#2e7d32]" />}
          subValue={`${utilizationPct}% utilized`}
        />
        <EnterpriseKpiCard
          label="Total Disbursed"
          value={formatMMK(totalDisbursed)}
          change="22%"
          changeDir="up"
          accentColor="teal"
          icon={<ArrowUpRight className="w-3.5 h-3.5 text-[#31d891]" />}
          subValue="This month"
        />
      </div>

      {/* ===== KPI Row 2 — Risk & Operations ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <EnterpriseKpiCard
          label="Repayment Rate"
          value={`${Math.round((totalRepaid / totalDisbursed) * 100)}%`}
          change="5%"
          changeDir="up"
          accentColor="emerald"
          icon={<Repeat className="w-3.5 h-3.5 text-[#2e7d32]" />}
          subValue={`${formatMMK(totalRepaid)} repaid`}
        />
        <EnterpriseKpiCard
          label="Outstanding"
          value={formatMMK(totalOutstanding)}
          change="12%"
          changeDir="down"
          accentColor="amber"
          icon={<AlertTriangle className="w-3.5 h-3.5 text-[#e65100]" />}
          subValue={`${overdueCount} overdue transactions`}
        />
        <EnterpriseKpiCard
          label="Pending Verification"
          value={String(pendingVerification)}
          change="1"
          changeDir="down"
          accentColor="amber"
          icon={<Clock className="w-3.5 h-3.5 text-[#e65100]" />}
          subValue="Employees awaiting check"
        />
        <EnterpriseKpiCard
          label="Risk Score Avg"
          value={String(Math.round(riskAssessments.reduce((s, r) => s + r.totalScore, 0) / riskAssessments.length))}
          accentColor="navy"
          icon={<ShieldAlert className="w-3.5 h-3.5 text-[#100841]" />}
          subValue="Weighted average across portfolio"
        />
      </div>

      {/* ===== Charts Section ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Budget Utilization by Company */}
        <EnterpriseCard className="p-4">
          <h3 className="text-[10px] font-bold text-[#4f525d] uppercase tracking-widest mb-3">Budget Utilization by Company</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={companyData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#efefff" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#4f525d" }} />
              <YAxis tick={{ fontSize: 11, fill: "#4f525d" }} tickFormatter={(v) => `${v}M`} />
              <Tooltip formatter={(v: number) => [formatMMK(v * 1000000), ""]} contentStyle={{ fontSize: 11, borderRadius: 3, border: "1px solid #dfdfdf" }} />
              <Bar dataKey="used" name="Utilized" fill="#31d891" radius={[2, 2, 0, 0]} />
              <Bar dataKey="budget" name="Total Budget" fill="#100841" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </EnterpriseCard>

        {/* Transaction Status Distribution */}
        <EnterpriseCard className="p-4">
          <h3 className="text-[10px] font-bold text-[#4f525d] uppercase tracking-widest mb-3">Transaction Status Distribution</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v: number, n: string) => [`${v} transactions`, n]} contentStyle={{ fontSize: 11, borderRadius: 3, border: "1px solid #dfdfdf" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-4 justify-center mt-1">
            {statusData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-[1px]" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-[10px] font-medium text-[#4f525d]">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </EnterpriseCard>
      </div>

      {/* ===== Monthly Financial Trend ===== */}
      <EnterpriseCard className="p-4">
        <h3 className="text-[10px] font-bold text-[#4f525d] uppercase tracking-widest mb-3">Monthly Financial Trend</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={monthlyTrend} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#efefff" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#4f525d" }} />
            <YAxis tick={{ fontSize: 11, fill: "#4f525d" }} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}M`} />
            <Tooltip formatter={(v: number, n: string) => [formatMMK(v), n]} contentStyle={{ fontSize: 11, borderRadius: 3, border: "1px solid #dfdfdf" }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            <Line type="monotone" dataKey="disbursed" name="Disbursed" stroke="#100841" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="repaid" name="Repaid" stroke="#31d891" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="feeRevenue" name="Fee Revenue" stroke="#2e7d32" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </EnterpriseCard>

      {/* ===== Pending Actions — SAP Fiori Message Strips ===== */}
      <div>
        <h3 className="text-[10px] font-bold text-[#4f525d] uppercase tracking-widest mb-2">Pending Actions & Alerts</h3>
        <div className="space-y-2">
          {pendingVerification > 0 && (
            <EnterpriseMessageStrip variant="warning" message={`${pendingVerification} Employee(s) Pending Verification — Employment verification and EWA auto-approval checks required.`} />
          )}
          {overdueCount > 0 && (
            <EnterpriseMessageStrip variant="error" message={`${overdueCount} Overdue Transaction(s) — Late fees accumulating — repayment collection required.`} />
          )}
          <EnterpriseMessageStrip variant="info" message="Information: 1 Settlement Awaiting Verification — Skyline Trading — REP-2026-07-001 (Finance Review)." />
        </div>
      </div>
    </div>
  );
}
