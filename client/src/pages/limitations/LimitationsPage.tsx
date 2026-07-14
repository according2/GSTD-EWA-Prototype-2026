/**
 * LimitationsPage — Transaction & Amount Limits
 * Per day, per week, per month, per cycle, per txn, per count per cycle
 * Design: Enterprise Fintech — Deep Navy (#100841) + Teal (#31d891)
 */
import { useState } from "react";
import {
  EnterpriseCard,
  EnterpriseBadge,
  EnterpriseButton,
  LedgerDivider,
  EnterpriseTable,
  EnterpriseKpiCard,
  ColumnDef,
  TableAction
} from "@/components/EnterpriseComponents";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Shield, Plus, Eye, ArrowRight, Clock, AlertTriangle, CheckCircle2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

function formatMMK(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "MMK", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

type LimitScope = "COMPANY" | "GROUP" | "EMPLOYEE" | "GLOBAL";
type LimitPeriod = "PER_TXN" | "PER_DAY" | "PER_WEEK" | "PER_MONTH" | "PER_CYCLE" | "PER_COUNT_CYCLE";

interface LimitRule {
  id: string;
  name: string;
  code: string;
  scope: LimitScope;
  targetId: string;
  targetName: string;
  period: LimitPeriod;
  limitType: "AMOUNT" | "COUNT";
  value: number;
  currency: string;
  status: "ACTIVE" | "INACTIVE" | "DRAFT";
  overridden: boolean;
}

const limitRules: LimitRule[] = [
  { id: "LIM-001", name: "Per Transaction Max", code: "TXN-MAX", scope: "GLOBAL", targetId: "ALL", targetName: "All Companies", period: "PER_TXN", limitType: "AMOUNT", value: 200000, currency: "MMK", status: "ACTIVE", overridden: false },
  { id: "LIM-002", name: "Per Transaction Min", code: "TXN-MIN", scope: "GLOBAL", targetId: "ALL", targetName: "All Companies", period: "PER_TXN", limitType: "AMOUNT", value: 5000, currency: "MMK", status: "ACTIVE", overridden: false },
  { id: "LIM-003", name: "Daily Disbursement Cap", code: "DAILY-CAP", scope: "COMPANY", targetId: "CMP-001", targetName: "Tech Solutions Ltd", period: "PER_DAY", limitType: "AMOUNT", value: 5000000, currency: "MMK", status: "ACTIVE", overridden: false },
  { id: "LIM-004", name: "Daily Transaction Count", code: "DAILY-COUNT", scope: "COMPANY", targetId: "CMP-001", targetName: "Tech Solutions Ltd", period: "PER_DAY", limitType: "COUNT", value: 50, currency: "TXN", status: "ACTIVE", overridden: false },
  { id: "LIM-005", name: "Weekly Disbursement Cap", code: "WEEKLY-CAP", scope: "COMPANY", targetId: "CMP-001", targetName: "Tech Solutions Ltd", period: "PER_WEEK", limitType: "AMOUNT", value: 25000000, currency: "MMK", status: "ACTIVE", overridden: false },
  { id: "LIM-006", name: "Monthly Budget Cap", code: "MONTHLY-CAP", scope: "COMPANY", targetId: "CMP-001", targetName: "Tech Solutions Ltd", period: "PER_MONTH", limitType: "AMOUNT", value: 100000000, currency: "MMK", status: "ACTIVE", overridden: false },
  { id: "LIM-007", name: "Per Cycle Max", code: "CYCLE-MAX", scope: "COMPANY", targetId: "CMP-001", targetName: "Tech Solutions Ltd", period: "PER_CYCLE", limitType: "AMOUNT", value: 120000000, currency: "MMK", status: "ACTIVE", overridden: false },
  { id: "LIM-008", name: "Per Employee Daily Cap", code: "EMP-DAILY-CAP", scope: "EMPLOYEE", targetId: "EMP-001", targetName: "Kyaw Kyaw (ENG)", period: "PER_DAY", limitType: "AMOUNT", value: 200000, currency: "MMK", status: "ACTIVE", overridden: true },
  { id: "LIM-009", name: "Per Employee Monthly Cap", code: "EMP-MONTH-CAP", scope: "EMPLOYEE", targetId: "EMP-001", targetName: "Kyaw Kyaw (ENG)", period: "PER_MONTH", limitType: "AMOUNT", value: 500000, currency: "MMK", status: "ACTIVE", overridden: true },
  { id: "LIM-010", name: "Count Per Cycle Limit", code: "CYCLE-COUNT", scope: "EMPLOYEE", targetId: "EMP-001", targetName: "Kyaw Kyaw (ENG)", period: "PER_COUNT_CYCLE", limitType: "COUNT", value: 15, currency: "TXN", status: "ACTIVE", overridden: false },
  { id: "LIM-011", name: "Group Daily Cap", code: "GRP-DAILY", scope: "GROUP", targetId: "EG-002", targetName: "Engineering Staff", period: "PER_DAY", limitType: "AMOUNT", value: 3000000, currency: "MMK", status: "ACTIVE", overridden: false },
  { id: "LIM-012", name: "Group Monthly Cap", code: "GRP-MONTH", scope: "GROUP", targetId: "EG-002", targetName: "Engineering Staff", period: "PER_MONTH", limitType: "AMOUNT", value: 12000000, currency: "MMK", status: "ACTIVE", overridden: false },
  { id: "LIM-013", name: "Per Employee Weekly Count", code: "EMP-WEEK-COUNT", scope: "EMPLOYEE", targetId: "ALL", targetName: "All Employees", period: "PER_WEEK", limitType: "COUNT", value: 5, currency: "TXN", status: "ACTIVE", overridden: false },
  { id: "LIM-014", name: "Weekly Transaction Count", code: "WEEKLY-COUNT", scope: "COMPANY", targetId: "CMP-001", targetName: "Tech Solutions Ltd", period: "PER_WEEK", limitType: "COUNT", value: 200, currency: "TXN", status: "ACTIVE", overridden: false },
  { id: "LIM-015", name: "Company Trial Limit", code: "TRIAL-LIMIT", scope: "COMPANY", targetId: "CMP-005", targetName: "Startup Inc", period: "PER_TXN", limitType: "AMOUNT", value: 50000, currency: "MMK", status: "DRAFT", overridden: false },
];

export function LimitationsPage() {
  const [selectedRule, setSelectedRule] = useState<LimitRule | null>(null);

  const columns: ColumnDef<LimitRule>[] = [
    {
      id: "id",
      header: "ID",
      accessor: (l) => <span className="font-mono font-bold text-[#100841]">{l.id}</span>,
      searchString: (l) => l.id
    },
    {
      id: "name",
      header: "Rule Name",
      accessor: (l) => (
        <div>
          <p className="text-[12px] font-bold text-[#100841]">{l.name}</p>
          <p className="text-[9px] text-[#4f525d] font-mono">{l.code}</p>
        </div>
      ),
      searchString: (l) => `${l.name} ${l.code}`
    },
    {
      id: "scope",
      header: "Scope",
      accessor: (l) => {
        const variant = l.scope === "GLOBAL" ? "info" : l.scope === "COMPANY" ? "warning" : l.scope === "GROUP" ? "warning" : "success";
        return <EnterpriseBadge variant={variant} className="uppercase">{l.scope}</EnterpriseBadge>;
      }
    },
    {
      id: "target",
      header: "Target Entity",
      accessor: (l) => <span className="text-[11px] text-[#4f525d] font-medium">{l.targetName}</span>
    },
    {
      id: "period",
      header: "Period",
      accessor: (l) => <EnterpriseBadge variant="neutral" className="bg-[#efefff] text-[#100841]">{l.period.replace("PER_", "")}</EnterpriseBadge>
    },
    {
      id: "value",
      header: "Limit Value",
      isNumeric: true,
      align: "right",
      accessor: (l) => l.limitType === "AMOUNT" ? formatMMK(l.value) : `${l.value} ${l.currency}`,
      cellClassName: (l) => "text-[#e65100] font-mono font-bold"
    },
    {
      id: "status",
      header: "Status",
      accessor: (l) => <EnterpriseBadge variant={l.status === "ACTIVE" ? "success" : "neutral"}>{l.status}</EnterpriseBadge>
    }
  ];

  const actions: TableAction<LimitRule>[] = [
    {
      label: "View Configuration",
      icon: <Eye className="w-3.5 h-3.5" />,
      onClick: (l) => setSelectedRule(l)
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#31d891]" />
          <div>
            <h1 className="text-[15px] font-bold text-[#100841] uppercase tracking-wide">Limitation Control Center</h1>
            <p className="text-[10px] text-[#4f525d] uppercase tracking-wider mt-0.5">Hierarchical risk limits and transaction caps management</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EnterpriseButton variant="primary" className="h-8 py-0 px-3 flex items-center gap-1 text-[10px] bg-[#100841]">
            <Plus className="w-3.5 h-3.5" /> Define New Limit
          </EnterpriseButton>
        </div>
      </div>

      <LedgerDivider />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <EnterpriseKpiCard
          label="Active Rules"
          value={limitRules.filter(r => r.status === "ACTIVE").length}
          accentColor="success"
          icon={<CheckCircle2 className="w-3.5 h-3.5 text-[#2e7d32]" />}
        />
        <EnterpriseKpiCard
          label="Global Caps"
          value={limitRules.filter(r => r.scope === "GLOBAL").length}
          accentColor="info"
          icon={<Shield className="w-3.5 h-3.5 text-[#0d47a1]" />}
        />
        <EnterpriseKpiCard
          label="Overrides"
          value={limitRules.filter(r => r.overridden).length}
          accentColor="amber"
          icon={<AlertTriangle className="w-3.5 h-3.5 text-[#e65100]" />}
        />
        <EnterpriseKpiCard
          label="Utilization Warnings"
          value={3}
          accentColor="error"
          icon={<Clock className="w-3.5 h-3.5 text-[#c62828]" />}
        />
      </div>

      <Tabs defaultValue="registry" className="w-full">
        <TabsList>
          <TabsTrigger value="registry">Rule Registry</TabsTrigger>
          <TabsTrigger value="matrix">Limit Matrix</TabsTrigger>
          <TabsTrigger value="utilization">Real-time Utilization</TabsTrigger>
        </TabsList>

        <TabsContent value="registry" className="mt-4 outline-none">
          <EnterpriseTable
            data={limitRules}
            columns={columns}
            rowKey={(l) => l.id}
            actions={actions}
            searchPlaceholder="Filter limit rules..."
          />
          
          {selectedRule && (
            <EnterpriseCard className="mt-6 p-6 border-[#dfdfdf] bg-[#efefff]">
               <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-2">
                   <Settings className="w-4 h-4 text-[#100841]" />
                   <h3 className="text-[13px] font-bold text-[#100841] uppercase tracking-wider">{selectedRule.name} Details</h3>
                 </div>
                 <EnterpriseButton variant="secondary" className="h-7 text-[10px]" onClick={() => setSelectedRule(null)}>Close</EnterpriseButton>
               </div>
               
               <div className="grid grid-cols-4 gap-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest">Scope / Level</p>
                    <EnterpriseBadge variant="info">{selectedRule.scope}</EnterpriseBadge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest">Periodicity</p>
                    <p className="text-[12px] font-bold text-[#100841] uppercase">{selectedRule.period.replace("PER_", "")}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest">Threshold Value</p>
                    <p className="text-[14px] font-mono font-bold text-[#e65100]">{selectedRule.limitType === "AMOUNT" ? formatMMK(selectedRule.value) : `${selectedRule.value} ${selectedRule.currency}`}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest">Target Entity</p>
                    <p className="text-[12px] font-bold text-[#100841]">{selectedRule.targetName}</p>
                  </div>
               </div>

               <div className="mt-8 p-4 bg-white border border-[#dfdfdf] rounded-[2px]">
                  <p className="text-[10px] font-bold text-[#4f525d] uppercase tracking-widest mb-4">Inheritance Hierarchy</p>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <EnterpriseBadge variant="neutral" className="opacity-50">Global</EnterpriseBadge>
                      <ArrowRight className="w-3 h-3 text-[#dfdfdf]" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <EnterpriseBadge variant="neutral" className={selectedRule.scope === "COMPANY" ? "bg-[#100841] text-white" : "opacity-50"}>Company</EnterpriseBadge>
                      <ArrowRight className="w-3 h-3 text-[#dfdfdf]" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <EnterpriseBadge variant="neutral" className={selectedRule.scope === "GROUP" ? "bg-[#100841] text-white" : "opacity-50"}>Group</EnterpriseBadge>
                      <ArrowRight className="w-3 h-3 text-[#dfdfdf]" />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <EnterpriseBadge variant="neutral" className={selectedRule.scope === "EMPLOYEE" ? "bg-[#100841] text-white" : "opacity-50"}>Employee</EnterpriseBadge>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#4f525d] mt-4 leading-relaxed font-medium">
                    Specific overrides at the <span className="text-[#100841] font-bold">EMPLOYEE</span> level take precedence over 
                    Group, Company, and Global configurations. The effective limit is calculated by selecting the 
                    most specific applicable rule in the chain.
                  </p>
               </div>
            </EnterpriseCard>
          )}
        </TabsContent>

        <TabsContent value="matrix" className="mt-4 outline-none">
          <EnterpriseCard className="border-[#dfdfdf] overflow-hidden">
             <div className="p-4 bg-[#efefff] border-b border-[#dfdfdf]">
                <h3 className="text-[11px] font-bold text-[#100841] uppercase tracking-widest">Configuration Matrix</h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-[#efefff]">
                     <th className="p-3 text-[10px] font-bold text-[#100841] uppercase tracking-wider border-b border-r border-[#dfdfdf]">Scope</th>
                     <th className="p-3 text-[10px] font-bold text-[#100841] uppercase tracking-wider border-b border-[#dfdfdf] text-center">Per TXN</th>
                     <th className="p-3 text-[10px] font-bold text-[#100841] uppercase tracking-wider border-b border-[#dfdfdf] text-center">Per Day</th>
                     <th className="p-3 text-[10px] font-bold text-[#100841] uppercase tracking-wider border-b border-[#dfdfdf] text-center">Per Week</th>
                     <th className="p-3 text-[10px] font-bold text-[#100841] uppercase tracking-wider border-b border-[#dfdfdf] text-center">Per Month</th>
                     <th className="p-3 text-[10px] font-bold text-[#100841] uppercase tracking-wider border-b border-[#dfdfdf] text-center">Per Cycle</th>
                   </tr>
                 </thead>
                 <tbody>
                   <tr className="hover:bg-slate-50 transition-colors">
                     <td className="p-3 border-r border-b border-[#dfdfdf]"><EnterpriseBadge variant="info">GLOBAL</EnterpriseBadge></td>
                     <td className="p-3 text-center border-b border-[#dfdfdf] font-mono text-[11px]">5K - 200K</td>
                     <td className="p-3 text-center border-b border-[#dfdfdf] text-slate-300">—</td>
                     <td className="p-3 text-center border-b border-[#dfdfdf] text-slate-300">—</td>
                     <td className="p-3 text-center border-b border-[#dfdfdf] text-slate-300">—</td>
                     <td className="p-3 text-center border-b border-[#dfdfdf] text-slate-300">—</td>
                   </tr>
                   <tr className="hover:bg-slate-50 transition-colors">
                     <td className="p-3 border-r border-b border-[#dfdfdf]"><EnterpriseBadge variant="warning">COMPANY</EnterpriseBadge></td>
                     <td className="p-3 text-center border-b border-[#dfdfdf] text-slate-300">—</td>
                     <td className="p-3 text-center border-b border-[#dfdfdf] font-mono text-[11px] text-[#e65100]">5M MMK</td>
                     <td className="p-3 text-center border-b border-[#dfdfdf] font-mono text-[11px] text-[#e65100]">25M MMK</td>
                     <td className="p-3 text-center border-b border-[#dfdfdf] font-mono text-[11px] text-[#e65100]">100M MMK</td>
                     <td className="p-3 text-center border-b border-[#dfdfdf] font-mono text-[11px] text-[#e65100]">120M MMK</td>
                   </tr>
                   <tr className="hover:bg-slate-50 transition-colors">
                     <td className="p-3 border-r border-b border-[#dfdfdf]"><EnterpriseBadge variant="warning">GROUP</EnterpriseBadge></td>
                     <td className="p-3 text-center border-b border-[#dfdfdf] text-slate-300">—</td>
                     <td className="p-3 text-center border-b border-[#dfdfdf] font-mono text-[11px] text-[#e65100]">3M MMK</td>
                     <td className="p-3 text-center border-b border-[#dfdfdf] text-slate-300">—</td>
                     <td className="p-3 text-center border-b border-[#dfdfdf] font-mono text-[11px] text-[#e65100]">12M MMK</td>
                     <td className="p-3 text-center border-b border-[#dfdfdf] text-slate-300">—</td>
                   </tr>
                   <tr className="hover:bg-slate-50 transition-colors">
                     <td className="p-3 border-r border-[#dfdfdf]"><EnterpriseBadge variant="success">EMPLOYEE</EnterpriseBadge></td>
                     <td className="p-3 text-center font-mono text-[11px] text-[#e65100]">MAX 200K</td>
                     <td className="p-3 text-center font-mono text-[11px] text-[#e65100]">200K MMK</td>
                     <td className="p-3 text-center text-slate-300">—</td>
                     <td className="p-3 text-center font-mono text-[11px] text-[#e65100]">500K MMK</td>
                     <td className="p-3 text-center font-mono text-[11px] text-[#e65100]">15 TXN</td>
                   </tr>
                 </tbody>
               </table>
             </div>
          </EnterpriseCard>
        </TabsContent>

        <TabsContent value="utilization" className="mt-4 outline-none">
          <EnterpriseTable
            data={[
              { scope: "COMPANY", target: "Tech Solutions Ltd", period: "Per Day", used: 3200000, limit: 5000000 },
              { scope: "COMPANY", target: "Tech Solutions Ltd", period: "Per Week", used: 18000000, limit: 25000000 },
              { scope: "COMPANY", target: "Tech Solutions Ltd", period: "Per Month", used: 65000000, limit: 100000000 },
              { scope: "GROUP", target: "Engineering Staff", period: "Per Day", used: 2100000, limit: 3000000 },
              { scope: "GROUP", target: "Engineering Staff", period: "Per Month", used: 8500000, limit: 12000000 },
              { scope: "EMPLOYEE", target: "Kyaw Kyaw", period: "Per Day", used: 150000, limit: 200000 },
              { scope: "EMPLOYEE", target: "Kyaw Kyaw", period: "Per Month", used: 320000, limit: 500000 },
              { scope: "EMPLOYEE", target: "Kyaw Kyaw", period: "Per Count/Cycle", used: 8, limit: 15 },
            ]}
            columns={[
              { id: "scope", header: "Scope", accessor: (u) => <EnterpriseBadge variant={u.scope === "COMPANY" ? "warning" : u.scope === "GROUP" ? "warning" : "success"}>{u.scope}</EnterpriseBadge> },
              { id: "target", header: "Target", accessor: (u) => <span className="text-[11px] font-bold text-[#100841]">{u.target}</span> },
              { id: "period", header: "Period", accessor: (u) => <span className="text-[10px] uppercase font-bold text-[#4f525d]">{u.period}</span> },
              { id: "used", header: "Used", isNumeric: true, align: "right", accessor: (u) => formatMMK(u.used) },
              { id: "limit", header: "Limit", isNumeric: true, align: "right", accessor: (u) => formatMMK(u.limit) },
              { id: "pct", header: "Usage %", accessor: (u) => {
                const pct = Math.round((u.used / u.limit) * 100);
                return (
                  <div className="flex flex-col items-center gap-1">
                    <span className={cn("text-[11px] font-mono font-bold", pct > 80 ? "text-[#c62828]" : "text-[#2e7d32]")}>{pct}%</span>
                    <div className="w-16 h-1 bg-[#dfdfdf] rounded-full overflow-hidden">
                      <div className={cn("h-full", pct > 80 ? "bg-[#c62828]" : "bg-[#2e7d32]")} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              }},
              { id: "status", header: "Health", accessor: (u) => {
                const pct = (u.used / u.limit) * 100;
                return <EnterpriseBadge variant={pct > 80 ? "error" : "success"}>{pct > 80 ? "CRITICAL" : "NORMAL"}</EnterpriseBadge>;
              }}
            ]}
            rowKey={(u) => `${u.target}-${u.scope}-${u.period}`}
            searchPlaceholder="Filter utilization data..."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

