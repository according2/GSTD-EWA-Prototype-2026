/**
 * DisbursementPage — Full Disbursement Engine with State Machine
 * States: REQUESTED → VALIDATING → DISBURSING → COMPLETED / FAILED / RETRYING / TIMEOUT
 * Features: Auto-disbursement after EWA verification, cashout channel selection, retry management
 * Design: Enterprise Fintech — Deep Navy (#100841) + Teal (#31d891)
 */
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Zap, Clock, CheckCircle2, XCircle, RotateCcw, AlertTriangle,
  ChevronRight, Building2, Smartphone, CreditCard, Eye, History, BarChart3, Download
} from "lucide-react";
import {
  EnterpriseCard,
  EnterpriseBadge,
  EnterpriseButton,
  LedgerDivider,
  EnterpriseTable,
  ColumnDef,
  FilterDef,
  TableAction,
  EnterpriseKpiCard
} from "@/components/EnterpriseComponents";
import { cn } from "@/lib/utils";

const formatMMK = (amount: number) => {
  return new Intl.NumberFormat("en-US", { minimumFractionDigits: 0 }).format(amount) + " MMK";
};

// ─── DISBURSEMENT STATE MACHINE ──────────────────────────────────────────────

type DisbursementStatus = "REQUESTED" | "VALIDATING" | "DISBURSING" | "COMPLETED" | "FAILED" | "RETRYING" | "TIMEOUT";

const STATUS_FLOW: DisbursementStatus[] = ["REQUESTED", "VALIDATING", "DISBURSING", "COMPLETED"];
const FAIL_FLOW: DisbursementStatus[] = ["REQUESTED", "VALIDATING", "DISBURSING", "FAILED"];
const RETRY_FLOW: DisbursementStatus[] = ["REQUESTED", "VALIDATING", "DISBURSING", "FAILED", "RETRYING", "COMPLETED"];
const TIMEOUT_FLOW: DisbursementStatus[] = ["REQUESTED", "VALIDATING", "TIMEOUT"];

const statusConfig: Record<string, { variant: "success" | "warning" | "error" | "info" | "neutral"; label: string }> = {
  "REQUESTED": { variant: "neutral", label: "Requested" },
  "VALIDATING": { variant: "warning", label: "Validating" },
  "DISBURSING": { variant: "info", label: "Disbursing" },
  "COMPLETED": { variant: "success", label: "Completed" },
  "FAILED": { variant: "error", label: "Failed" },
  "RETRYING": { variant: "warning", label: "Retrying" },
  "TIMEOUT": { variant: "error", label: "Timeout" },
};

// ─── MOCK DATA ───────────────────────────────────────────────────────────────

interface DisbursementRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  companyName: string;
  amount: number;
  cashoutChannel: "BANK_TRANSFER" | "MOBILE_WALLET" | "AGENT_OTC";
  bankName: string;
  status: DisbursementStatus;
  retryCount: number;
  maxRetries: number;
  requestedAt: string;
  validatedAt: string | null;
  disbursedAt: string | null;
  journalRef: string;
  timeoutAt: string | null;
  failureReason: string | null;
  ewaVerified: boolean;
  budgetAvailable: boolean;
}

