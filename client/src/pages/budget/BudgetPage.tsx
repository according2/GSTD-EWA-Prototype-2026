/**
 * BudgetPage — Budget Management
 * Design: Enterprise Fintech — SAP Fiori inspired
 * Allocation, utilization tracking, overflow detection, and budget requests
 */
import { formatMMK, companies, type Company } from "@/data/mockData";
import { Wallet, TrendingUp, AlertTriangle, DollarSign, Eye, Edit, Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  EnterpriseKpiCard,
  LedgerDivider,
  EnterpriseTable,
  ColumnDef,
  FilterDef,
  TableAction,
  EnterpriseBadge,
  EnterpriseButton
} from "@/components/EnterpriseComponents";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function BudgetPage() {
  const totalBudget = companies.reduce((s, c) => s + c.totalBudget, 0);
  const totalUtilized = companies.reduce((s, c) => s + c.utilized, 0);
  const totalRemaining = totalBudget - totalUtilized;
  const utilizationPct = Math.round((totalUtilized / totalBudget) * 100);

  // Column definitions for Budget Allocation
  const budgetColumns: ColumnDef<Company>[] = [
    {
      id: "company",
      header: "Company",
      accessor: (c) => (
        <div>
          <p className="text-[12px] font-bold text-[#100841]">{c.name}</p>
          <p className="text-[9px] text-[#4f525d] font-mono">{c.id}</p>
        </div>
      ),
      searchString: (c) => `${c.name} ${c.id}`
    },
    {
      id: "type",
      header: "Type",
      accessor: (c) => <EnterpriseBadge variant="neutral">{c.type}</EnterpriseBadge>
    },
    {
      id: "risk",
      header: "Risk Tier",
      accessor: (c) => {
        const variant = c.riskTier === "A" || c.riskTier === "B" ? "success" : c.riskTier === "C" ? "warning" : "error";
        return <EnterpriseBadge variant={variant}>Tier {c.riskTier}</EnterpriseBadge>;
      }
    },
    {
      id: "totalBudget",
      header: "Total Budget",
      isNumeric: true,
      align: "right",
      accessor: (c) => c.totalBudget
    },
    {
      id: "utilized",
      header: "Utilized",
      isNumeric: true,
      align: "right",
      accessor: (c) => c.utilized
    },
    {
      id: "remaining",
      header: "Remaining",
      isNumeric: true,
      align: "right",
      accessor: (c) => c.remaining,
      cellClassName: (c) => c.remaining > 0 ? "text-[#2e7d32] font-bold" : "text-[#c62828] font-bold"
    },
    {
      id: "utilization",
      header: "Utilization",
      accessor: (c) => {
        const pct = Math.round((c.utilized / c.totalBudget) * 100);
        return (
          <div className="flex items-center gap-2 font-mono">
            <Progress value={pct} className="h-1.5 w-16" />
            <span className={`text-[10px] font-bold tabular-nums ${pct > 80 ? "text-[#c62828]" : pct > 60 ? "text-[#e65100]" : "text-[#2e7d32]"}`}>{pct}%</span>
          </div>
        );
      }
    }
  ];

  // Column definitions for EWA Limits
  const limitColumns: ColumnDef<Company>[] = [
    {
      id: "company",
      header: "Company",
      accessor: (c) => <span className="text-[12px] font-bold text-[#100841]">{c.name}</span>,
      searchString: (c) => c.name
    },
    {
      id: "perEmployeeCap",
      header: "Employee Cap",
      isNumeric: true,
      align: "right",
      accessor: (c) => c.perEmployeeCap
    },
    {
      id: "maxAdvance",
      header: "Max Advance",
      isNumeric: true,
      align: "right",
      accessor: (c) => c.maxAdvance
    },
    {
      id: "creditScore",
      header: "Credit Score",
      isNumeric: true,
      align: "right",
      accessor: (c) => c.creditScore,
      cellClassName: (c) => c.creditScore >= 80 ? "text-[#2e7d32] font-bold" : c.creditScore >= 60 ? "text-[#e65100] font-bold" : "text-[#c62828] font-bold"
    },
    {
      id: "status",
      header: "Status",
      accessor: (c) => <EnterpriseBadge variant={c.status === "Active" ? "success" : "error"}>{c.status}</EnterpriseBadge>
    }
  ];

  const tableActions: TableAction<Company>[] = [
    { label: "View Utilization", icon: <Eye className="w-3.5 h-3.5" />, onClick: (c) => console.log("View", c.id) },
    { label: "Edit Allocation", icon: <Edit className="w-3.5 h-3.5" />, onClick: (c) => console.log("Edit", c.id) },
    { label: "Export Breakdown", icon: <Download className="w-3.5 h-3.5" />, onClick: (c) => console.log("Download", c.id) },
  ];

  return (
    <div className="space-y-4">
      {/* ===== Page Header ===== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[15px] font-bold text-[#100841] uppercase tracking-wide">Budget Management</h1>
          <p className="text-[10px] text-[#4f525d] uppercase tracking-wider mt-0.5">
            Institutional liquidity & exposure monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <EnterpriseButton variant="secondary" className="h-8 py-0 px-3 flex items-center gap-1 text-[10px]">
            <TrendingUp className="w-3.5 h-3.5" /> Rebalance Portfolio
          </EnterpriseButton>
        </div>
      </div>

      <LedgerDivider />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <EnterpriseKpiCard
          label="Total Portfolio Budget"
          value={formatMMK(totalBudget)}
          icon={<DollarSign className="w-3.5 h-3.5 text-[#100841]" />}
          subValue={`${companies.length} companies allocated`}
        />
        <EnterpriseKpiCard
          label="Aggregate Utilization"
          value={formatMMK(totalUtilized)}
          icon={<TrendingUp className="w-3.5 h-3.5 text-[#31d891]" />}
          subValue={`${utilizationPct}% overall utilization`}
        />
        <EnterpriseKpiCard
          label="Available Liquidity"
          value={formatMMK(totalRemaining)}
          icon={<Wallet className="w-3.5 h-3.5 text-[#2e7d32]" />}
          subValue="Ready for new requests"
        />
        <EnterpriseKpiCard
          label="Exposure Warning"
          value={companies.filter(c => c.utilized / c.totalBudget > 0.7).length}
          icon={<AlertTriangle className="w-3.5 h-3.5 text-[#e65100]" />}
          subValue="Above 70% threshold"
        />
      </div>

      <Tabs defaultValue="allocation" className="w-full">
        <TabsList>
          <TabsTrigger value="allocation">Budget Allocation</TabsTrigger>
          <TabsTrigger value="limits">Per-Employee Limits</TabsTrigger>
          <TabsTrigger value="requests">Allocation Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="allocation" className="space-y-4 outline-none">
          <EnterpriseTable
            data={companies}
            columns={budgetColumns}
            rowKey={(c) => c.id}
            actions={tableActions}
            selectable={true}
            searchPlaceholder="Search by company name or ID..."
            summary={{
              label: "PORTFOLIO TOTAL",
              columns: {
                totalBudget: totalBudget,
                utilized: totalUtilized,
                remaining: totalRemaining
              }
            }}
          />
        </TabsContent>

        <TabsContent value="limits" className="space-y-4 outline-none">
          <EnterpriseTable
            data={companies}
            columns={limitColumns}
            rowKey={(c) => c.id}
            searchPlaceholder="Search by company name..."
          />
        </TabsContent>

        <TabsContent value="requests" className="mt-4 outline-none">
          <div className="p-20 text-center bg-slate-50 border border-dashed border-[#dfdfdf] rounded-[3px]">
             <TrendingUp className="w-10 h-10 text-slate-200 mx-auto mb-3" />
             <p className="text-[11px] font-bold text-[#4f525d] uppercase tracking-widest">No pending budget allocation requests</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
