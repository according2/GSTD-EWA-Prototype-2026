/**
 * EmployeesPage — Employee Management (SAP Fiori List Report)
 * SAP Fiori Pattern: List Report with toolbar filters + data table
 * Enterprise table with structured columns, semantic status colors
 */
import { useState } from "react";
import { formatMMK, employees, type Employee } from "@/data/mockData";
import { EmployeeDetailSheet } from "@/components/EmployeeDetailSheet";
import { 
  Download, Plus, ShieldCheck, Clock, UserCheck, Users, 
  Eye, ShieldX, Lock
} from "lucide-react";
import { useView } from "@/contexts/ViewContext";
import {
  EnterpriseCard,
  EnterpriseBadge,
  EnterpriseButton,
  LedgerDivider,
  EnterpriseTable,
  ColumnDef,
  FilterDef,
  TableAction
} from "@/components/EnterpriseComponents";
import { cn } from "@/lib/utils";

/* ===== Fiori Semantic Badge ===== */
function FioriStatusBadge({ status }: { status: Employee["status"] }) {
  const variantMap: Record<Employee["status"], "success" | "warning" | "error" | "info" | "neutral"> = {
    "Active": "success",
    "Pending Verification": "warning",
    "Frozen": "error",
    "KYC Pending": "info",
    "Inactive": "neutral",
  };
  return <EnterpriseBadge variant={variantMap[status] || "neutral"}>{status}</EnterpriseBadge>;
}

function VerificationBadge({ emp }: { emp: Employee }) {
  let key: "trusted" | "verified-no-auto" | "rejected" | "pending" = "pending";
  if (emp.verification.employment === "Verified" && emp.verification.ewaAutoApproved) key = "trusted";
  else if (emp.verification.employment === "Verified" && !emp.verification.ewaAutoApproved) key = "verified-no-auto";
  else if (emp.verification.employment === "Rejected") key = "rejected";

  const config = {
    "trusted": { icon: ShieldCheck, label: "Trusted", variant: "success" as const },
    "verified-no-auto": { icon: Clock, label: "Verified / No Auto", variant: "warning" as const },
    "rejected": { icon: ShieldX, label: "Rejected", variant: "error" as const },
    "pending": { icon: Clock, label: "Pending", variant: "info" as const },
  };

  const cfg = config[key];
  const Icon = cfg.icon;
  return (
    <EnterpriseBadge variant={cfg.variant} className="gap-1 font-semibold">
      <Icon className="w-3 h-3" />
      {cfg.label}
    </EnterpriseBadge>
  );
}

