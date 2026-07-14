/**
 * RiskPage — Risk & Backoffice Assessment
 * Design: Neobrutalist Fintech — Credit risk scoring, company assessment, and fraud detection
 */
import {
  EnterpriseCard,
  EnterpriseBadge,
  EnterpriseButton,
  LedgerDivider,
  EnterpriseTable,
  EnterpriseKpiCard,
  ColumnDef
} from "@/components/EnterpriseComponents";
import { Progress } from "@/components/ui/progress";
import { formatMMK, riskAssessments, type RiskAssessment } from "@/data/mockData";
import { ShieldAlert, ShieldCheck, ShieldX, Radar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function RiskPage() {
  const riskData = riskAssessments.map(r => ({
    name: r.companyName.split(" ")[0],
    revenueStability: r.revenueStability,
    employeeStability: r.employeeStability,
    industryRisk: r.industryRisk,
    financialHealth: r.financialHealth,
  }));

  const columns: ColumnDef<RiskAssessment>[] = [
    {
      id: "company",
      header: "Company",
      accessor: (ra) => (
        <div>
          <p className="text-[12px] font-bold text-[#100841]">{ra.companyName}</p>
          <p className="text-[9px] text-[#4f525d] font-mono">{ra.companyId}</p>
        </div>
      ),
      searchString: (ra) => `${ra.companyName} ${ra.companyId}`
    },
    {
      id: "riskTier",
      header: "Risk Tier",
      accessor: (ra) => (
        <EnterpriseBadge 
          variant={
            ra.riskTier === "A" ? "success" : 
            ra.riskTier === "B" ? "info" : 
            ra.riskTier === "C" ? "warning" : 
            ra.riskTier === "D" ? "warning" : "error"
          }
        >
          TIER {ra.riskTier}
        </EnterpriseBadge>
      )
    },
    {
      id: "totalScore",
      header: "Score",
      isNumeric: true,
      align: "right",
      accessor: (ra) => ra.totalScore,
      cellClassName: (ra) => ra.totalScore >= 80 ? "text-emerald-600 font-bold" : ra.totalScore >= 60 ? "text-amber-600 font-bold" : "text-red-600 font-bold"
    },
    {
      id: "revenueStability",
      header: "Revenue",
      isNumeric: true,
      align: "right",
      accessor: (ra) => (
        <div className="flex items-center gap-2 justify-end">
          <Progress value={ra.revenueStability} className="h-1 w-10" />
          <span className="text-[10px] font-mono text-[#4f525d]">{ra.revenueStability}</span>
        </div>
      )
    },
    {
      id: "employeeStability",
      header: "Stability",
      isNumeric: true,
      align: "right",
      accessor: (ra) => (
        <div className="flex items-center gap-2 justify-end">
          <Progress value={ra.employeeStability} className="h-1 w-10" />
          <span className="text-[10px] font-mono text-[#4f525d]">{ra.employeeStability}</span>
        </div>
      )
    },
    {
      id: "industryRisk",
      header: "Ind. Risk",
      isNumeric: true,
      align: "right",
      accessor: (ra) => (
        <div className="flex items-center gap-2 justify-end">
          <Progress value={ra.industryRisk} className="h-1 w-10" />
          <span className="text-[10px] font-mono text-[#4f525d]">{ra.industryRisk}</span>
        </div>
      )
    },
    {
      id: "financialHealth",
      header: "Health",
      isNumeric: true,
      align: "right",
      accessor: (ra) => (
        <div className="flex items-center gap-2 justify-end">
          <Progress value={ra.financialHealth} className="h-1 w-10" />
          <span className="text-[10px] font-mono text-[#4f525d]">{ra.financialHealth}</span>
        </div>
      )
    },
    {
      id: "creditPool",
      header: "Credit Pool",
      isNumeric: true,
      align: "right",
      accessor: (ra) => ra.creditPool
    },
    {
      id: "status",
      header: "Status",
      accessor: () => <EnterpriseBadge variant="success">APPROVED</EnterpriseBadge>
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-[#31d891]" />
          <div>
            <h1 className="text-[15px] font-bold text-[#100841] uppercase tracking-wide">Risk & Backoffice Assessment</h1>
            <p className="text-[10px] text-[#4f525d] uppercase tracking-wider mt-0.5">Credit scoring and portfolio risk monitoring</p>
          </div>
        </div>
        <EnterpriseButton variant="secondary" className="h-8 py-0 px-3 flex items-center gap-1 text-[10px]">
          <Radar className="w-3.5 h-3.5" /> Run Scan
        </EnterpriseButton>
      </div>

      <LedgerDivider />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <EnterpriseKpiCard label="Portfolio Risk" value="Low" change="STABLE" changeDir="up" />
        <EnterpriseKpiCard label="Avg Score" value="74/100" />
        <EnterpriseKpiCard label="Total Credit" value={formatMMK(150000000)} change="12% INC" changeDir="up" />
        <EnterpriseKpiCard label="Fraud Alerts" value="2" change="SECURE" changeDir="down" />
      </div>

      <EnterpriseTable
        data={riskAssessments}
        columns={columns}
        rowKey={(ra) => ra.id}
        searchPlaceholder="Search by company name or ID..."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <EnterpriseCard className="lg:col-span-2 p-4 border-[#dfdfdf] shadow-sm">
          <h3 className="text-[11px] font-bold text-[#100841] uppercase tracking-widest mb-4">Risk Dimensions Comparison</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={riskData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dfdfdf" />
              <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'bold' }} stroke="#4f525d" />
              <YAxis tick={{ fontSize: 9 }} stroke="#4f525d" />
              <Tooltip 
                contentStyle={{ borderRadius: '3px', border: '1px solid #dfdfdf', fontSize: '11px', fontWeight: 'bold' }}
              />
              <Bar dataKey="revenueStability" name="Revenue Stability" fill="#100841" radius={[2, 2, 0, 0]} />
              <Bar dataKey="employeeStability" name="Employee Stability" fill="#31d891" radius={[2, 2, 0, 0]} />
              <Bar dataKey="industryRisk" name="Industry Risk" fill="#10b981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="financialHealth" name="Financial Health" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </EnterpriseCard>

        <EnterpriseCard className="p-4 border-[#dfdfdf] shadow-sm">
          <h3 className="text-[11px] font-bold text-[#100841] uppercase tracking-widest mb-4">Backoffice Controls</h3>
          <div className="space-y-3">
            {[
              { icon: ShieldAlert, title: "Ghost Detection", status: "Active", color: "text-emerald-500" },
              { icon: ShieldCheck, title: "ID Uniqueness", status: "Active", color: "text-emerald-500" },
              { icon: Radar, title: "Fraud Pattern", status: "Active", color: "text-emerald-500" },
              { icon: ShieldX, title: "Freeze Queue", status: "1 Pending", color: "text-amber-500" },
              { icon: ShieldAlert, title: "Overdraft Prot.", status: "Active", color: "text-emerald-500" },
              { icon: ShieldCheck, title: "Compliance", status: "88%", color: "text-blue-500" },
            ].map((ctrl, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-[2px] bg-[#efefff] border border-[#dfdfdf]">
                <div className="flex items-center gap-2">
                  <ctrl.icon className={`w-3.5 h-3.5 ${ctrl.color}`} />
                  <span className="text-[11px] font-bold text-[#100841] uppercase tracking-tight">{ctrl.title}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#4f525d]">{ctrl.status}</span>
              </div>
            ))}
          </div>
          <EnterpriseButton variant="secondary" className="w-full mt-4 h-8 text-[10px] font-bold">Configure Controls</EnterpriseButton>
        </EnterpriseCard>
      </div>
    </div>
  );
}

