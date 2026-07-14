/**
 * ErrorsPage — Error Monitoring & Resolution
 * Design: Neobrutalist Fintech — Transaction error tracking and resolution
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
import { formatMMK } from "@/data/mockData";
import { XCircle, AlertTriangle, CheckCircle2, RefreshCw, Eye, RotateCcw } from "lucide-react";

const errors = [
  { id: "ERR-001", type: "Disbursement Failed", employeeName: "Aung Tun", employeeId: "EMP-0008", companyName: "TechBridge Solutions", amount: 120000, date: "2026-07-10", reason: "Insufficient funds in payout bank account", status: "Resolved", retryCount: 2 },
  { id: "ERR-002", type: "KYC Mismatch", employeeName: "Khin Sandar", employeeId: "EMP-0020", companyName: "Diamond Trading", amount: 0, date: "2026-07-08", reason: "National ID doesn't match payroll record", status: "Pending", retryCount: 0 },
  { id: "ERR-003", type: "Settlement Error", employeeName: "—", employeeId: "—", companyName: "Golden Harvest Foods", amount: 850000, date: "2026-07-05", reason: "Bank reconciliation mismatch — 5,000 MMK difference", status: "In Progress", retryCount: 1 },
  { id: "ERR-004", type: "Duplicate Request", employeeName: "Thet Mon", employeeId: "EMP-0015", companyName: "Myanmar Tech Solutions", amount: 75000, date: "2026-07-03", reason: "Duplicate EWA request detected within 24h window", status: "Resolved", retryCount: 0 },
  { id: "ERR-005", type: "Fee Calculation Error", employeeName: "Win Htut", employeeId: "EMP-0012", companyName: "Skyline Trading", amount: 95000, date: "2026-07-01", reason: "Late fee not applied after grace period expiry", status: "Resolved", retryCount: 1 },
];

export function ErrorsPage() {
  const columns: ColumnDef<any>[] = [
    {
      id: "id",
      header: "Error ID",
      accessor: (e) => <span className="font-mono font-bold text-[#100841]">{e.id}</span>,
      searchString: (e) => e.id
    },
    {
      id: "type",
      header: "Type",
      accessor: (e) => <EnterpriseBadge variant="error" className="bg-[#fce4ec] text-[#b71c1c] border-[#ef9a9a]">{e.type}</EnterpriseBadge>,
      searchString: (e) => e.type
    },
    {
      id: "employee",
      header: "Employee",
      accessor: (e) => (
        <div>
          <p className="text-[12px] font-bold text-[#100841]">{e.employeeName}</p>
          <p className="text-[9px] text-[#4f525d] font-mono">{e.employeeId}</p>
        </div>
      ),
      searchString: (e) => `${e.employeeName} ${e.employeeId}`
    },
    {
      id: "company",
      header: "Company",
      accessor: (e) => <span className="text-[11px] text-[#4f525d] font-medium">{e.companyName}</span>,
      searchString: (e) => e.companyName
    },
    {
      id: "amount",
      header: "Amount",
      isNumeric: true,
      align: "right",
      accessor: (e) => e.amount,
      cellClassName: (e) => e.amount > 0 ? "text-[#c62828] font-bold" : "text-slate-300"
    },
    {
      id: "reason",
      header: "Reason",
      accessor: (e) => <span className="text-[11px] text-[#4f525d] max-w-[200px] truncate block">{e.reason}</span>
    },
    {
      id: "status",
      header: "Status",
      accessor: (e) => {
        const variant = e.status === "Resolved" ? "success" : e.status === "Pending" ? "warning" : "info";
        const Icon = e.status === "Resolved" ? CheckCircle2 : e.status === "Pending" ? AlertTriangle : RefreshCw;
        return (
          <EnterpriseBadge variant={variant} className="gap-1">
            <Icon className="w-3 h-3" />
            {e.status}
          </EnterpriseBadge>
        );
      }
    },
    {
      id: "retries",
      header: "Retries",
      isNumeric: true,
      align: "center",
      accessor: (e) => e.retryCount
    },
    {
      id: "date",
      header: "Date",
      accessor: (e) => <span className="text-[10px] font-mono text-[#868c95]">{e.date}</span>
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-[#c62828]" />
          <div>
            <h1 className="text-[15px] font-bold text-[#100841] uppercase tracking-wide">Error Monitoring & Resolution</h1>
            <p className="text-[10px] text-[#4f525d] uppercase tracking-wider mt-0.5">Transaction and compliance error tracking</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EnterpriseButton variant="secondary" className="h-8 py-0 px-3 flex items-center gap-1 text-[10px]">
            <RotateCcw className="w-3.5 h-3.5" /> Retry All Failed
          </EnterpriseButton>
        </div>
      </div>

      <LedgerDivider />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <EnterpriseKpiCard
          label="Open Errors"
          value={errors.filter(e => e.status !== "Resolved").length}
          accentColor="error"
          icon={<XCircle className="w-3.5 h-3.5 text-[#c62828]" />}
        />
        <EnterpriseKpiCard
          label="Resolved"
          value={errors.filter(e => e.status === "Resolved").length}
          accentColor="success"
          icon={<CheckCircle2 className="w-3.5 h-3.5 text-[#2e7d32]" />}
        />
        <EnterpriseKpiCard
          label="Pending"
          value={errors.filter(e => e.status === "Pending").length}
          accentColor="amber"
          icon={<AlertTriangle className="w-3.5 h-3.5 text-[#e65100]" />}
        />
        <EnterpriseKpiCard
          label="Total Logged"
          value={errors.length}
          accentColor="info"
          icon={<RefreshCw className="w-3.5 h-3.5 text-[#0d47a1]" />}
        />
      </div>

      <EnterpriseTable
        data={errors}
        columns={columns}
        rowKey={(e) => e.id}
        searchPlaceholder="Search error logs..."
      />
    </div>
  );
}

