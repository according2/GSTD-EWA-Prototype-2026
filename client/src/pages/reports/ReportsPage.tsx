/**
 * ReportsPage — Reports Center
 * Design: Enterprise Fintech — SAP Fiori inspired
 * Multi-report types, grouping, financial statements, audit trail
 */
import { useState } from "react";
import { formatMMK, transactions, repaymentRequests, companies, employees, glBalances, journalEntries } from "@/data/mockData";
import { FileText, Download, Eye, Receipt, FileSpreadsheet, Users, Building2, BookOpen, Lock, ArrowRightLeft } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, CartesianGrid, Tooltip, Legend, XAxis, YAxis } from "recharts";
import {
  EnterpriseBadge,
  EnterpriseButton,
  LedgerDivider,
  EnterpriseTable,
  ColumnDef,
  TableAction,
  EnterpriseCard,
  EnterpriseSelect
} from "@/components/EnterpriseComponents";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type ReportType = "financial" | "transaction" | "employee" | "company" | "gl" | "audit";

const REPORT_TYPES: { id: ReportType; label: string; icon: React.ElementType }[] = [
  { id: "financial", label: "Financial Statements", icon: FileSpreadsheet },
  { id: "transaction", label: "Transaction Reports", icon: Receipt },
  { id: "employee", label: "Employee Reports", icon: Users },
  { id: "company", label: "Company Portfolio", icon: Building2 },
  { id: "gl", label: "GL Ledger Reports", icon: BookOpen },
  { id: "audit", label: "Audit Trail", icon: FileText },
];