const disbursementRecords: DisbursementRecord[] = [
  { id: "DISB-001", employeeId: "EMP-001", employeeName: "Aung Kyaw", companyName: "Tech Solutions Ltd", amount: 50000, cashoutChannel: "BANK_TRANSFER", bankName: "KBZ Bank", status: "COMPLETED", retryCount: 0, maxRetries: 3, requestedAt: "2026-07-10 09:15", validatedAt: "2026-07-10 09:16", disbursedAt: "2026-07-10 09:18", journalRef: "JE-2026-1001", timeoutAt: null, failureReason: null, ewaVerified: true, budgetAvailable: true },
  { id: "DISB-002", employeeId: "EMP-003", employeeName: "Thet Hnin", companyName: "Manufacturing Co", amount: 75000, cashoutChannel: "MOBILE_WALLET", bankName: "Wave Money", status: "DISBURSING", retryCount: 0, maxRetries: 3, requestedAt: "2026-07-10 10:30", validatedAt: "2026-07-10 10:31", disbursedAt: null, journalRef: "JE-2026-1002", timeoutAt: null, failureReason: null, ewaVerified: true, budgetAvailable: true },
  { id: "DISB-003", employeeId: "EMP-005", employeeName: "Zaw Win", companyName: "Logistics Myanmar", amount: 30000, cashoutChannel: "AGENT_OTC", bankName: "CB Bank", status: "FAILED", retryCount: 2, maxRetries: 3, requestedAt: "2026-07-09 14:20", validatedAt: "2026-07-09 14:21", disbursedAt: null, journalRef: "JE-2026-1003", timeoutAt: null, failureReason: "Bank gateway timeout", ewaVerified: true, budgetAvailable: true },
  { id: "DISB-004", employeeId: "EMP-008", employeeName: "Hla May", companyName: "Retail Chain", amount: 100000, cashoutChannel: "BANK_TRANSFER", bankName: "AYA Bank", status: "RETRYING", retryCount: 3, maxRetries: 5, requestedAt: "2026-07-09 11:00", validatedAt: "2026-07-09 11:02", disbursedAt: null, journalRef: "JE-2026-1004", timeoutAt: null, failureReason: "Insufficient prefund balance", ewaVerified: true, budgetAvailable: false },
  { id: "DISB-005", employeeId: "EMP-012", employeeName: "Myo Lin", companyName: "Tech Solutions Ltd", amount: 25000, cashoutChannel: "MOBILE_WALLET", bankName: "KBZ Pay", status: "TIMEOUT", retryCount: 0, maxRetries: 3, requestedAt: "2026-07-08 16:45", validatedAt: null, disbursedAt: null, journalRef: "JE-2026-1005", timeoutAt: "2026-07-08 17:15", failureReason: "Validation timeout — payroll data sync failed", ewaVerified: false, budgetAvailable: true },
  { id: "DISB-006", employeeId: "EMP-002", employeeName: "Nyein Chan", companyName: "Manufacturing Co", amount: 60000, cashoutChannel: "BANK_TRANSFER", bankName: "KBZ Bank", status: "VALIDATING", retryCount: 0, maxRetries: 3, requestedAt: "2026-07-10 11:00", validatedAt: null, disbursedAt: null, journalRef: "JE-2026-1006", timeoutAt: null, failureReason: null, ewaVerified: true, budgetAvailable: true },
];

// ─── STATE FLOW VISUAL ──────────────────────────────────────────────────────

