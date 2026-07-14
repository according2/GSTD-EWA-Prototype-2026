/**
 * EmployeeDetailSheet — Full employee detail with 9 tabbed sections
 * Tabs: Personal | Employment | Payroll | Budget | Policies | Bank | Documents | History | Transactions
 */
import { useState, useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { formatMMK, employees, transactions, type Employee, type Transaction } from "@/data/mockData";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  EnterpriseCard,
  EnterpriseBadge,
  EnterpriseButton,
  EnterpriseTable,
  ColumnDef
} from "@/components/EnterpriseComponents";
import { TransactionTimeline } from "@/components/TransactionTimeline";
import {
  ShieldCheck, ShieldX, Clock, User, Building2, Wallet, FileText, Landmark,
  History, CreditCard, AlertCircle, Eye, Download, UserCheck, Lock,
  Calendar, MapPin, Briefcase, Hash
} from "lucide-react";

interface Props {
  employee: Employee | null;
  onClose: () => void;
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <EnterpriseCard className="p-4 mb-4">
      <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">{title}</h4>
      {children}
    </EnterpriseCard>
  );
}

function FieldRow({ label, value, highlight }: { label: string; value: React.ReactNode; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-xs font-mono font-medium ${highlight ? "text-[#100841]" : "text-slate-700"}`}>{value}</span>
    </div>
  );
}

function VerificationBadge({ emp }: { emp: Employee }) {
  if (emp.verification.trustedEmployee) {
    return <EnterpriseBadge variant="success"><ShieldCheck className="w-3 h-3 mr-1" /> Trusted</EnterpriseBadge>;
  }
  if (emp.verification.employment === "Verified" && !emp.verification.ewaAutoApproved) {
    return <EnterpriseBadge variant="warning"><Clock className="w-3 h-3 mr-1" /> Verified / No Auto</EnterpriseBadge>;
  }
  if (emp.verification.employment === "Rejected") {
    return <EnterpriseBadge variant="error"><ShieldX className="w-3 h-3 mr-1" /> Rejected</EnterpriseBadge>;
  }
  return <EnterpriseBadge variant="info"><Clock className="w-3 h-3 mr-1" /> Pending</EnterpriseBadge>;
}

// ─── TAB COMPONENTS ──────────────────────────────────────────────────────────

function PersonalTab({ emp }: { emp: Employee }) {
  return (
    <div className="space-y-4">
      <SectionCard title="Personal Information">
        <FieldRow label="Employee ID" value={emp.employeeId} highlight />
        <FieldRow label="Full Name" value={emp.name} />
        <FieldRow label="Company" value={emp.companyName} />
        <FieldRow label="Branch" value={emp.branch} />
        <FieldRow label="Join Date" value={emp.joinDate} />
        <FieldRow label="KYC Level" value={
          <span className="flex items-center gap-1">
            <UserCheck className={`w-3 h-3 ${emp.kycLevel === 2 ? "text-emerald-500" : "text-amber-500"}`} />
            Level {emp.kycLevel}
          </span>
        } />
      </SectionCard>
      <SectionCard title="Verification Status">
        <div className="space-y-2">
          <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
            <div className="flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-medium text-slate-600">Employment Verification</span>
            </div>
            <EnterpriseBadge variant={emp.verification.employment === "Verified" ? "success" : "warning"}>
              {emp.verification.employment}
            </EnterpriseBadge>
          </div>
          <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-medium text-slate-600">EWA Auto-Approval</span>
            </div>
            <EnterpriseBadge variant={emp.verification.ewaAutoApproved ? "success" : "warning"}>
              {emp.verification.ewaAutoApproved ? "Approved" : "Not Auto-Approved"}
            </EnterpriseBadge>
          </div>
        </div>
        <div className="mt-3 p-3 rounded bg-[#100841]/5 border border-[#100841]/10">
          <p className="text-[11px] text-[#100841]/80 font-medium">Both Employment Verification AND EWA Auto-Approval must pass for Trusted status and instant disbursement eligibility.</p>
        </div>
      </SectionCard>
    </div>
  );
}

function EmploymentTab({ emp }: { emp: Employee }) {
  return (
    <div className="space-y-4">
      <SectionCard title="Employment Details">
        <FieldRow label="Employee ID" value={emp.employeeId} highlight />
        <FieldRow label="Name" value={emp.name} />
        <FieldRow label="Company" value={
          <span className="flex items-center gap-1">
            <Building2 className="w-3 h-3 text-slate-400" />
            {emp.companyName}
          </span>
        } />
        <FieldRow label="Branch" value={
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400" />
            {emp.branch}
          </span>
        } />
        <FieldRow label="Status" value={(
          <EnterpriseBadge variant={
            emp.status === "Active" ? "success" :
            emp.status === "Frozen" ? "error" :
            "warning"
          }>{emp.status}</EnterpriseBadge>
        )} />
        <FieldRow label="Verification" value={<VerificationBadge emp={emp} />} />
      </SectionCard>
      <SectionCard title="Salary & EWA Parameters">
        <FieldRow label="Base Salary" value={formatMMK(emp.salary)} highlight />
        <FieldRow label="EWA Cap (50%)" value={formatMMK(emp.ewaCap)} />
        <FieldRow label="Current Available" value={
          <span className={emp.ewaAvailable > 0 ? "text-emerald-600" : "text-slate-300"}>{emp.ewaAvailable > 0 ? formatMMK(emp.ewaAvailable) : "—"}</span>
        } />
        <FieldRow label="Outstanding" value={
          <span className={emp.outstanding > 0 ? "text-amber-600" : "text-emerald-500"}>{emp.outstanding > 0 ? formatMMK(emp.outstanding) : "0"}</span>
        } />
      </SectionCard>
    </div>
  );
}

function PayrollTab({ emp }: { emp: Employee }) {
  const empTxns = transactions.filter(t => t.employeeId === emp.id);
  const totalAdvanced = empTxns.reduce((s, t) => s + t.amount, 0);
  const totalFees = empTxns.reduce((s, t) => s + t.fee, 0);

  return (
    <div className="space-y-4">
      <SectionCard title="Payroll Summary">
        <FieldRow label="Base Salary" value={formatMMK(emp.salary)} highlight />
        <FieldRow label="Total Advanced (Cycle)" value={formatMMK(totalAdvanced)} />
        <FieldRow label="Total Fees (Cycle)" value={formatMMK(totalFees)} />
        <FieldRow label="Net Payouts (Cycle)" value={formatMMK(empTxns.reduce((s, t) => s + t.netAmount, 0))} />
        <FieldRow label="EWA Cap" value={formatMMK(emp.ewaCap)} />
        <FieldRow label="Cap Utilization" value={
          <span className="text-amber-600">{(totalAdvanced / emp.ewaCap * 100).toFixed(1)}%</span>
        } />
      </SectionCard>
      <SectionCard title="Transaction Count">
        <div className="flex gap-4">
          <div className="text-center p-3 bg-white rounded border border-slate-200 flex-1">
            <p className="text-lg font-bold text-[#100841] font-mono">{empTxns.length}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Total Requests</p>
          </div>
          <div className="text-center p-3 bg-white rounded border border-slate-200 flex-1">
            <p className="text-lg font-bold text-emerald-600 font-mono">{empTxns.filter(t => t.status === "Repaid").length}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Repaid</p>
          </div>
          <div className="text-center p-3 bg-white rounded border border-slate-200 flex-1">
            <p className="text-lg font-bold text-amber-600 font-mono">{empTxns.filter(t => t.status === "Approved" || t.status === "Disbursing").length}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Active</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function BudgetTab({ emp }: { emp: Employee }) {
  const companyBudget = { total: 15000000, utilized: 8200000, remaining: 6800000 };
  const utilization = (companyBudget.utilized / companyBudget.total * 100);

  return (
    <div className="space-y-4">
      <SectionCard title="Budget Eligibility">
        <FieldRow label="Salary × EWA%" value={`${formatMMK(emp.salary)} × 50%`} />
        <FieldRow label="Calculated EWA Cap" value={formatMMK(emp.ewaCap)} highlight />
        <FieldRow label="Pro-rata Factor" value="1.0 (Full cycle)" />
        <FieldRow label="Budget Check" value={
          <span className="text-emerald-600 font-medium">✓ Sufficient</span>
        } />
      </SectionCard>
      <SectionCard title="Company Budget Overview">
        <div className="space-y-2">
          <FieldRow label="Total Budget" value={formatMMK(companyBudget.total)} />
          <FieldRow label="Utilized" value={<span className="text-amber-600">{formatMMK(companyBudget.utilized)}</span>} />
          <FieldRow label="Remaining" value={<span className="text-emerald-600">{formatMMK(companyBudget.remaining)}</span>} />
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
            <span>Utilization</span>
            <span className="font-bold">{utilization.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#31d891] to-[#100841] rounded-full transition-all" style={{ width: `${utilization}%` }} />
          </div>
        </div>
      </SectionCard>
      <SectionCard title="Cap Generation">
        <FieldRow label="Cycle Limit" value={formatMMK(emp.ewaCap)} />
        <FieldRow label="Daily Available" value={formatMMK(Math.floor(emp.ewaCap / 30))} />
        <FieldRow label="Maximum Withdrawal" value={formatMMK(Math.floor(emp.ewaCap * 0.8))} />
        <FieldRow label="Current Available" value={
          <span className={emp.ewaAvailable > 0 ? "text-emerald-600 font-bold" : "text-slate-300"}>{emp.ewaAvailable > 0 ? formatMMK(emp.ewaAvailable) : "—"}</span>
        } />
      </SectionCard>
    </div>
  );
}

function PoliciesTab({ emp }: { emp: Employee }) {
  return (
    <div className="space-y-4">
      <SectionCard title="Assigned Policies">
        {["Payroll Policy", "EWA Policy", "Withdrawal Policy", "Fee Policy", "Company Rules", "Employee Category Rules"].map((p, i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
            <span className="text-xs font-medium text-slate-700">{p}</span>
            <EnterpriseBadge variant="success" className="text-[10px]">Active</EnterpriseBadge>
          </div>
        ))}
      </SectionCard>
      <SectionCard title="Policy Engine Assignment">
        <p className="text-[11px] text-slate-500 mb-2">Policies assigned based on employee attributes:</p>
        <FieldRow label="Payroll Cycle" value="Monthly (25th)" />
        <FieldRow label="EWA Eligibility" value={emp.verification.trustedEmployee ? "Instant" : "Requires Approval"} />
        <FieldRow label="Max Requests/Day" value="1" />
        <FieldRow label="Max Requests/Month" value="5" />
      </SectionCard>
    </div>
  );
}

function BankTab({ emp }: { emp: Employee }) {
  return (
    <div className="space-y-4">
      <SectionCard title="Bank Account">
        <FieldRow label="Bank Name" value="KBZ Bank" />
        <FieldRow label="Account Number" value="***-***-****-4521" />
        <FieldRow label="Account Type" value="Savings" />
        <FieldRow label="Branch" value="Main Branch, Yangon" />
        <FieldRow label="Status" value={<EnterpriseBadge variant="success" className="text-[10px]">Verified</EnterpriseBadge>} />
      </SectionCard>
      <SectionCard title="Mobile Wallet">
        <FieldRow label="Primary Method" value="KBZ Pay" />
        <FieldRow label="Phone Number" value="+95 9*** *** 421" />
        <FieldRow label="Status" value={<EnterpriseBadge variant="success" className="text-[10px]">Verified</EnterpriseBadge>} />
      </SectionCard>
      <SectionCard title="Payout History">
        <div className="grid grid-cols-3 gap-2 text-center">
          {["KBZ Pay", "Wave", "CB Pay"].map(m => (
            <div key={m} className="p-2 bg-white rounded border border-slate-200">
              <p className="text-xs font-bold text-slate-700">{m}</p>
              <p className="text-[10px] text-slate-400">Used</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function DocumentsTab({ emp }: { emp: Employee }) {
  return (
    <div className="space-y-4">
      <SectionCard title="Uploaded Documents">
        {[
          { name: "National ID Card", status: "Verified", icon: UserCheck },
          { name: "Employment Letter", status: "Verified", icon: FileText },
          { name: "Bank Statement", status: "Verified", icon: Landmark },
          { name: "Selfie Verification", status: "Verified", icon: Eye },
        ].map((doc, i) => (
          <div key={i} className="flex items-center justify-between p-2.5 rounded bg-white border border-slate-200">
            <div className="flex items-center gap-2">
              <doc.icon className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-medium text-slate-700">{doc.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <EnterpriseBadge variant="success" className="text-[10px]">{doc.status}</EnterpriseBadge>
              <Eye className="w-3 h-3 text-slate-300 cursor-pointer hover:text-[#31d891]" />
            </div>
          </div>
        ))}
      </SectionCard>
      <SectionCard title="KYC Verification Trail">
        <div className="space-y-2">
          {[
            { step: "National ID Scan", date: "2025-01-15", status: "Pass" },
            { step: "Employment Cross-Check", date: "2025-01-15", status: "Pass" },
            { step: "Bank Account Verify", date: "2025-01-16", status: "Pass" },
            { step: "Selfie Match", date: "2025-01-16", status: "Pass" },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">{i + 1}</span>
                <span className="text-xs text-slate-600">{item.step}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">{item.date}</span>
                <EnterpriseBadge variant="success" className="text-[9px]">{item.status}</EnterpriseBadge>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function HistoryTab({ emp }: { emp: Employee }) {
  const events = [
    { date: "2025-01-15", event: "Employee onboarded", by: "HR Admin", type: "info" },
    { date: "2025-01-15", event: "Employment verified", by: "System", type: "success" },
    { date: "2025-01-15", event: "EWA auto-approved", by: "Policy Engine", type: "success" },
    { date: "2025-01-16", event: "Bank account verified", by: "System", type: "success" },
    { date: "2025-01-20", event: "Trusted status granted", by: "System", type: "success" },
    { date: "2025-02-14", event: "First EWA request", by: emp.name, type: "info" },
    { date: "2025-07-01", event: "Company annual review passed", by: "Risk Officer", type: "success" },
  ];

  const typeColors: Record<string, string> = {
    success: "bg-emerald-500",
    info: "bg-blue-500",
    warning: "bg-amber-500",
    error: "bg-red-500",
  };

  return (
    <div className="space-y-4">
      <SectionCard title="Employee Timeline">
        <div className="space-y-0 relative">
          <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200" />
          {events.map((ev, i) => (
            <div key={i} className="flex items-start gap-3 py-2 relative">
              <div className={`w-[10px] h-[10px] rounded-full mt-1 shrink-0 border-2 border-white ${typeColors[ev.type]}`} />
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-700">{ev.event}</p>
                <p className="text-[10px] text-slate-400">{ev.date} · {ev.by}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function TransactionsTab({ emp }: { emp: Employee }) {
  const empTxns = transactions.filter(t => t.employeeId === emp.id);

  const statusMap: Record<string, "success" | "info" | "warning" | "error" | "neutral"> = {
    "Repaid": "success",
    "Disbursing": "info",
    "Approved": "warning",
    "Overdue": "error",
    "Failed": "error",
    "Pending": "neutral",
  };

  return (
    <div className="space-y-4">
      <SectionCard title={`Transaction History (${empTxns.length} records)`}>
        {empTxns.length === 0 ? (
          <div className="text-center py-6">
            <AlertCircle className="w-6 h-6 text-slate-200 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No transactions found</p>
          </div>
        ) : (
          <EnterpriseTable
            data={empTxns}
            columns={[
              { id: "id", header: "TXN ID", accessor: (t) => <span className="font-mono">{t.id}</span> },
              { id: "amount", header: "Amount", isNumeric: true, align: "right", accessor: (t) => t.amount },
              { id: "fee", header: "Fee", isNumeric: true, align: "right", accessor: (t) => t.fee, cellClassName: "text-amber-600" },
              { id: "net", header: "Net", isNumeric: true, align: "right", accessor: (t) => t.netAmount },
              { id: "method", header: "Method", accessor: (t) => t.payoutMethod },
              { id: "status", header: "Status", accessor: (t) => <EnterpriseBadge variant={statusMap[t.status] || "neutral"}>{t.status}</EnterpriseBadge> },
              { id: "journal", header: "Journal", accessor: (t) => <span className="text-[10px] font-mono text-slate-400">{t.journalRef}</span> }
            ]}
            rowKey={(t) => t.id}
          />
        )}
      </SectionCard>
      {empTxns.length > 0 && (
        <SectionCard title="Transaction Summary">
          <div className="grid grid-cols-4 gap-3">
            <div className="text-center p-2 bg-white rounded border border-slate-200">
              <p className="text-sm font-bold text-[#100841] font-mono">{empTxns.length}</p>
              <p className="text-[9px] text-slate-400 uppercase">Total</p>
            </div>
            <div className="text-center p-2 bg-white rounded border border-slate-200">
              <p className="text-sm font-bold text-emerald-600 font-mono">{formatMMK(empTxns.reduce((s, t) => s + t.amount, 0))}</p>
              <p className="text-[9px] text-slate-400 uppercase">Gross</p>
            </div>
            <div className="text-center p-2 bg-white rounded border border-slate-200">
              <p className="text-sm font-bold text-amber-600 font-mono">{formatMMK(empTxns.reduce((s, t) => s + t.fee, 0))}</p>
              <p className="text-[9px] text-slate-400 uppercase">Fees</p>
            </div>
            <div className="text-center p-2 bg-white rounded border border-slate-200">
              <p className="text-sm font-bold text-[#100841] font-mono">{formatMMK(empTxns.reduce((s, t) => s + t.netAmount, 0))}</p>
              <p className="text-[9px] text-slate-400 uppercase">Net Paid</p>
            </div>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

const TABS = [
  { id: "personal", label: "Personal", icon: User },
  { id: "employment", label: "Employment", icon: Building2 },
  { id: "payroll", label: "Payroll", icon: Wallet },
  { id: "budget", label: "Budget", icon: Hash },
  { id: "policies", label: "Policies", icon: ShieldCheck },
  { id: "bank", label: "Bank", icon: Landmark },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "history", label: "History", icon: History },
  { id: "transactions", label: "Transactions", icon: CreditCard },
];

export function EmployeeDetailSheet({ employee, onClose }: Props) {
  const [activeTab, setActiveTab] = useState("personal");

  // Reset tab when employee changes
  useMemo(() => setActiveTab("personal"), [employee?.id]);

  if (!employee) return null;

  return (
    <Sheet open={!!employee} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-[85%] sm:max-w-[750px] p-0 flex flex-col bg-white">
        {/* Header */}
        <div className="shrink-0 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center justify-between px-5 py-3">
            <div>
              <SheetTitle className="text-sm font-bold text-[#100841] flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#100841]/40" />
                {employee.name}
              </SheetTitle>
              <SheetDescription className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">
                {employee.employeeId} · {employee.companyName} · {employee.branch}
              </SheetDescription>
            </div>
            <div className="flex items-center gap-2">
              <VerificationBadge emp={employee} />
              <EnterpriseButton variant="secondary" className="h-7 text-[10px]">
                <Download className="w-3 h-3 mr-1" /> Export
              </EnterpriseButton>
            </div>
          </div>

          {/* Quick stats bar */}
          <div className="flex items-center gap-4 px-5 py-2 border-t border-slate-100 bg-white">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 uppercase">Salary</span>
              <span className="text-xs font-mono font-bold text-[#100841]">{formatMMK(employee.salary)}</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 uppercase">Cap</span>
              <span className="text-xs font-mono font-medium text-slate-600">{formatMMK(employee.ewaCap)}</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 uppercase">Available</span>
              <span className="text-xs font-mono font-medium text-emerald-600">{employee.ewaAvailable > 0 ? formatMMK(employee.ewaAvailable) : "—"}</span>
            </div>
            <div className="w-px h-4 bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-400 uppercase">Outstanding</span>
              <span className={`text-xs font-mono font-medium ${employee.outstanding > 0 ? "text-amber-600" : "text-emerald-500"}`}>
                {employee.outstanding > 0 ? formatMMK(employee.outstanding) : "0"}
              </span>
            </div>
          </div>

          {/* Ledger divider */}
          <div className="h-[1px] bg-gradient-to-r from-transparent via-[#31d891]/30 to-transparent" />
        </div>

        {/* Tabs + Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="shrink-0 border-b border-slate-200 px-4 bg-slate-50/50">
            <TabsList className="h-auto bg-transparent p-0 gap-0 flex-wrap">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className={`px-3 py-2.5 text-[11px] font-medium rounded-none border-b-2 transition-all data-[state=active]:border-[#31d891] data-[state=active]:text-[#100841] data-[state=active]:bg-white ${
                      isActive ? "border-[#31d891] text-[#100841] bg-white" : "border-transparent text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Icon className="w-3 h-3 mr-1.5" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <ScrollArea className="flex-1 p-5">
            <TabsContent value="personal" className="mt-0"><PersonalTab emp={employee} /></TabsContent>
            <TabsContent value="employment" className="mt-0"><EmploymentTab emp={employee} /></TabsContent>
            <TabsContent value="payroll" className="mt-0"><PayrollTab emp={employee} /></TabsContent>
            <TabsContent value="budget" className="mt-0"><BudgetTab emp={employee} /></TabsContent>
            <TabsContent value="policies" className="mt-0"><PoliciesTab emp={employee} /></TabsContent>
            <TabsContent value="bank" className="mt-0"><BankTab emp={employee} /></TabsContent>
            <TabsContent value="documents" className="mt-0"><DocumentsTab emp={employee} /></TabsContent>
            <TabsContent value="history" className="mt-0"><HistoryTab emp={employee} /></TabsContent>
            <TabsContent value="transactions" className="mt-0"><TransactionTimeline transactions={transactions.filter(t => t.employeeId === employee.id)} /></TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
