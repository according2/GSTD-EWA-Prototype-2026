/**
 * WriteOffPage — Write-Off & Loss Provision
 * Design: Neobrutalist Fintech — Enterprise write-off management
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
import { AlertTriangle, XCircle, FileText, Plus } from "lucide-react";

const writeOffs = [
  { id: "WO-001", employeeName: "Phyo Min Soe", employeeId: "EMP-0019", companyName: "Skyline Trading", amount: 150000, daysOverdue: 120, reason: "Employee resigned, no payroll deduction possible", status: "Approved", approvedBy: "Finance", date: "2026-06-15" },
  { id: "WO-002", employeeName: "Aung Thu", employeeId: "EMP-0023", companyName: "TechBridge Solutions", amount: 85000, daysOverdue: 90, reason: "Company dispute, employee terminated", status: "Pending", approvedBy: "—", date: "2026-07-01" },
  { id: "WO-003", employeeName: "Mya Mya Aye", employeeId: "EMP-0011", companyName: "Myanmar Tech Solutions", amount: 200000, daysOverdue: 150, reason: "Fraudulent transaction detected", status: "Under Review", approvedBy: "—", date: "2026-07-05" },
];

export function WriteOffPage() {
  const columns: ColumnDef<any>[] = [
    {
      id: "id",
      header: "ID",
      accessor: (wo) => <span className="font-mono font-bold text-[#100841]">{wo.id}</span>,
      searchString: (wo) => wo.id
    },
    {
      id: "employee",
      header: "Employee",
      accessor: (wo) => (
        <div>
          <p className="text-[12px] font-bold text-[#100841]">{wo.employeeName}</p>
          <p className="text-[9px] text-[#4f525d] font-mono">{wo.employeeId}</p>
        </div>
      ),
      searchString: (wo) => `${wo.employeeName} ${wo.employeeId}`
    },
    {
      id: "company",
      header: "Company",
      accessor: (wo) => <span className="text-[11px] text-[#4f525d] font-medium">{wo.companyName}</span>,
      searchString: (wo) => wo.companyName
    },
    {
      id: "amount",
      header: "Amount",
      isNumeric: true,
      align: "right",
      accessor: (wo) => wo.amount,
      cellClassName: () => "text-[#c62828] font-bold"
    },
    {
      id: "daysOverdue",
      header: "Overdue",
      isNumeric: true,
      align: "right",
      accessor: (wo) => wo.daysOverdue + " Days",
      cellClassName: () => "text-[#e65100] font-bold"
    },
    {
      id: "reason",
      header: "Reason",
      accessor: (wo) => <span className="text-[11px] text-[#4f525d] max-w-[200px] truncate block">{wo.reason}</span>
    },
    {
      id: "status",
      header: "Status",
      accessor: (wo) => {
        const variant = wo.status === "Approved" ? "error" : wo.status === "Pending" ? "warning" : "info";
        return <EnterpriseBadge variant={variant}>{wo.status}</EnterpriseBadge>;
      }
    },
    {
      id: "date",
      header: "Date",
      accessor: (wo) => <span className="text-[10px] font-mono text-[#868c95]">{wo.date}</span>
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <XCircle className="w-4 h-4 text-[#c62828]" />
          <div>
            <h1 className="text-[15px] font-bold text-[#100841] uppercase tracking-wide">Write-Off & Loss Provision</h1>
            <p className="text-[10px] text-[#4f525d] uppercase tracking-wider mt-0.5">Uncollectible EWA management</p>
          </div>
        </div>
        <EnterpriseButton variant="primary" className="h-8 py-0 px-3 flex items-center gap-1 text-[10px] bg-[#c62828] hover:bg-[#b71c1c] text-white">
          <Plus className="w-3.5 h-3.5" /> Initiate Write-Off
        </EnterpriseButton>
      </div>

      <LedgerDivider />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <EnterpriseKpiCard
          label="Total Written Off"
          value={formatMMK(writeOffs.reduce((s, w) => s + w.amount, 0))}
          accentColor="error"
          icon={<XCircle className="w-3.5 h-3.5 text-[#c62828]" />}
        />
        <EnterpriseKpiCard
          label="Pending Approval"
          value={writeOffs.filter(w => w.status === "Pending").length}
          accentColor="amber"
          icon={<AlertTriangle className="w-3.5 h-3.5 text-[#e65100]" />}
        />
        <EnterpriseKpiCard
          label="Under Review"
          value={writeOffs.filter(w => w.status === "Under Review").length}
          accentColor="info"
          icon={<FileText className="w-3.5 h-3.5 text-[#0d47a1]" />}
        />
      </div>

      <EnterpriseTable
        data={writeOffs}
        columns={columns}
        rowKey={(wo) => wo.id}
        searchPlaceholder="Search write-off cases..."
      />
    </div>
  );
}