function StateFlowVisual({ status }: { status: DisbursementStatus }) {
  const flow = status === "TIMEOUT" ? TIMEOUT_FLOW : status === "FAILED" || status === "RETRYING" ? RETRY_FLOW : STATUS_FLOW;
  const currentIndex = flow.indexOf(status);

  return (
    <div className="flex items-center gap-0.5 py-1">
      {flow.map((step, i) => {
        const sc = statusConfig[step];
        const isCompleted = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div key={step} className="flex items-center">
            <div 
              className={cn(
                "px-2 py-0.5 rounded-[2px] text-[8px] font-bold uppercase border transition-all",
                isCompleted 
                  ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                  : isCurrent 
                    ? "bg-[#100841] text-white border-[#100841]" 
                    : "bg-slate-50 border-slate-200 text-slate-400"
              )}
            >
              {sc.label}
            </div>
            {i < flow.length - 1 && (
              <ChevronRight className={cn("w-3 h-3 mx-0.5", isCompleted ? "text-emerald-400" : "text-slate-200")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export function DisbursementPage() {
  const [selectedRecord, setSelectedRecord] = useState<DisbursementRecord | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(new Set());

  const stats = {
    total: disbursementRecords.length,
    completed: disbursementRecords.filter(r => r.status === "COMPLETED").length,
    disbursing: disbursementRecords.filter(r => r.status === "DISBURSING").length,
    failed: disbursementRecords.filter(r => r.status === "FAILED").length,
    retrying: disbursementRecords.filter(r => r.status === "RETRYING").length,
    timeout: disbursementRecords.filter(r => r.status === "TIMEOUT").length,
    validating: disbursementRecords.filter(r => r.status === "VALIDATING").length,
  };

  const columns: ColumnDef<DisbursementRecord>[] = [
    {
      id: "id",
      header: "ID",
      accessor: (r) => <span className="font-mono font-bold text-[#100841]">{r.id}</span>,
      searchString: (r) => r.id
    },
    {
      id: "employee",
      header: "Employee",
      accessor: (r) => (
        <div>
          <p className="text-[12px] font-bold text-[#100841]">{r.employeeName}</p>
          <p className="text-[9px] text-[#4f525d] font-mono">{r.companyName}</p>
        </div>
      ),
      searchString: (r) => `${r.employeeName} ${r.companyName}`
    },
    {
      id: "amount",
      header: "Amount",
      isNumeric: true,
      align: "right",
      accessor: (r) => r.amount
    },
    {
      id: "channel",
      header: "Channel",
      accessor: (r) => (
        <span className="flex items-center gap-1.5 text-[10px] font-semibold text-[#4f525d]">
          {r.cashoutChannel === "BANK_TRANSFER" && <Building2 className="w-3 h-3 text-[#100841]" />}
          {r.cashoutChannel === "MOBILE_WALLET" && <Smartphone className="w-3 h-3 text-[#31d891]" />}
          {r.cashoutChannel === "AGENT_OTC" && <CreditCard className="w-3 h-3 text-amber-500" />}
          {r.cashoutChannel.replace("_", " ")}
        </span>
      )
    },
    {
      id: "bank",
      header: "Bank",
      accessor: (r) => <span className="text-[10px] text-[#4f525d] font-medium">{r.bankName}</span>
    },
    {
      id: "verification",
      header: "EWA/Budget",
      accessor: (r) => (
        <div className="flex items-center gap-1">
          <EnterpriseBadge variant={r.ewaVerified ? "success" : "error"} className="px-1 py-0 text-[8px]">
            EWA
          </EnterpriseBadge>
          <EnterpriseBadge variant={r.budgetAvailable ? "info" : "error"} className="px-1 py-0 text-[8px]">
            BGT
          </EnterpriseBadge>
        </div>
      )
    },
    {
      id: "retry",
      header: "Retry",
      accessor: (r) => <span className="text-[10px] font-mono text-slate-400 font-bold">{r.retryCount}/{r.maxRetries}</span>
    },
    {
      id: "status",
      header: "Status",
      accessor: (r) => (
        <EnterpriseBadge variant={statusConfig[r.status].variant}>
          {statusConfig[r.status].label}
        </EnterpriseBadge>
      )
    },
    {
      id: "flow",
      header: "Flow Progress",
      accessor: (r) => <StateFlowVisual status={r.status} />
    },
    {
      id: "requested",
      header: "Requested",
      accessor: (r) => <span className="text-[10px] text-slate-400 font-mono">{r.requestedAt}</span>
    }
  ];

  const tableFilters: FilterDef<DisbursementRecord>[] = [
    {
      id: "status",
      label: "Status",
      options: Object.entries(statusConfig).map(([k, v]) => ({ label: v.label, value: k })),
      filterFn: (r, val) => r.status === val
    },
    {
      id: "channel",
      label: "Channel",
      options: [
        { label: "Bank Transfer", value: "BANK_TRANSFER" },
        { label: "Mobile Wallet", value: "MOBILE_WALLET" },
        { label: "Agent OTC", value: "AGENT_OTC" }
      ],
      filterFn: (r, val) => r.cashoutChannel === val
    }
  ];

  const tableActions: TableAction<DisbursementRecord>[] = [
    {
      label: "View Detail",
      icon: <Eye className="w-3.5 h-3.5" />,
      onClick: (r) => setSelectedRecord(r)
    },
    {
      label: "Retry Disbursement",
      icon: <RotateCcw className="w-3.5 h-3.5" />,
      onClick: (r) => console.log("Retry", r.id)
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#31d891]" />
          <div>
            <h1 className="text-[15px] font-bold text-[#100841] uppercase tracking-wide">Disbursement Engine</h1>
            <p className="text-[10px] text-[#4f525d] uppercase tracking-wider mt-0.5">
              Auto-payout after validation · Real-time status tracking
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EnterpriseButton variant="secondary" className="h-8 py-0 px-3 flex items-center gap-1 text-[10px]">
            <Download className="w-3.5 h-3.5" /> Reports
          </EnterpriseButton>
        </div>
      </div>

      <LedgerDivider />

      {/* KPI Cards */}
      <div className="grid grid-cols-7 gap-2">
        <EnterpriseKpiCard label="Total Requests" value={stats.total} icon={<Zap className="w-3 h-3 text-slate-400" />} />
        <EnterpriseKpiCard label="Completed" value={stats.completed} icon={<CheckCircle2 className="w-3 h-3 text-emerald-500" />} />
        <EnterpriseKpiCard label="Disbursing" value={stats.disbursing} icon={<RotateCcw className="w-3 h-3 text-blue-500 animate-spin-slow" />} />
        <EnterpriseKpiCard label="Validating" value={stats.validating} icon={<Clock className="w-3 h-3 text-amber-500" />} />
        <EnterpriseKpiCard label="Failed" value={stats.failed} icon={<XCircle className="w-3 h-3 text-red-500" />} />
        <EnterpriseKpiCard label="Retrying" value={stats.retrying} icon={<RotateCcw className="w-3 h-3 text-purple-500" />} />
        <EnterpriseKpiCard label="Timeout" value={stats.timeout} icon={<AlertTriangle className="w-3 h-3 text-orange-500" />} />
      </div>

      <Tabs defaultValue="queue" className="w-full">
        <TabsList className="mb-3">
          <TabsTrigger value="queue">Disbursement Queue</TabsTrigger>
          <TabsTrigger value="detail">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="history">Historical Logs</TabsTrigger>
          <TabsTrigger value="analytics">Engine Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4 outline-none">
          <EnterpriseTable
            data={disbursementRecords}
            columns={columns}
            rowKey={(r) => r.id}
            filters={tableFilters}
            actions={tableActions}
            selectable={true}
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
            searchPlaceholder="Search by ID, name or company..."
          />
        </TabsContent>

        <TabsContent value="detail" className="mt-4 outline-none">
          {selectedRecord ? (
            <div className="space-y-4">
              <EnterpriseCard className="p-4 shadow-sm border-t-2 border-t-[#100841]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[3px] bg-[#ffffff] flex items-center justify-center border border-[#dfdfdf]">
                      <Zap className="w-5 h-5 text-[#100841]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#100841]">{selectedRecord.id} — {selectedRecord.employeeName}</h3>
                      <p className="text-[10px] text-[#4f525d] font-mono">{selectedRecord.companyName}</p>
                    </div>
                  </div>
                  <EnterpriseBadge variant={statusConfig[selectedRecord.status].variant}>
                    {statusConfig[selectedRecord.status].label}
                  </EnterpriseBadge>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="p-3 bg-[#efefff] border border-[#dfdfdf] rounded-[2px]">
                    <p className="text-[8px] text-[#4f525d] uppercase tracking-widest font-bold mb-1">Requested Amount</p>
                    <p className="text-base font-bold font-mono text-[#100841]">{formatMMK(selectedRecord.amount)}</p>
                  </div>
                  <div className="p-3 bg-[#efefff] border border-[#dfdfdf] rounded-[2px]">
                    <p className="text-[8px] text-[#4f525d] uppercase tracking-widest font-bold mb-1">Cashout Channel</p>
                    <p className="text-xs font-bold text-[#100841]">{selectedRecord.cashoutChannel.replace("_", " ")}</p>
                  </div>
                  <div className="p-3 bg-[#efefff] border border-[#dfdfdf] rounded-[2px]">
                    <p className="text-[8px] text-[#4f525d] uppercase tracking-widest font-bold mb-1">Target Account</p>
                    <p className="text-xs font-bold text-[#100841]">{selectedRecord.bankName}</p>
                  </div>
                  <div className="p-3 bg-[#efefff] border border-[#dfdfdf] rounded-[2px]">
                    <p className="text-[8px] text-[#4f525d] uppercase tracking-widest font-bold mb-1">Ledger Reference</p>
                    <p className="text-xs font-mono font-bold text-slate-400">{selectedRecord.journalRef}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest mb-3">State Flow Progression</p>
                  <div className="p-4 bg-white border border-[#dfdfdf] rounded-[3px] flex items-center justify-center">
                    <StateFlowVisual status={selectedRecord.status} />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <TimelineEntry label="Requested At" value={selectedRecord.requestedAt} status="done" />
                  <TimelineEntry label="Validated At" value={selectedRecord.validatedAt || "Pending"} status={selectedRecord.validatedAt ? "done" : "current"} />
                  <TimelineEntry label="Disbursed At" value={selectedRecord.disbursedAt || "Pending"} status={selectedRecord.disbursedAt ? "done" : "pending"} />
                  <TimelineEntry label="Error Reason" value={selectedRecord.failureReason || "No Errors"} status={selectedRecord.failureReason ? "error" : "pending"} />
                </div>
              </EnterpriseCard>
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 border border-dashed border-[#dfdfdf] rounded-[3px]">
              <Zap className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-[11px] font-bold text-[#4f525d] uppercase tracking-widest">Select a disbursement from the queue to view analysis</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TimelineEntry({ label, value, status }: { label: string; value: string; status: "done" | "current" | "pending" | "error" }) {
  const colors = { 
    done: "text-emerald-600", 
    current: "text-amber-600", 
    pending: "text-slate-300", 
    error: "text-red-600" 
  };
  return (
    <div className="space-y-1">
      <p className="text-[8px] text-[#4f525d] uppercase tracking-widest font-bold">{label}</p>
      <div className={cn("text-[11px] font-mono font-bold", colors[status])}>{value}</div>
    </div>
  );
}
