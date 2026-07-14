/**
 * TransactionTimeline — Chronological disbursement/repayment view
 * Shows each transaction as a timeline entry with journal references
 * Design: Enterprise Fintech — vertical timeline with left-right alternating events
 */
import {
  EnterpriseBadge,
  EnterpriseCard,
  EnterpriseKpiCard
} from "@/components/EnterpriseComponents";
import {
  ArrowUpRight, ArrowDownLeft, RotateCcw, XCircle, Clock,
  FileText, Receipt, ArrowRightLeft
} from "lucide-react";
import type { Transaction } from "@/data/mockData";

function formatMMK(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "MMK", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

const statusConfig: Record<string, { icon: React.ElementType; variant: "success" | "warning" | "error" | "info" | "neutral"; label: string }> = {
  "Repaid": { icon: ArrowDownLeft, variant: "success", label: "Repaid" },
  "Approved": { icon: Clock, variant: "warning", label: "Approved" },
  "Disbursing": { icon: ArrowUpRight, variant: "info", label: "Disbursing" },
  "Overdue": { icon: XCircle, variant: "error", label: "Overdue" },
  "Failed": { icon: XCircle, variant: "error", label: "Failed" },
  "Pending": { icon: Clock, variant: "neutral", label: "Pending" },
};

const actionConfig: Record<string, { icon: React.ElementType; color: string }> = {
  "Repaid": { icon: RotateCcw, color: "border-emerald-400" },
  "Disbursing": { icon: ArrowUpRight, color: "border-blue-400" },
  "Approved": { icon: Receipt, color: "border-amber-400" },
  "Overdue": { icon: XCircle, color: "border-red-400" },
  "Failed": { icon: XCircle, color: "border-red-400" },
  "Pending": { icon: Clock, color: "border-slate-300" },
};

interface TransactionTimelineProps {
  transactions: Transaction[];
}

export function TransactionTimeline({ transactions }: TransactionTimelineProps) {
  const sorted = [...transactions].sort((a, b) =>
    new Date(b.disbursementDate).getTime() - new Date(a.disbursementDate).getTime()
  );

  if (sorted.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-8 h-8 text-slate-200 mx-auto mb-2" />
        <p className="text-xs text-slate-400">No transactions recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-4 gap-3">
        <EnterpriseKpiCard label="Total Disbursed" value={formatMMK(sorted.reduce((s, t) => s + t.netAmount, 0))} accentColor="emerald" />
        <EnterpriseKpiCard label="Total Fees" value={formatMMK(sorted.reduce((s, t) => s + t.fee, 0))} accentColor="amber" />
        <EnterpriseKpiCard label="Gross Amount" value={formatMMK(sorted.reduce((s, t) => s + t.amount, 0))} accentColor="info" />
        <EnterpriseKpiCard label="Transactions" value={String(sorted.length)} accentColor="navy" />
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-[17px] top-2 bottom-2 w-px bg-slate-200" />

        {sorted.map((txn, i) => {
          const sc = statusConfig[txn.status] || statusConfig["Pending"];
          const ac = actionConfig[txn.status] || actionConfig["Pending"];
          const Icon = ac.icon;

          return (
            <div key={txn.id} className="flex items-start gap-4 py-3 relative">
              {/* Timeline dot */}
              <div className={`relative z-10 mt-0.5 shrink-0`}>
                <div className={`w-[12px] h-[12px] rounded-full border-2 border-white ${ac.color} bg-white flex items-center justify-center`}>
                  <Icon className="w-[7px] h-[7px] text-slate-500" />
                </div>
              </div>

              {/* Card */}
              <EnterpriseCard className="flex-1 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[10px] font-mono font-bold text-[#100841]">{txn.id}</span>
                      <EnterpriseBadge variant={sc.variant}>
                        {sc.label}
                      </EnterpriseBadge>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider">Disbursed</p>
                        <p className="font-mono font-bold text-[#100841]">{formatMMK(txn.netAmount)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider">Fee</p>
                        <p className="font-mono text-amber-600">{formatMMK(txn.fee)}</p>
                      </div>
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase tracking-wider">Method</p>
                        <p className="text-slate-600">{txn.payoutMethod}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                      <span>Req: {txn.requestDate}</span>
                      <ArrowRightLeft className="w-3 h-3" />
                      <span>Due: {txn.dueDate}</span>
                    </div>

                    {/* Journal Reference */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <FileText className="w-3 h-3 text-slate-300" />
                      <span className="text-[10px] font-mono text-slate-400">{txn.journalRef}</span>
                    </div>
                  </div>

                  {/* Right side: dates */}
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-slate-400 uppercase tracking-wider">Disbursement</p>
                    <p className="text-[11px] font-medium text-slate-600">{txn.disbursementDate}</p>
                    {txn.repaymentDate && (
                      <>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-1">Repaid</p>
                        <p className="text-[11px] font-medium text-emerald-600">{txn.repaymentDate}</p>
                      </>
                    )}
                  </div>
                </div>
              </EnterpriseCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}