export function ReportsPage() {
  const [reportType, setReportType] = useState<ReportType>("financial");
  const [period, setPeriod] = useState("July 2026");

  const totalRevenue = transactions.reduce((s, t) => s + t.fee, 0) + repaymentRequests.reduce((s, r) => s + r.lateFeeAmount, 0);
  const totalDisbursed = transactions.reduce((s, t) => s + t.amount, 0);
  const totalRepaid = transactions.filter(t => t.status === "Repaid").reduce((s, t) => s + t.amount, 0);
  const totalOutstanding = transactions.filter(t => t.status === "Overdue" || t.status === "Disbursing" || t.status === "Approved").reduce((s, t) => s + t.amount, 0);
  const totalAssets = glBalances.filter(g => g.type === "Asset").reduce((s, g) => s + g.closingBalance, 0);
  const totalLiabilities = glBalances.filter(g => g.type === "Liability").reduce((s, g) => s + g.closingBalance, 0);
  const totalIncome = Math.abs(glBalances.filter(g => g.type === "Income").reduce((s, g) => s + g.closingBalance, 0));

  const monthlyData = [
    { month: "Jan", disbursed: 2.1, repaid: 1.8, fee: 0.12 },
    { month: "Feb", disbursed: 2.5, repaid: 2.2, fee: 0.15 },
    { month: "Mar", disbursed: 3.0, repaid: 2.8, fee: 0.18 },
    { month: "Apr", disbursed: 2.8, repaid: 2.5, fee: 0.16 },
    { month: "May", disbursed: 3.5, repaid: 3.2, fee: 0.21 },
    { month: "Jun", disbursed: 4.0, repaid: 3.8, fee: 0.24 },
    { month: "Jul", disbursed: 0.72, repaid: 0.45, fee: 0.02 },
  ];

  const typeColors: Record<string, "success" | "warning" | "error" | "info" | "neutral"> = {
    "Income": "success",
    "Asset": "info",
    "Liability": "warning",
    "Equity": "neutral",
    "Active": "success",
    "Repaid": "success",
    "Overdue": "error",
    "Frozen": "error",
    "Pending": "warning",
    "Disbursing": "warning",
    "Approved": "info",
    "Entry": "neutral",
  };

  // Generic column def for reports
  const columns: ColumnDef<any>[] = [
    {
      id: "label",
      header: "Line Item / Descriptor",
      accessor: (r) => <span className="text-[12px] font-bold text-[#100841]">{r.label}</span>,
      searchString: (r) => r.label
    },
    {
      id: "value",
      header: "Amount",
      isNumeric: true,
      align: "right",
      accessor: (r) => r.value,
      cellClassName: () => "font-mono font-bold text-[#100841]"
    },
    {
      id: "category",
      header: "Category / Status",
      accessor: (r) => <EnterpriseBadge variant={typeColors[r.type] || "neutral"}>{r.type}</EnterpriseBadge>
    }
  ];

  const reportRows = (() => {
    switch (reportType) {
      case "financial":
        return [
          { label: "Total Revenue (Fees + Late Fees)", value: totalRevenue, type: "Income" },
          { label: "Total Disbursed", value: totalDisbursed, type: "Asset" },
          { label: "Total Repaid", value: totalRepaid, type: "Asset" },
          { label: "Total Outstanding", value: totalOutstanding, type: "Liability" },
          { label: "Total Assets", value: totalAssets, type: "Asset" },
          { label: "Total Liabilities", value: totalLiabilities, type: "Liability" },
          { label: "Total Income", value: totalIncome, type: "Income" },
          { label: "Net Position (Assets - Liabilities)", value: totalAssets - totalLiabilities, type: "Equity" },
        ];
      case "transaction":
        return transactions.map(t => ({ label: t.id, value: t.amount, type: t.status }));
      case "employee":
        return employees.map(e => ({ label: `${e.name} (${e.employeeId})`, value: e.outstanding, type: e.status }));
      case "company":
        return companies.map(c => ({ label: c.name, value: c.utilized, type: c.status }));
      case "gl":
        return glBalances.map(g => ({ label: `${g.accountCode} — ${g.accountName}`, value: g.closingBalance, type: g.type }));
      default:
        return journalEntries.slice(0, 10).map(j => ({ label: j.journalId, value: j.debit || j.credit, type: "Entry" }));
    }
  })();

  const tableActions: TableAction<any>[] = [
    { label: "View Details", icon: <Eye className="w-3.5 h-3.5" />, onClick: (r) => console.log("View", r.label) },
    { label: "Audit Log", icon: <FileText className="w-3.5 h-3.5" />, onClick: (r) => console.log("Audit", r.label) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[15px] font-bold text-[#100841] uppercase tracking-wide flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#100841]/40" />
            Institutional Reports Center
          </h1>
          <p className="text-[10px] text-[#4f525d] uppercase tracking-wider mt-0.5">
            Audit-safe financial extraction and monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
           <EnterpriseButton variant="secondary" className="h-8 py-0 px-3 flex items-center gap-1 text-[10px]">
            <Download className="w-3.5 h-3.5" /> Export All (PDF)
          </EnterpriseButton>
        </div>
      </div>

      <LedgerDivider />

      <EnterpriseCard className="p-3 border-[#dfdfdf] shadow-sm bg-white">
        <div className="flex items-center gap-3">
          <EnterpriseSelect 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value as ReportType)}
            className="w-[240px] h-9 text-[11px]"
          >
            {REPORT_TYPES.map(r => (
              <option key={r.id} value={r.id}>{r.label}</option>
            ))}
          </EnterpriseSelect>

          <EnterpriseSelect 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="w-[160px] h-9 text-[11px]"
          >
            <option value="July 2026">July 2026</option>
            <option value="June 2026">June 2026</option>
            <option value="Q2 2026">Q2 2026</option>
            <option value="FY 2026">FY 2026</option>
          </EnterpriseSelect>

          <div className="ml-auto flex items-center gap-2">
             <EnterpriseButton variant="secondary" className="h-8 py-0 px-3 text-[10px] font-bold">
               <Eye className="w-3 h-3 mr-1" /> PREVIEW
             </EnterpriseButton>
             <EnterpriseButton className="h-8 py-0 px-3 text-[10px] font-bold bg-[#100841] text-white">
               <Download className="w-3 h-3 mr-1" /> DOWNLOAD
             </EnterpriseButton>
          </div>
        </div>
      </EnterpriseCard>

      <Tabs defaultValue="report" className="w-full">
        <TabsList>
          <TabsTrigger value="report">Extracted Data</TabsTrigger>
          <TabsTrigger value="visuals">Trend Visuals</TabsTrigger>
          <TabsTrigger value="history">Generation History</TabsTrigger>
        </TabsList>

        <TabsContent value="report" className="space-y-4 outline-none">
          <EnterpriseTable
            data={reportRows}
            columns={columns}
            rowKey={(r) => r.label}
            actions={tableActions}
            searchPlaceholder="Search in report lines..."
          />
        </TabsContent>

        <TabsContent value="visuals" className="mt-4 outline-none">
          <EnterpriseCard className="p-6 shadow-sm">
             <h3 className="text-[11px] font-bold text-[#100841] uppercase tracking-widest mb-6">Financial Movement Trends — Institutional View</h3>
             <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#efefff" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#4f525d", fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#4f525d", fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}M`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: "2px", border: "1px solid #dfdfdf", fontSize: "11px", fontWeight: 700 }}
                    formatter={(v: number) => [`${formatMMK(v * 1000000)}`, ""]} 
                  />
                  <Legend wrapperStyle={{ fontSize: 10, fontWeight: 700, paddingTop: "20px" }} />
                  <Line type="monotone" dataKey="disbursed" name="Disbursement Flow" stroke="#100841" strokeWidth={2} dot={{ r: 3, fill: "#100841" }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="repaid" name="Repayment Cycle" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: "#10b981" }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="fee" name="Fee Yield" stroke="#31d891" strokeWidth={2} dot={{ r: 3, fill: "#31d891" }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
          </EnterpriseCard>
        </TabsContent>

        <TabsContent value="history" className="mt-4 outline-none">
           <EnterpriseCard className="p-20 text-center bg-slate-50 border border-dashed border-[#dfdfdf]">
              <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-[11px] font-bold text-[#4f525d] uppercase tracking-widest">No historical report generations found for this period</p>
           </EnterpriseCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
