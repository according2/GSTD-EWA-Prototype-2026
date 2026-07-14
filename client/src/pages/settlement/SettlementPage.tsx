/**
 * SettlementPage — Settlement Verification (SAP Fiori)
 * Design: Enterprise Fintech — Maker-Checker Protocol
 */
import { useState } from "react";
import { formatMMK, settlements, repaymentRequests, type Settlement } from "@/data/mockData";
import {
  ShieldCheck, CheckCircle2, Eye, FileCheck, XCircle,
  User, Building2, Landmark, Camera, ChevronRight, Clock,
  ShieldAlert, Hash, Repeat, ArrowRightLeft, Shield, FileText
} from "lucide-react";
import {
  EnterpriseBadge,
  EnterpriseButton,
  LedgerDivider,
  EnterpriseTable,
  ColumnDef,
  TableAction,
  EnterpriseCard
} from "@/components/EnterpriseComponents";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MakerCheckerModal } from "@/components/MakerCheckerModal";

/* ===== Fiori Semantic Status Badge ===== */
function SettlementStatusBadge({ status }: { status: string }) {
  const c: Record<string, "success" | "warning" | "error" | "info" | "neutral"> = {
    "SUBMITTED": "warning",
    "MAKER_APPROVED": "info",
    "CHECKER_APPROVED": "success",
    "POSTED": "success",
    "REJECTED": "error",
  };
  return <EnterpriseBadge variant={c[status] || "neutral"}>{status.replace("_", " ")}</EnterpriseBadge>;
}

