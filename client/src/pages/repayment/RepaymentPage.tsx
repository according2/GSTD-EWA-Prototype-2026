/**
 * RepaymentPage — Repayment & Settlement Module
 * Design: Consistent enterprise repayment workflow with maker-checker
 * Workflow: DRAFT → SUBMITTED → FINANCE_REVIEW → FINANCE_UPDATED → APPROVED → POSTED
 */
import { useState } from "react";
import { formatMMK, repaymentRequests, settlements, type RepaymentRequest, type Settlement } from "@/data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, FileText, Layers
} from "lucide-react";
import {
  EnterpriseBadge,
  LedgerDivider,
  EnterpriseTable,
  ColumnDef,
  FilterDef,
  TableAction
} from "@/components/EnterpriseComponents";
import { cn } from "@/lib/utils";

function RepaymentStatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, "success" | "warning" | "error" | "info" | "neutral"> = {
    "DRAFT": "neutral",
    "SUBMITTED": "info",
    "FINANCE_REVIEW": "warning",
    "FINANCE_UPDATED": "warning",
    "APPROVED": "success",
    "POSTED": "success",
    "REJECTED": "error",
  };
  return (
    <EnterpriseBadge variant={variantMap[status] || "neutral"}>
      {status.replace("_", " ")}
    </EnterpriseBadge>
  );
}

function WorkflowSteps({ status }: { status: string }) {
  const steps = ["DRAFT", "SUBMITTED", "FINANCE_REVIEW", "FINANCE_UPDATED", "APPROVED", "POSTED"];
  const currentIndex = steps.indexOf(status);
  return (
    <div className="flex items-center gap-1 font-mono">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center gap-0.5">
          <div 
            className={cn(
              "w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold transition-colors",
              i <= currentIndex ? "bg-[#100841] text-white" : "bg-slate-200 text-slate-400"
            )}
            title={step.replace("_", " ")}
          >
            {i + 1}
          </div>
          {i < steps.length - 1 && (
            <div className={cn("w-2.5 h-[1.5px] transition-colors", i < currentIndex ? "bg-[#100841]" : "bg-slate-200")} />
          )}
        </div>
      ))}
    </div>
  );
}

