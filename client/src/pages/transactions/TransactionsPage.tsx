/**
 * TransactionsPage — Transaction Monitor
 * Design: Enterprise Fintech — SAP Fiori List Report pattern
 * Full transaction lifecycle with journal references and audit trail
 */
import { useState } from "react";
import { formatMMK, transactions, type Transaction } from "@/data/mockData";
import { Search, Eye, Filter, Download } from "lucide-react";
import {
  EnterpriseBadge,
  LedgerDivider,
  EnterpriseTable,
  ColumnDef,
  FilterDef,
  TableAction,
  EnterpriseButton
} from "@/components/EnterpriseComponents";

function TxStatusBadge({ status }: { status: Transaction["status"] }) {
  const variantMap: Record<Transaction["status"], "success" | "warning" | "error" | "info" | "neutral"> = {
    "Approved": "success",
    "Disbursing": "info",
    "Repaid": "success",
    "Overdue": "error",
    "Failed": "neutral",
    "Pending": "warning",
  };
  return <EnterpriseBadge variant={variantMap[status] || "neutral"}>{status}</EnterpriseBadge>;
}

export function TransactionsPage() {
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(new Set());

  // Define table columns
  const columns: ColumnDef<Transaction>[] = [
    {
      id: "id",
      header: "TXN ID",
      accessor: (tx) => <span className="font-mono font-bold text-[#100841]">{tx.id}</span>,
      searchString: (tx) => tx.id
    },
    {
      id: "employee",
      header: "Employee",
      accessor: (tx) => (
        <div>
          <p className="text-[12px] font-bold text-[#100841]">{tx.employeeName}</p>
          <p className="text-[9px] text-[#4f525d] font-mono">{tx.employeeId}</p>
        </div>
      ),
      searchString: (tx) => `${tx.employeeName} ${tx.employeeId}`
    },
    {
      id: "company",
      header: "Company",
      accessor: (tx) => <span className="text-[11px] text-[#4f525d] font-medium">{tx.companyName}</span>,
      searchString: (tx) => tx.companyName
    },
    {
      id: "amount",
      header: "Amount",
      isNumeric: true,
      align: "right",
      accessor: (tx) => tx.amount
    },
    {
      id: "fee",
      header: "Fee",
      isNumeric: true,
      align: "right",
      accessor: (tx) => tx.fee
    },
    {
      id: "net",
      header: "Net Amount",
      isNumeric: true,
      align: "right",
      accessor: (tx) => tx.netAmount
    },
    {
      id: "payout",
      header: "Payout Method",
      accessor: (tx) => <span className="text-[11px] text-[#4f525d] font-medium">{tx.payoutMethod}</span>
    },
    {
      id: "requested",
      header: "Requested",
      accessor: (tx) => <span className="text-[11px] text-[#4f525d] font-mono">{tx.requestDate}</span>
    },
    {
      id: "status",
      header: "Status",
      accessor: (tx) => <TxStatusBadge status={tx.status} />
    },
    {
      id: "journal",
      header: "Journal Ref",
      accessor: (tx) => (
        <span className="text-[10px] font-mono text-slate-400 font-semibold">
          {tx.journalRef !== "—" ? tx.journalRef : "—"}
        </span>
      )
    }
  ];

  // Define table filters
  const tableFilters: FilterDef<Transaction>[] = [
    {
      id: "status",
      label: "Status",
      options: [
        { label: "Approved", value: "Approved" },
        { label: "Disbursing", value: "Disbursing" },
        { label: "Repaid", value: "Repaid" },
        { label: "Overdue", value: "Overdue" },
        { label: "Failed", value: "Failed" },
        { label: "Pending", value: "Pending" }
      ],
      filterFn: (tx, val) => tx.status === val
    },
    {
      id: "payout",
      label: "Payout Method",
      options: [
        { label: "Bank Transfer", value: "Bank Transfer" },
        { label: "Mobile Wallet", value: "Mobile Wallet" },
        { label: "Agent OTC", value: "Agent OTC" }
      ],
      filterFn: (tx, val) => tx.payoutMethod === val
    }
  ];

  // Define table actions
  const tableActions: TableAction<Transaction>[] = [
    {
      label: "View Details",
      icon: <Eye className="w-3.5 h-3.5" />,
      onClick: (tx) => console.log("View", tx.id)
    },
    {
      label: "Download Receipt",
      icon: <Download className="w-3.5 h-3.5" />,
      onClick: (tx) => console.log("Download", tx.id)
    }
  ];

  return (
    <div className="space-y-4">
      {/* ===== Page Header ===== */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[15px] font-bold text-[#100841] uppercase tracking-wide">Transaction Monitor</h1>
          <p className="text-[10px] text-[#4f525d] uppercase tracking-wider mt-0.5">
            Audit-safe tracking for all EWA disbursements
          </p>
        </div>
        <div className="flex items-center gap-2">
           <EnterpriseButton variant="secondary" className="h-8 py-0 px-3 flex items-center gap-1 text-[10px]">
            <Download className="w-3.5 h-3.5" /> Export Data
          </EnterpriseButton>
        </div>
      </div>

      <LedgerDivider />

      <EnterpriseTable
        data={transactions}
        columns={columns}
        rowKey={(tx) => tx.id}
        filters={tableFilters}
        actions={tableActions}
        selectable={true}
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        searchPlaceholder="Search by employee name, ID or TXN ID..."
      />
    </div>
  );
}