/* ===== Compact Workflow Stepper ===== */
function WorkflowStepper({ status }: { status: string }) {
  const steps = ["SUBMITTED", "MAKER_APPROVED", "CHECKER_APPROVED", "POSTED"];
  const labels = ["Submitted", "Maker Verified", "Checker Approved", "Posted"];
  const colors = ["#f59e0b", "#1565c0", "#2e7d32", "#1b5e20"];
  const currentIndex = steps.indexOf(status);
  const actualIndex = currentIndex === -1 ? (status === "REJECTED" ? -1 : steps.length - 1) : currentIndex;

  return (
    <div className="flex items-center gap-1 py-1">
      {status === "REJECTED" ? (
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#fce4ec] border border-[#ef9a9a] rounded-[2px]">
          <XCircle className="w-3 h-3 text-[#c62828]" />
          <span className="text-[8px] font-bold text-[#b71c1c] uppercase tracking-wider">Rejected</span>
        </div>
      ) : (
        <>
          {steps.map((step, i) => {
            const isComplete = i < actualIndex;
            const isCurrent = i === actualIndex;
            return (
              <div key={step} className="flex items-center gap-1">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold border ${
                  isComplete ? "bg-[#2e7d32] text-white border-[#2e7d32]" :
                  isCurrent ? `bg-white text-[#100841] border-2` :
                  "bg-[#efefff] text-[#c4c9ce] border-[#dfdfdf]"
                }`} style={isCurrent ? { borderColor: colors[i] } : {}}>
                  {isComplete ? <CheckCircle2 className="w-2.5 h-2.5" /> : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <ChevronRight className={`w-2.5 h-2.5 ${i < actualIndex ? "text-[#2e7d32]" : "text-[#dfdfdf]"}`} />
                )}
              </div>
            );
          })}
          <span className="text-[8px] text-[#4f525d] font-medium ml-1">{labels[actualIndex >= 0 ? actualIndex : 0]}</span>
        </>
      )}
    </div>
  );
}

/* ===== Maker/Checker Identity Card ===== */
function IdentityCard({ role, name, verifiedAt }: { role: "Maker" | "Checker"; name: string; verifiedAt?: string }) {
  const isMaker = role === "Maker";
  return (
    <div className={`bg-white border rounded-[3px] p-3 ${isMaker ? "border-[#90caf9]" : "border-[#a5d6a7]"}`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isMaker ? "bg-[#e3f2fd]" : "bg-[#e8f5e9]"}`}>
          {isMaker ? <User className="w-3.5 h-3.5 text-[#1565c0]" /> : <ShieldCheck className="w-3.5 h-3.5 text-[#2e7d32]" />}
        </div>
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: isMaker ? "#1565c0" : "#2e7d32" }}>{role}</p>
          <p className="text-[11px] font-semibold text-[#100841]">{name}</p>
        </div>
      </div>
      {verifiedAt ? (
        <div className="flex items-center gap-1.5 text-[10px] text-[#2e7d32]">
          <CheckCircle2 className="w-3 h-3" />
          <span className="font-medium">Verified at {verifiedAt}</span>
        </div>
      ) : (
        <div className="text-[10px] text-[#e65100] font-medium">Awaiting verification</div>
      )}
    </div>
  );
}

/* ===== Settlement Detail Panel ===== */
function SettlementDetail({ set, onModalOpen }: { set: Settlement; onModalOpen: (role: "MAKER" | "CHECKER", mode: "APPROVE" | "REJECT") => void }) {
  const relatedRepayment = repaymentRequests.find(r => r.companyId === set.companyId);

  return (
    <div className="space-y-3">
      {/* Settlement identity */}
      <div className="bg-[#efefff] border border-[#dfdfdf] rounded-[3px] p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-bold text-[#100841] flex items-center gap-2">
            <Hash className="w-4 h-4 text-[#31d891]" />
            Settlement {set.id}
          </h3>
          <SettlementStatusBadge status={set.status} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
          <div className="flex items-center gap-2 text-[11px]">
            <Building2 className="w-3.5 h-3.5 text-[#868c95]" />
            <span className="text-[#868c95]">Company:</span>
            <span className="font-medium text-[#100841]">{set.companyName}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <User className="w-3.5 h-3.5 text-[#868c95]" />
            <span className="text-[#868c95]">Submitted By:</span>
            <span className="font-medium text-[#4f525d]">{set.submittedBy}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <Landmark className="w-3.5 h-3.5 text-[#868c95]" />
            <span className="text-[#868c95]">Bank Reference:</span>
            <span className="font-mono font-bold text-[#100841]">{set.bankReference}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <Repeat className="w-3.5 h-3.5 text-[#868c95]" />
            <span className="text-[#868c95]">Payment Method:</span>
            <span className="font-medium text-[#4f525d]">{set.paymentMethod}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <ArrowRightLeft className="w-3.5 h-3.5 text-[#868c95]" />
            <span className="text-[#868c95]">Amount:</span>
            <span className="font-mono font-bold text-[#2e7d32]">{formatMMK(set.totalAmount)}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-[#868c95]" />
            <span className="text-[#868c95]">Submitted:</span>
            <span className="font-medium text-[#4f525d]">{set.submittedAt}</span>
          </div>
        </div>
      </div>

      {/* Maker-Checker identities */}
      <div className="grid grid-cols-2 gap-3">
        <IdentityCard role="Maker" name="Finance Officer A" verifiedAt={set.makerVerifiedAt} />
        <IdentityCard role="Checker" name="Finance Manager B" verifiedAt={set.checkerApprovedAt} />
      </div>

      {/* Bank reference verification */}
      <div className="bg-white border border-[#dfdfdf] rounded-[3px] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <h3 className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Landmark className="w-3.5 h-3.5" /> Bank Reference Verification
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2.5 bg-[#efefff] rounded-[2px] border border-[#efefff]">
            <div>
              <p className="text-[11px] font-bold text-[#100841] font-mono">{set.bankReference}</p>
              <p className="text-[9px] text-[#868c95] mt-0.5">Transaction Reference Number</p>
            </div>
            <EnterpriseBadge variant="info">Verified</EnterpriseBadge>
          </div>
          <div className="flex items-center justify-between p-2.5 bg-[#efefff] rounded-[2px] border border-[#efefff]">
            <div>
              <p className="text-[11px] font-bold text-[#2e7d32] font-mono">{formatMMK(set.totalAmount)}</p>
              <p className="text-[9px] text-[#868c95] mt-0.5">Amount Match: {set.paymentMethod}</p>
            </div>
            <EnterpriseBadge variant="success">Match Confirmed</EnterpriseBadge>
          </div>
          <div className="flex items-center gap-2 text-[9px] text-[#e65100] p-2 bg-[#fff8e1] rounded-[2px] border border-[#ffcc80]">
            <ShieldAlert className="w-3 h-3" />
            <span>Maker and Checker must be different users. Both must independently verify bank reference and screenshot.</span>
          </div>
        </div>
      </div>

      {/* Screenshot inspection */}
      <div className="bg-white border border-[#dfdfdf] rounded-[3px] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <h3 className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5" /> Screenshot Inspection
        </h3>
        {set.screenshot ? (
          <div className="space-y-2">
            <div className="p-2.5 bg-[#efefff] rounded-[2px] border border-[#efefff]">
              <div className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-[#868c95]" />
                <span className="text-[11px] font-medium text-[#4f525d]">Bank transfer screenshot attached</span>
              </div>
              <p className="text-[9px] text-[#868c95] mt-1">Shows {formatMMK(set.totalAmount)} transferred via {set.paymentMethod} to {set.companyName}</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-[#2e7d32]">
              <CheckCircle2 className="w-3 h-3" />
              <span>Maker confirmed screenshot matches bank reference</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[11px] text-[#b71c1c] p-2.5 bg-[#fce4ec] rounded-[2px] border border-[#ef9a9a]">
            <XCircle className="w-3.5 h-3.5" />
            <span className="font-bold">Screenshot Missing — Cannot proceed with verification</span>
          </div>
        )}
      </div>

      {/* Related repayment items */}
      {relatedRepayment && (
        <div className="bg-white border border-[#dfdfdf] rounded-[3px] shadow-[0_1px_2px_rgba(0,0,0,0.04)] overflow-hidden">
          <h3 className="text-[9px] font-bold text-[#4f525d] uppercase tracking-widest p-3 pb-1.5 flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5" /> Related Repayment Items
          </h3>
          <ScrollArea className="max-h-[250px]">
            <EnterpriseTable
              data={relatedRepayment.items}
              columns={[
                {
                  id: "employee",
                  header: "Employee",
                  accessor: (item) => <span className="text-[11px] font-medium text-[#100841]">{item.employeeName}</span>,
                  searchString: (item) => item.employeeName
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
                  cellClassName: () => "text-[#e65100]"
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
                  id: "allocation",
                  header: "Alloc %",
                  isNumeric: true,
                  align: "right",
                  accessor: (item) => item.allocationPct + "%",
                  cellClassName: () => "text-[#868c95]"
                }
              ]}
              rowKey={(item) => item.employeeId}
              summary={{
                label: "Total",
                columns: {
                  principal: relatedRepayment.principalAmount,
                  lateFee: relatedRepayment.lateFeeAmount,
                  total: relatedRepayment.totalAmount,
                }
              }}
            />
          </ScrollArea>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-2 pt-1">
        {set.status === "SUBMITTED" && (
          <>
            <EnterpriseButton className="h-8 text-[10px] font-semibold bg-[#100841] text-white"
              onClick={() => onModalOpen("MAKER", "APPROVE")}>
              <CheckCircle2 className="w-3 h-3 mr-1" /> Verify as Maker
            </EnterpriseButton>
            <EnterpriseButton variant="secondary" className="h-8 text-[10px] font-medium text-[#b71c1c] border-[#ef9a9a]"
              onClick={() => onModalOpen("MAKER", "REJECT")}>
              <XCircle className="w-3 h-3 mr-1" /> Reject
            </EnterpriseButton>
          </>
        )}
        {set.status === "MAKER_APPROVED" && (
          <>
            <EnterpriseButton className="h-8 text-[10px] font-semibold bg-[#2e7d32] text-white"
              onClick={() => onModalOpen("CHECKER", "APPROVE")}>
              <ShieldCheck className="w-3 h-3 mr-1" /> Approve as Checker
            </EnterpriseButton>
            <EnterpriseButton variant="secondary" className="h-8 text-[10px] font-medium text-[#b71c1c] border-[#ef9a9a]"
              onClick={() => onModalOpen("CHECKER", "REJECT")}>
              <XCircle className="w-3 h-3 mr-1" /> Reject
            </EnterpriseButton>
          </>
        )}
        {set.status === "CHECKER_APPROVED" && (
          <div className="flex items-center gap-2 text-[#2e7d32]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Settlement Posted — Ledger Updated</span>
          </div>
        )}
        {set.status === "REJECTED" && (
          <div className="flex items-center gap-2 text-[#b71c1c]">
            <XCircle className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Settlement Rejected</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== MAIN PAGE ===== */
export function SettlementPage() {
  const [selectedSettlement, setSelectedSettlement] = useState<Settlement | null>(null);
  const [modalState, setModalState] = useState<{
    settlement: Settlement;
    role: "MAKER" | "CHECKER";
    mode: "APPROVE" | "REJECT";
  } | null>(null);

  const handleModalSubmit = () => setModalState(null);

  const columns: ColumnDef<Settlement>[] = [
    {
      id: "id",
      header: "ID",
      accessor: (set) => <span className="font-mono font-bold text-[#100841]">{set.id}</span>,
      searchString: (set) => set.id
    },
    {
      id: "company",
      header: "Company",
      accessor: (set) => (
        <div>
          <p className="text-[11px] font-bold text-[#100841]">{set.companyName}</p>
          <p className="text-[8px] text-[#868c95] font-mono">{set.companyId}</p>
        </div>
      ),
      searchString: (set) => `${set.companyName} ${set.companyId}`
    },
    {
      id: "submittedBy",
      header: "Submitted By",
      accessor: (set) => <span className="text-[11px] text-[#4f525d] font-medium">{set.submittedBy}</span>,
      searchString: (set) => set.submittedBy
    },
    {
      id: "amount",
      header: "Amount",
      isNumeric: true,
      align: "right",
      accessor: (set) => set.totalAmount
    },
    {
      id: "method",
      header: "Method",
      accessor: (set) => <span className="text-[11px] text-[#4f525d] font-medium">{set.paymentMethod}</span>
    },
    {
      id: "bankRef",
      header: "Bank Ref",
      accessor: (set) => <span className="text-[9px] font-mono text-[#868c95] font-bold">{set.bankReference}</span>,
      searchString: (set) => set.bankReference
    },
    {
      id: "screenshot",
      header: "Evidence",
      accessor: (set) => (
        set.screenshot ? (
          <EnterpriseBadge variant="success">
            <Eye className="w-2.5 h-2.5 mr-0.5" /> Attached
          </EnterpriseBadge>
        ) : (
          <EnterpriseBadge variant="error">Missing</EnterpriseBadge>
        )
      )
    },
    {
      id: "status",
      header: "Status",
      accessor: (set) => <SettlementStatusBadge status={set.status} />
    },
    {
      id: "workflow",
      header: "Workflow",
      accessor: (set) => <WorkflowStepper status={set.status} />
    },
    {
      id: "submittedAt",
      header: "Date",
      accessor: (set) => <span className="text-[9px] text-[#868c95] font-mono">{set.submittedAt}</span>
    }
  ];

  const tableActions: TableAction<Settlement>[] = [
    { label: "Verify Settlement", icon: <Eye className="w-3.5 h-3.5" />, onClick: (set) => setSelectedSettlement(set) },
    { label: "Audit Trail", icon: <FileText className="w-3.5 h-3.5" />, onClick: (set) => console.log("Audit", set.id) },
  ];

  return (
    <div className="space-y-3">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#31d891]" />
          <div>
            <h1 className="text-[15px] font-bold text-[#100841] uppercase tracking-wide">Settlement Verification</h1>
            <p className="text-[10px] text-[#868c95] uppercase tracking-wider">
              Maker-Checker Protocol · {settlements.length} settlements
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="queue" className="w-full">
        <TabsList>
          <TabsTrigger value="queue">Settlement Queue</TabsTrigger>
          <TabsTrigger value="detail">Verification Detail</TabsTrigger>
          <TabsTrigger value="history">Posted History</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="mt-3 outline-none">
          <EnterpriseTable
            data={settlements}
            columns={columns}
            rowKey={(set) => set.id}
            actions={tableActions}
            selectable={true}
            searchPlaceholder="Search by ID, company, or reference..."
          />
        </TabsContent>

        <TabsContent value="detail" className="mt-3 outline-none">
          {selectedSettlement ? (
            <SettlementDetail set={selectedSettlement} onModalOpen={(role, mode) => setModalState({ settlement: selectedSettlement, role, mode })} />
          ) : (
            <div className="text-center py-20 bg-slate-50 border border-dashed border-[#dfdfdf] rounded-[3px]">
              <Shield className="w-10 h-10 text-[#dfdfdf] mx-auto mb-3" />
              <p className="text-[11px] font-bold text-[#868c95] uppercase tracking-widest">Select a settlement from the queue to verify</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-3 outline-none">
          <EnterpriseTable
            data={settlements.filter(s => s.status === "CHECKER_APPROVED" || s.status === "MAKER_APPROVED")}
            columns={columns.filter(c => c.id !== "workflow")}
            rowKey={(set) => set.id}
            searchPlaceholder="Search posted history..."
          />
        </TabsContent>
      </Tabs>

      {/* Maker-Checker Modal */}
      {modalState && (
        <MakerCheckerModal
          settlement={modalState.settlement}
          role={modalState.role}
          mode={modalState.mode}
          onSubmit={handleModalSubmit}
          onClose={() => setModalState(null)}
        />
      )}
    </div>
  );
}