export function RepaymentPage() {
  const [selectedRepaymentId, setSelectedRepaymentId] = useState<string>("REP-2026-07-003");
  const [repaymentSelectedKeys, setRepaymentSelectedKeys] = useState<Set<string | number>>(new Set());
  const [settlementSelectedKeys, setSettlementSelectedKeys] = useState<Set<string | number>>(new Set());

  // Columns for Repayments
  const repaymentColumns: ColumnDef<RepaymentRequest>[] = [
    {
      id: "id",
      header: "ID",
      accessor: (req) => <span className="font-mono font-bold text-[#100841]">{req.id}</span>,
      searchString: (req) => req.id
    },
    {
      id: "companyName",
      header: "Company",
      accessor: (req) => (
        <div>
          <p className="text-[12px] font-bold text-[#100841]">{req.companyName}</p>
          <p className="text-[9px] text-[#4f525d] font-mono">{req.companyId}</p>
        </div>
      ),
      searchString: (req) => `${req.companyName} ${req.companyId}`
    },
    {
      id: "initiator",
      header: "Initiator",
      accessor: (req) => (
        <div>
          <p className="text-[12px] text-[#100841] font-semibold">{req.initiatorName}</p>
          <p className="text-[10px] text-[#4f525d] font-mono">{req.initiator}</p>
        </div>
      ),
      searchString: (req) => req.initiatorName
    },
    {
      id: "period",
      header: "Period",
      accessor: (req) => <span className="font-semibold text-[#4f525d]">{req.period}</span>
    },
    {
      id: "totalAmount",
      header: "Total",
      isNumeric: true,
      align: "right",
      accessor: (req) => req.totalAmount
    },
    {
      id: "principalAmount",
      header: "Principal",
      isNumeric: true,
      align: "right",
      accessor: (req) => req.principalAmount
    },
    {
      id: "lateFeeAmount",
      header: "Late Fee",
      isNumeric: true,
      align: "right",
      accessor: (req) => req.lateFeeAmount
    },
    {
      id: "paymentMethod",
      header: "Payment",
      accessor: (req) => <span className="font-semibold text-[#4f525d]">{req.paymentMethod}</span>
    },
    {
      id: "status",
      header: "Status",
      accessor: (req) => <RepaymentStatusBadge status={req.status} />
    },
    {
      id: "workflow",
      header: "Workflow Status",
      accessor: (req) => <WorkflowSteps status={req.status} />
    }
  ];

  // Filters for Repayments
  const repaymentFilters: FilterDef<RepaymentRequest>[] = [
    {
      id: "status",
      label: "Status",
      options: [
        { label: "Draft", value: "DRAFT" },
        { label: "Submitted", value: "SUBMITTED" },
        { label: "Finance Review", value: "FINANCE_REVIEW" },
        { label: "Finance Updated", value: "FINANCE_UPDATED" },
        { label: "Approved", value: "APPROVED" },
        { label: "Posted", value: "POSTED" },
        { label: "Rejected", value: "REJECTED" }
      ],
      filterFn: (req, val) => req.status === val
    },
    {
      id: "payment",
      label: "Payment Method",
      options: [
        { label: "Bank Transfer", value: "Bank Transfer" },
        { label: "Corporate Wallet", value: "Corporate Wallet" },
        { label: "Direct Debit", value: "Direct Debit" }
      ],
      filterFn: (req, val) => req.paymentMethod === val
    }
  ];

  // Actions for Repayments
  const repaymentActions: TableAction<RepaymentRequest>[] = [
    {
      label: "View Repayment Items",
      icon: <Eye className="w-3.5 h-3.5" />,
      onClick: (req) => setSelectedRepaymentId(req.id)
    }
  ];

  // Columns for Settlements
  const settlementColumns: ColumnDef<Settlement>[] = [
    {
      id: "id",
      header: "ID",
      accessor: (set) => <span className="font-mono font-bold text-[#100841]">{set.id}</span>,
      searchString: (set) => set.id
    },
    {
      id: "companyName",
      header: "Company",
      accessor: (set) => <span className="text-[12px] font-bold text-[#100841]">{set.companyName}</span>,
      searchString: (set) => set.companyName
    },
    {
      id: "submittedBy",
      header: "Submitted By",
      accessor: (set) => <span className="text-[11px] text-[#4f525d] font-semibold">{set.submittedBy}</span>,
      searchString: (set) => set.submittedBy
    },
    {
      id: "totalAmount",
      header: "Amount",
      isNumeric: true,
      align: "right",
      accessor: (set) => set.totalAmount
    },
    {
      id: "paymentMethod",
      header: "Method",
      accessor: (set) => <span className="text-[11px] text-[#4f525d] font-semibold">{set.paymentMethod}</span>
    },
    {
      id: "bankReference",
      header: "Bank Ref",
      accessor: (set) => <span className="text-[10px] font-mono text-slate-400 font-semibold">{set.bankReference}</span>,
      searchString: (set) => set.bankReference
    },
    {
      id: "status",
      header: "Status",
      accessor: (set) => {
        const setVariant = 
          set.status === "CHECKER_APPROVED" ? "success" : 
          set.status === "MAKER_APPROVED" ? "info" : "warning";
        return (
          <EnterpriseBadge variant={setVariant}>
            {set.status.replace("_", " ")}
          </EnterpriseBadge>
        );
      }
    },
    {
      id: "submittedAt",
      header: "Submitted",
      accessor: (set) => <span className="text-[10px] font-mono text-slate-400 font-semibold">{set.submittedAt}</span>
    }
  ];

  // Filters for Settlements
  const settlementFilters: FilterDef<Settlement>[] = [
    {
      id: "status",
      label: "Status",
      options: [
        { label: "Maker Approved", value: "MAKER_APPROVED" },
        { label: "Checker Approved", value: "CHECKER_APPROVED" },
        { label: "Pending", value: "PENDING" }
      ],
      filterFn: (set, val) => set.status === val
    }
  ];

  // Find active items list to show
  const activeRepaymentRequest = repaymentRequests.find(r => r.id === selectedRepaymentId) || repaymentRequests[2];

  // Columns for Breakdown Items
  const breakdownColumns: ColumnDef<any>[] = [
    {
      id: "employee",
      header: "Employee",
      accessor: (item) => (
        <div>
          <p className="text-[12px] font-bold text-[#100841]">{item.employeeName}</p>
          <p className="text-[9px] text-[#4f525d] font-mono">{item.employeeId}</p>
        </div>
      ),
      searchString: (item) => `${item.employeeName} ${item.employeeId}`
    },
    {
      id: "principal",
      header: "Principal",
      isNumeric: true,
      align: "right",
      accessor: (item) => item.principal
    },
    {
      id: "lateFee",
      header: "Late Fee",
      isNumeric: true,
      align: "right",
      accessor: (item) => item.lateFee,
      cellClassName: (item) => item.lateFee > 0 ? "text-[#e65100] font-bold" : "text-slate-300"
    },
    {
      id: "serviceFee",
      header: "Service Fee",
      isNumeric: true,
      align: "right",
      accessor: (item) => item.serviceFee,
      cellClassName: () => "text-slate-400"
    },
    {
      id: "total",
      header: "Total",
      isNumeric: true,
      align: "right",
      accessor: (item) => item.total,
      cellClassName: () => "font-bold text-[#100841]"
    },
    {
      id: "allocationPct",
      header: "Allocation %",
      isNumeric: true,
      align: "right",
      accessor: (item) => item.allocationPct + "%",
      cellClassName: () => "font-bold text-[#4f525d]"
    },
    {
      id: "allocatedAmount",
      header: "Allocated",
      isNumeric: true,
      align: "right",
      accessor: (item) => item.allocatedAmount,
      cellClassName: () => "font-bold text-[#2e7d32]"
    }
  ];

  return (
    <div className="space-y-4">
      {/* ===== Page Header ===== */}
      <div className="flex items-center gap-2">
        <Layers className="w-4 h-4 text-[#31d891]" />
        <div>
          <h1 className="text-[15px] font-bold text-[#100841] uppercase tracking-wide">Repayment & Settlement</h1>
          <p className="text-[10px] text-[#4f525d] uppercase tracking-wider mt-0.5">
            Audit-safe reconciliation for Earned Wage Access distributions
          </p>
        </div>
      </div>

      <LedgerDivider />

      <Tabs defaultValue="repayments" className="w-full">
        <TabsList>
          <TabsTrigger value="repayments">Repayment Requests</TabsTrigger>
          <TabsTrigger value="settlements">Settlements</TabsTrigger>
        </TabsList>

        {/* ===== Tab 1: Repayment Requests ===== */}
        <TabsContent value="repayments" className="space-y-4 outline-none">
          <EnterpriseTable
            data={repaymentRequests}
            columns={repaymentColumns}
            rowKey={(req) => req.id}
            filters={repaymentFilters}
            actions={repaymentActions}
            selectable={true}
            selectedKeys={repaymentSelectedKeys}
            onSelectionChange={setRepaymentSelectedKeys}
            searchPlaceholder="Search by ID or company name..."
          />

          {/* Expanded Items Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <FileText className="w-3.5 h-3.5 text-[#31d891]" />
              <h3 className="text-[11px] font-bold text-[#100841] uppercase tracking-wider">
                Breakdown Items — {activeRepaymentRequest.id} ({activeRepaymentRequest.companyName})
              </h3>
            </div>

            <EnterpriseTable
              data={activeRepaymentRequest.items}
              columns={breakdownColumns}
              rowKey={(item) => item.employeeId}
              searchPlaceholder="Search by employee name or ID..."
              summary={{
                label: "TOTAL REPAYMENT",
                columns: {
                  principal: activeRepaymentRequest.principalAmount,
                  lateFee: activeRepaymentRequest.lateFeeAmount,
                  total: activeRepaymentRequest.totalAmount,
                  allocatedAmount: activeRepaymentRequest.totalAmount
                }
              }}
            />
          </div>
        </TabsContent>

        {/* ===== Tab 2: Settlements ===== */}
        <TabsContent value="settlements" className="space-y-4 outline-none">
          <EnterpriseTable
            data={settlements}
            columns={settlementColumns}
            rowKey={(set) => set.id}
            filters={settlementFilters}
            selectable={true}
            selectedKeys={settlementSelectedKeys}
            onSelectionChange={setSettlementSelectedKeys}
            searchPlaceholder="Search by ID, reference or company..."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