export function EmployeesPage() {
  const { view } = useView();
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(new Set());

  const uniqueCompanies = Array.from(new Set(employees.map(e => e.companyName)));

  // Define table columns
  const columns: ColumnDef<Employee>[] = [
    {
      id: "employee",
      header: "Employee",
      accessor: (emp) => (
        <div>
          <p className="text-[12px] font-bold text-[#100841]">{emp.name}</p>
          <p className="text-[9px] text-[#4f525d] font-mono">{emp.employeeId}</p>
        </div>
      ),
      searchString: (emp) => `${emp.name} ${emp.employeeId}`
    },
    {
      id: "companyName",
      header: "Company",
      accessor: (emp) => <span className="text-[11px] text-[#4f525d] font-medium">{emp.companyName}</span>,
      searchString: (emp) => emp.companyName
    },
    {
      id: "branch",
      header: "Branch",
      accessor: (emp) => <span className="text-[11px] text-[#4f525d]">{emp.branch}</span>
    },
    {
      id: "salary",
      header: "Salary",
      isNumeric: true,
      align: "right",
      accessor: (emp) => emp.salary
    },
    {
      id: "ewaCap",
      header: "EWA Cap",
      isNumeric: true,
      align: "right",
      accessor: (emp) => emp.ewaCap
    },
    {
      id: "ewaAvailable",
      header: "Available",
      isNumeric: true,
      align: "right",
      accessor: (emp) => emp.ewaAvailable
    },
    {
      id: "outstanding",
      header: "Outstanding",
      isNumeric: true,
      align: "right",
      accessor: (emp) => emp.outstanding
    },
    {
      id: "verification",
      header: "Verification",
      accessor: (emp) => <VerificationBadge emp={emp} />
    },
    {
      id: "status",
      header: "Status",
      accessor: (emp) => <FioriStatusBadge status={emp.status} />
    },
    {
      id: "kyc",
      header: "KYC",
      accessor: (emp) => (
        <div className="flex items-center gap-1 font-mono">
          <UserCheck className={cn("w-3.5 h-3.5", emp.kycLevel === 2 ? "text-[#2e7d32]" : emp.kycLevel === 1 ? "text-[#e65100]" : "text-[#4f525d]")} />
          <span className="text-[10px] text-[#4f525d] font-bold">L{emp.kycLevel}</span>
        </div>
      )
    }
  ];

  // Define table filters
  const tableFilters: FilterDef<Employee>[] = [
    {
      id: "status",
      label: "Status",
      options: [
        { label: "Active", value: "Active" },
        { label: "Pending Verification", value: "Pending Verification" },
        { label: "Frozen", value: "Frozen" },
        { label: "KYC Pending", value: "KYC Pending" },
        { label: "Inactive", value: "Inactive" }
      ],
      filterFn: (emp, val) => emp.status === val
    },
    {
      id: "company",
      label: "Company",
      options: uniqueCompanies.map(c => ({ label: c, value: c })),
      filterFn: (emp, val) => emp.companyName === val
    }
  ];

  // Define table actions
  const tableActions: TableAction<Employee>[] = [
    {
      label: "View Detail",
      icon: <Eye className="w-3.5 h-3.5" />,
      onClick: (emp) => setSelectedEmployee(emp)
    }
  ];

  return (
    <div className="space-y-4">
      {/* ===== SAP Fiori Object Page Header ===== */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#31d891]" />
          <div>
            <h1 className="text-[15px] font-bold text-[#100841] uppercase tracking-wide">Employee Management</h1>
            <p className="text-[10px] text-[#4f525d] uppercase tracking-wider">
              {employees.length} records total
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <EnterpriseButton variant="secondary" className="h-8 py-0 px-3 flex items-center gap-1 text-[10px]">
            <Download className="w-3.5 h-3.5" /> Export
          </EnterpriseButton>
          {(view === "HR" || view === "Operations" || view === "Platform Admin") && (
            <EnterpriseButton variant="primary" className="h-8 py-0 px-3 flex items-center gap-1 text-[10px]">
              <Plus className="w-3.5 h-3.5" /> Add
            </EnterpriseButton>
          )}
        </div>
      </div>

      <LedgerDivider />

      {/* ===== Standard Enterprise Data Table ===== */}
      <EnterpriseTable
        data={employees}
        columns={columns}
        rowKey={(emp) => emp.id}
        filters={tableFilters}
        actions={tableActions}
        selectable={true}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        searchPlaceholder="Search by name or employee ID..."
      />

      <EmployeeDetailSheet employee={selectedEmployee} onClose={() => setSelectedEmployee(null)} />

      {/* ===== Workflow Legend — Fiori Message Strip style ===== */}
      <EnterpriseCard className="p-4 shadow-sm">
        <h3 className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest mb-2">Verification Workflow</h3>
        <div className="flex items-center gap-2 text-sm flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#e3f2fd] border border-[#90caf9] text-[#0d47a1] text-[10px] font-semibold">
            <Clock className="w-3 h-3" /> 1. Employment Verified
          </span>
          <span className="text-[#dfdfdf] font-bold">→</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#fff8e1] border border-[#ffcc80] text-[#e65100] text-[10px] font-semibold">
            <Lock className="w-3 h-3" /> 2. EWA Auto-Approved
          </span>
          <span className="text-[#dfdfdf] font-bold">→</span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-[#e8f5e9] border border-[#a5d6a7] text-[#1b5e20] text-[10px] font-semibold">
            <ShieldCheck className="w-3 h-3" /> 3. Trusted Employee
          </span>
        </div>
        <p className="text-[10px] text-[#4f525d] mt-1.5">Both Employment Verification AND EWA Auto-Approval must pass for instant disbursement eligibility.</p>
      </EnterpriseCard>
    </div>
  );
}
