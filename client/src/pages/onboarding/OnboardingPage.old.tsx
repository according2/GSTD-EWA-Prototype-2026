/**
 * OnboardingPage — Employee Onboarding & Import Wizard
 * SAP Fiori Pattern: 3-tab Object Page (Tasks / Requests / History) + 6-step Import Wizard
 * Design: Enterprise Fintech — Navy (#100841) + Teal (#31d891) | Sharp corners | Structured layout
 */
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  employeeImportTasks, importBatches, onboardingPipeline, employees, companies,
  formatMMK, type EmployeeImportTask, type ImportBatch, type ImportRow,
} from "@/data/mockData";
import {
  EnterpriseBadge,
  EnterpriseButton,
  LedgerDivider,
  EnterpriseTable,
  EnterpriseKpiCard,
  ColumnDef,
  TableAction,
  EnterpriseCard
} from "@/components/EnterpriseComponents";
import {
  Search, Upload, Plus, Eye, FileDown, Download, CheckCircle2, Clock, XCircle,
  AlertCircle, ArrowRight, ArrowLeft, UserCheck, Users, Building2,
  FileText, CheckSquare, X, Trash2, MapPin, ChevronDown, ChevronRight,
  ArrowRightLeft, FileSpreadsheet, RotateCcw, ShieldCheck, ShieldX
} from "lucide-react";

/* ===== STATUS BADGE ===== */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    "Pending": { bg: "bg-[#fff8e1]", text: "text-[#e65100]", border: "border-[#ffcc80]" },
    "Approved": { bg: "bg-[#e8f5e9]", text: "text-[#1b5e20]", border: "border-[#a5d6a7]" },
    "Rejected": { bg: "bg-[#fce4ec]", text: "text-[#b71c1c]", border: "border-[#ef9a9a]" },
    "Checking": { bg: "bg-[#e3f2fd]", text: "text-[#0d47a1]", border: "border-[#90caf9]" },
    "Maker_Submitted": { bg: "bg-[#fff3e0]", text: "text-[#e65100]", border: "border-[#ffcc80]" },
    "Column_Mapping": { bg: "bg-[#e3f2fd]", text: "text-[#0d47a1]", border: "border-[#90caf9]" },
    "Completed": { bg: "bg-[#e8f5e9]", text: "text-[#1b5e20]", border: "border-[#a5d6a7]" },
    "Checker_Rejected": { bg: "bg-[#fce4ec]", text: "text-[#b71c1c]", border: "border-[#ef9a9a]" },
    "Active": { bg: "bg-[#e8f5e9]", text: "text-[#1b5e20]", border: "border-[#a5d6a7]" },
    "KYC_REVIEW": { bg: "bg-[#e3f2fd]", text: "text-[#0d47a1]", border: "border-[#90caf9]" },
    "Configuration": { bg: "bg-[#fff8e1]", text: "text-[#e65100]", border: "border-[#ffcc80]" },
    "Integration": { bg: "bg-[#fff8e1]", text: "text-[#e65100]", border: "border-[#ffcc80]" },
    "SUBMITTED": { bg: "bg-[#fff8e1]", text: "text-[#e65100]", border: "border-[#ffcc80]" },
  };
  const c = map[status] || { bg: "bg-[#efefff]", text: "text-[#616161]", border: "border-[#c4c9ce]" };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-[2px] text-[10px] font-bold uppercase tracking-wider ${c.bg} ${c.text} border ${c.border}`}>
      {status.replace("_", " ")}
    </span>
  );
}

/* ===== CATEGORY BADGE ===== */
function CategoryBadge({ category }: { category: string }) {
  const map: Record<string, { bg: string; text: string; border: string }> = {
    new: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    modified: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    missing: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
    unchanged: { bg: "bg-slate-50", text: "text-slate-500", border: "border-slate-200" },
  };
  const c = map[category] || map.unchanged;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-[2px] text-[10px] font-bold uppercase tracking-wider ${c.bg} ${c.text} border ${c.border}`}>
      {category.toUpperCase()}
    </span>
  );
}

function ValidationBadge({ validation }: { validation: string }) {
  const map: Record<string, { bg: string; text: string; border: string; icon: React.ElementType }> = {
    correct: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2 },
    incorrect: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200", icon: XCircle },
    warning: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", icon: AlertCircle },
  };
  const c = map[validation] || map.correct;
  const Icon = c.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-bold uppercase tracking-wider ${c.bg} ${c.text} border ${c.border}`}>
      <Icon className="w-3 h-3" /> {validation.toUpperCase()}
    </span>
  );
}

/* ===== WIZARD STEP INDICATOR ===== */
function WizardStepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] text-[10px] font-bold uppercase tracking-wider ${
            i < current ? "bg-emerald-500 text-white" :
            i === current ? "bg-[#31d891] text-white" :
            "bg-slate-100 text-slate-400"
          }`}>
            <span className="font-mono">{i + 1}</span>
            <span className="hidden sm:inline">{step}</span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-6 h-0.5 ${i < current ? "bg-emerald-500" : "bg-slate-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ===== SAMPLE IMPORT ROWS ===== */
const sampleImportRows: ImportRow[] = [
  { id: 1, category: "new", validation: "correct", data: { employee_code: "GH-004", name: "Aung Aung", phone: "09-771234567", salary: "450000", department: "Sales", branch: "Head Office" }, errors: [], warnings: [] },
  { id: 2, category: "new", validation: "correct", data: { employee_code: "GH-005", name: "Thiri Thuriya", phone: "09-971234567", salary: "500000", department: "Operations", branch: "Bago Branch" }, errors: [], warnings: [] },
  { id: 3, category: "new", validation: "incorrect", data: { employee_code: "GH-006", name: "", phone: "09-871234567", salary: "380000", department: "HR", branch: "Head Office" }, errors: ["Name is required"], warnings: [] },
  { id: 4, category: "modified", validation: "correct", data: { employee_code: "GH-001", name: "Thant Zin (Updated)", phone: "09-771234567", salary: "500000", department: "Sales", branch: "Head Office" }, errors: [], warnings: ["Salary changed from 450,000 to 500,000"] },
  { id: 5, category: "new", validation: "incorrect", data: { employee_code: "GH-007", name: "Mya Mya", phone: "09-671234567", salary: "0", department: "", branch: "" }, errors: ["Salary must be > 0", "Department is required"], warnings: [] },
  { id: 6, category: "missing", validation: "warning", data: { employee_code: "GH-003", name: "Zaw Win Htet", phone: "09-571234567", salary: "400000", department: "Operations", branch: "Bago Branch" }, errors: [], warnings: ["Employee in DB but not in file — action required"] },
  { id: 7, category: "unchanged", validation: "correct", data: { employee_code: "GH-002", name: "Myint Myint Aye", phone: "09-471234567", salary: "500000", department: "Operations", branch: "Head Office" }, errors: [], warnings: [] },
];

const SAMPLE_COLUMNS = [
  { fileColumn: "Employee ID", systemField: "employee_code", required: true },
  { fileColumn: "Full Name", systemField: "name", required: true },
  { fileColumn: "Phone", systemField: "phone", required: true },
  { fileColumn: "Salary (MMK)", systemField: "salary", required: true },
  { fileColumn: "Department", systemField: "department", required: false },
  { fileColumn: "Branch", systemField: "branch_code", required: false },
  { fileColumn: "Join Date", systemField: "join_date", required: false },
  { fileColumn: "NRC", systemField: "nrc", required: false },
];

export function OnboardingPage() {
  const [importWizardOpen, setImportWizardOpen] = useState(false);
  const [addEmployeeOpen, setAddEmployeeOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [selectedBatch, setSelectedBatch] = useState<ImportBatch | null>(null);
  const [detailBatchOpen, setDetailBatchOpen] = useState(false);
  const [detailTab, setDetailTab] = useState<string>("detail");

  /* Single Employee Form State */
  const [employeeForm, setEmployeeForm] = useState({
    employee_code: "", name: "", phone: "", nrc: "",
    salary: "", department: "", branch_code: "", join_date: "",
    company_id: "cmp-001",
  });

  const wizardSteps = ["Upload File", "Column Mapping", "Data Preview", "Validation", "Maker Submit", "Checker Approve"];

  const activeBatches = importBatches.filter(b => b.status !== "Completed" && b.status !== "Checker_Rejected");
  const historyBatches = importBatches.filter(b => b.status === "Completed" || b.status === "Checker_Rejected");

  // Define table columns for Tasks
  const taskColumns: ColumnDef<EmployeeImportTask>[] = [
    {
      id: "id",
      header: "ID",
      accessor: (task) => <span className="text-xs font-mono text-slate-700">{task.id}</span>,
      searchString: (task) => task.id
    },
    {
      id: "employee",
      header: "Employee",
      accessor: (task) => (
        <div>
          <p className="text-xs font-medium text-slate-900">{task.employeeName}</p>
          <p className="text-[10px] text-slate-400 font-mono">{task.employeeCode}</p>
        </div>
      ),
      searchString: (task) => `${task.employeeName} ${task.employeeCode}`
    },
    {
      id: "company",
      header: "Company",
      accessor: (task) => <span className="text-xs text-slate-700">{task.companyName}</span>,
      searchString: (task) => task.companyName
    },
    {
      id: "type",
      header: "Type",
      accessor: (task) => (
        <EnterpriseBadge variant={task.type === "add" ? "success" : "info"}>
          {task.type === "add" ? "ADD" : "UPDATE"}
        </EnterpriseBadge>
      )
    },
    {
      id: "overflow",
      header: "Budget Overflow",
      accessor: (task) => task.budgetOverflow ? (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600">
          <AlertCircle className="w-3 h-3" /> Overflow ({task.budgetRequest})
        </span>
      ) : (
        <span className="text-[10px] text-slate-400">—</span>
      )
    },
    {
      id: "status",
      header: "Status",
      accessor: (task) => <StatusBadge status={task.status} />
    },
    {
      id: "submitted",
      header: "Submitted",
      accessor: (task) => <span className="text-xs text-slate-500">{task.submittedAt}</span>
    }
  ];

  const taskActions: TableAction<EmployeeImportTask>[] = [
    { label: "Approve", icon: <CheckSquare className="w-3.5 h-3.5" />, onClick: (task) => console.log("Approve", task.id) },
    { label: "Reject", icon: <X className="w-3.5 h-3.5" />, onClick: (task) => console.log("Reject", task.id) },
    { label: "View Detail", icon: <Eye className="w-3.5 h-3.5" />, onClick: (task) => console.log("View", task.id) },
  ];

  // Define table columns for Active Batches
  const batchColumns: ColumnDef<ImportBatch>[] = [
    {
      id: "id",
      header: "Batch ID",
      accessor: (batch) => <span className="text-xs font-mono text-slate-700">{batch.id}</span>,
      searchString: (batch) => batch.id
    },
    {
      id: "file",
      header: "File",
      accessor: (batch) => <span className="text-xs text-slate-700">{batch.fileName}</span>,
      searchString: (batch) => batch.fileName
    },
    {
      id: "rows",
      header: "Rows",
      isNumeric: true,
      accessor: (batch) => batch.totalRows
    },
    {
      id: "status",
      header: "Status",
      accessor: (batch) => <StatusBadge status={batch.status} />
    },
    {
      id: "new",
      header: "New",
      isNumeric: true,
      accessor: (batch) => batch.newCount,
      cellClassName: () => "text-emerald-600 font-bold"
    },
    {
      id: "modified",
      header: "Modified",
      isNumeric: true,
      accessor: (batch) => batch.modifiedCount,
      cellClassName: () => "text-amber-600 font-bold"
    },
    {
      id: "missing",
      header: "Missing",
      isNumeric: true,
      accessor: (batch) => batch.missingCount,
      cellClassName: () => "text-red-600 font-bold"
    },
    {
      id: "correct",
      header: "Correct",
      isNumeric: true,
      accessor: (batch) => batch.correctCount,
      cellClassName: () => "text-emerald-600 font-bold"
    },
    {
      id: "incorrect",
      header: "Incorrect",
      isNumeric: true,
      accessor: (batch) => batch.incorrectCount,
      cellClassName: () => "text-red-600 font-bold"
    }
  ];

  const batchActions: TableAction<ImportBatch>[] = [
    { label: "View Details", icon: <Eye className="w-3.5 h-3.5" />, onClick: (batch) => { setSelectedBatch(batch); setDetailTab("preview"); setDetailBatchOpen(true); } },
  ];

  // Pipeline Columns
  const pipelineColumns: ColumnDef<any>[] = [
    {
      id: "company",
      header: "Company",
      accessor: (ob) => (
        <div>
          <p className="text-xs font-medium text-slate-900">{ob.companyName}</p>
          <p className="text-[10px] text-slate-400 font-mono">{ob.id}</p>
        </div>
      ),
      searchString: (ob) => `${ob.companyName} ${ob.id}`
    },
    {
      id: "type",
      header: "Type",
      accessor: (ob) => <EnterpriseBadge variant="neutral" className="text-[10px] uppercase font-bold">{ob.companyType}</EnterpriseBadge>
    },
    {
      id: "stage",
      header: "Stage",
      accessor: (ob) => <span className="text-xs text-slate-700 font-medium">{ob.stageName}</span>
    },
    {
      id: "progress",
      header: "Progress",
      accessor: (ob) => (
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(s => (
            <div key={s} className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold ${
              s <= ob.stage ? "bg-emerald-500 text-white" : s === ob.stage ? "bg-amber-500 text-white" : "bg-slate-200 text-slate-400"
            }`}>{s <= ob.stage ? <CheckCircle2 className="w-3 h-3" /> : s}</div>
          ))}
        </div>
      )
    },
    {
      id: "submitted",
      header: "Submitted",
      accessor: (ob) => <span className="text-xs text-slate-500">{ob.submittedAt}</span>
    },
    {
      id: "status",
      header: "Status",
      accessor: (ob) => <StatusBadge status={ob.currentStage} />
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-[15px] font-bold text-[#100841] uppercase tracking-wide flex items-center gap-2">
            <Users className="w-4 h-4 text-[#31d891]" />
            Employee Onboarding
          </h1>
          <p className="text-[10px] text-[#4f525d] uppercase tracking-wider mt-0.5">
            Employee verification · Bulk import wizard · Budget eligibility integration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <EnterpriseButton variant="secondary" className="h-8 py-0 px-3 flex items-center gap-1 text-[10px]"
            onClick={() => setAddEmployeeOpen(true)}>
            <Plus className="w-3.5 h-3.5" /> Add
          </EnterpriseButton>
          <EnterpriseButton variant="primary" className="h-8 py-0 px-3 flex items-center gap-1 text-[10px] bg-[#31d891] text-white"
            onClick={() => { setImportWizardOpen(true); setWizardStep(0); }}>
            <Upload className="w-3.5 h-3.5" /> Import
          </EnterpriseButton>
        </div>
      </div>

      <LedgerDivider />

      {/* Main Tabs */}
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* ===== TASKS TAB ===== */}
        <TabsContent value="tasks" className="mt-4 outline-none space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-3">
            <EnterpriseKpiCard
              label="Pending Approvals"
              value={employeeImportTasks.filter(t => t.status === "Pending").length}
              accentColor="amber"
              icon={<Clock className="w-3.5 h-3.5 text-[#e65100]" />}
            />
            <EnterpriseKpiCard
              label="Budget Overflow"
              value={employeeImportTasks.filter(t => t.budgetOverflow && t.status === "Pending").length}
              accentColor="error"
              icon={<AlertCircle className="w-3.5 h-3.5 text-[#c62828]" />}
            />
            <EnterpriseKpiCard
              label="Verification Queue"
              value={employees.filter(e => e.status === "Pending Verification" || e.status === "KYC Pending").length}
              accentColor="info"
              icon={<UserCheck className="w-3.5 h-3.5 text-[#0d47a1]" />}
            />
            <EnterpriseKpiCard
              label="Approved Today"
              value="3"
              accentColor="success"
              icon={<CheckCircle2 className="w-3.5 h-3.5 text-[#2e7d32]" />}
            />
          </div>

          <EnterpriseTable
            data={employeeImportTasks}
            columns={taskColumns}
            rowKey={(task) => task.id}
            actions={taskActions}
            selectable={true}
            searchPlaceholder="Search by employee name or code..."
          />
        </TabsContent>

        {/* ===== REQUESTS TAB ===== */}
        <TabsContent value="requests" className="mt-4 outline-none">
          <EnterpriseTable
            data={activeBatches}
            columns={batchColumns}
            rowKey={(batch) => batch.id}
            actions={batchActions}
            searchPlaceholder="Search batches..."
          />
        </TabsContent>

        {/* ===== HISTORY TAB ===== */}
        <TabsContent value="history" className="mt-4 outline-none space-y-6">
          <div className="space-y-3">
             <div className="flex items-center gap-2 px-1">
               <Building2 className="w-3.5 h-3.5 text-[#31d891]" />
               <h3 className="text-[11px] font-bold text-[#100841] uppercase tracking-wider">Company Onboarding Pipeline</h3>
             </div>
             <EnterpriseTable
               data={onboardingPipeline}
               columns={pipelineColumns}
               rowKey={(ob) => ob.id}
               searchPlaceholder="Search pipeline..."
             />
          </div>

          <div className="space-y-3">
             <div className="flex items-center gap-2 px-1">
               <FileSpreadsheet className="w-3.5 h-3.5 text-[#31d891]" />
               <h3 className="text-[11px] font-bold text-[#100841] uppercase tracking-wider">Completed Import Batches</h3>
             </div>
             <EnterpriseTable
               data={historyBatches}
               columns={batchColumns}
               rowKey={(batch) => batch.id}
               actions={batchActions}
               searchPlaceholder="Search batch history..."
             />
          </div>
        </TabsContent>
      </Tabs>


      {/* ===== IMPORT WIZARD DIALOG ===== */}
      <Dialog open={importWizardOpen} onOpenChange={setImportWizardOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#100841] flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-teal-500" />
              Bulk Employee Import Wizard
            </DialogTitle>
          </DialogHeader>

          <WizardStepper steps={wizardSteps} current={wizardStep} />

          {/* Step 0: Upload File */}
          {wizardStep === 0 && (
            <div className="space-y-4">
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-md p-8 text-center">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-700">Drag & drop your employee file here</p>
                <p className="text-xs text-slate-400 mt-1">Supported: .xlsx, .xls, .csv (max 10,000 rows, 10MB)</p>
                <EnterpriseButton className="mt-3 h-8 text-xs bg-[#31d891] hover:bg-[#111111] text-white"
                  onClick={() => setWizardStep(1)}>
                  Simulate Upload (golden_harvest_batch_2026-07-12.xlsx)
                </EnterpriseButton>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <EnterpriseCard className="p-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Required Columns</p>
                  <p className="text-xs text-slate-700 mt-1">employee_code, name, phone, salary</p>
                </EnterpriseCard>
                <EnterpriseCard className="p-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Optional Columns</p>
                  <p className="text-xs text-slate-700 mt-1">nrc, department, branch_code, join_date</p>
                </EnterpriseCard>
                <EnterpriseCard className="p-3">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">File Limit</p>
                  <p className="text-xs text-slate-700 mt-1">10,000 rows / 10MB</p>
                </EnterpriseCard>
              </div>
            </div>
          )}

          {/* Step 1: Column Mapping */}
          {wizardStep === 1 && (
            <div className="space-y-4">
              <EnterpriseCard className="overflow-hidden">
                <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Auto-Detected Column Mapping</h4>
                </div>
                <div className="p-0">
                  <EnterpriseTable
                    data={SAMPLE_COLUMNS}
                    columns={[
                      {
                        id: "fileColumn",
                        header: "File Column",
                        accessor: (col) => <span className="text-xs font-medium text-slate-700">{col.fileColumn}</span>
                      },
                      {
                        id: "systemField",
                        header: "System Field",
                        accessor: (col) => (
                          <Select defaultValue={col.systemField}>
                            <SelectTrigger className="h-7 text-xs border-slate-200">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={col.systemField}>{col.systemField}</SelectItem>
                              <SelectItem value="employee_code">employee_code</SelectItem>
                              <SelectItem value="name">name</SelectItem>
                              <SelectItem value="phone">phone</SelectItem>
                              <SelectItem value="salary">salary</SelectItem>
                              <SelectItem value="department">department</SelectItem>
                              <SelectItem value="branch_code">branch_code</SelectItem>
                              <SelectItem value="join_date">join_date</SelectItem>
                              <SelectItem value="nrc">nrc</SelectItem>
                            </SelectContent>
                          </Select>
                        )
                      },
                      {
                        id: "required",
                        header: "Required",
                        accessor: (col) => (
                          <EnterpriseBadge variant={col.required ? "error" : "neutral"} className="text-[9px] font-bold uppercase">
                            {col.required ? "Required" : "Optional"}
                          </EnterpriseBadge>
                        )
                      },
                      {
                        id: "confidence",
                        header: "Confidence",
                        accessor: (col, i) => (
                          <div className="flex items-center gap-1">
                            <div className="w-16 bg-slate-100 rounded-full h-1.5">
                              <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${85 + (i || 0) * 2}%` }} />
                            </div>
                            <span className="text-[10px] text-emerald-600 font-bold">{85 + (i || 0) * 2}%</span>
                          </div>
                        )
                      },
                      {
                        id: "action",
                        header: "Action",
                        accessor: () => <EnterpriseButton variant="secondary" className="h-6 text-[10px] text-[#31d891] py-0 px-2">Remap</EnterpriseButton>
                      }
                    ]}
                    rowKey={(col) => col.fileColumn}
                  />
                </div>
              </EnterpriseCard>
            </div>
          )}

          {/* Step 2: Data Preview */}
          {wizardStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Input placeholder="Search preview..." className="h-8 text-xs" />
                <Select defaultValue="all">
                  <SelectTrigger className="h-8 text-xs w-32">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rows</SelectItem>
                    <SelectItem value="new">New Only</SelectItem>
                    <SelectItem value="modified">Modified Only</SelectItem>
                    <SelectItem value="missing">Missing Only</SelectItem>
                    <SelectItem value="incorrect">Errors Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <EnterpriseCard className="p-0 overflow-hidden">
                <ScrollArea className="max-h-[400px]">
                  <EnterpriseTable
                    data={sampleImportRows}
                    columns={[
                      { id: "id", header: "#", accessor: (row) => <span className="text-xs font-mono text-slate-500">{row.id}</span> },
                      { id: "category", header: "Category", accessor: (row) => <CategoryBadge category={row.category} /> },
                      { id: "validation", header: "Validation", accessor: (row) => <ValidationBadge validation={row.validation} /> },
                      { id: "code", header: "Code", accessor: (row) => <span className="text-xs font-mono text-slate-700">{row.data.employee_code}</span> },
                      { id: "name", header: "Name", accessor: (row) => <span className="text-xs text-slate-700">{row.data.name || <span className="text-red-400 italic">empty</span>}</span> },
                      { id: "phone", header: "Phone", accessor: (row) => <span className="text-xs text-slate-500">{row.data.phone}</span> },
                      { id: "salary", header: "Salary", accessor: (row) => <span className={`text-xs font-mono ${row.data.salary === "0" ? "text-red-600" : "text-slate-700"}`}>{row.data.salary === "0" ? "0 (invalid)" : formatMMK(Number(row.data.salary))}</span> },
                      { id: "dept", header: "Dept", accessor: (row) => <span className="text-xs text-slate-500">{row.data.department || <span className="text-red-400 italic">empty</span>}</span> }
                    ]}
                    rowKey={(row) => row.id}
                  />
                </ScrollArea>
              </EnterpriseCard>
            </div>
          )}

          {/* Step 3: Validation Results */}
          {wizardStep === 3 && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-5 gap-3">
                <EnterpriseKpiCard label="Correct" value="40" accentColor="success" />
                <EnterpriseKpiCard label="Incorrect" value="5" accentColor="error" />
                <EnterpriseKpiCard label="Warnings" value="3" accentColor="amber" />
                <EnterpriseKpiCard label="New" value="30" accentColor="success" />
                <EnterpriseKpiCard label="Modified" value="8" accentColor="info" />
              </div>

              {/* Error Details */}
              <EnterpriseCard className="p-0 overflow-hidden">
                <div className="px-4 py-3 bg-red-50 border-b border-red-200">
                  <h4 className="text-[11px] font-bold text-red-500 uppercase tracking-widest">Incorrect Rows (5)</h4>
                </div>
                <EnterpriseTable
                  data={sampleImportRows.filter(r => r.validation === "incorrect")}
                  columns={[
                    { id: "row", header: "Row", accessor: (row) => <span className="text-xs font-mono text-red-600">{row.id}</span> },
                    { id: "code", header: "Employee Code", accessor: (row) => <span className="text-xs font-mono text-slate-700">{row.data.employee_code}</span> },
                    { id: "name", header: "Name", accessor: (row) => <span className="text-xs text-slate-700">{row.data.name || <span className="text-red-400 italic">empty</span>}</span> },
                    { id: "errors", header: "Errors", accessor: (row) => (
                      <div className="space-y-0.5">
                        {row.errors.map((e, i) => (
                          <div key={i} className="flex items-center gap-1 text-[10px] text-red-600">
                            <XCircle className="w-3 h-3" /> {e}
                          </div>
                        ))}
                      </div>
                    )},
                    { id: "action", header: "Action", accessor: () => <EnterpriseButton variant="secondary" className="h-6 text-[10px] text-red-600 hover:bg-red-50 py-0 px-2"><RotateCcw className="w-3 h-3 mr-0.5" /> Fix</EnterpriseButton> }
                  ]}
                  rowKey={(row) => row.id}
                />
              </EnterpriseCard>

              {/* Warning Details */}
              <EnterpriseCard className="p-0 overflow-hidden">
                <div className="px-4 py-3 bg-amber-50 border-b border-amber-200">
                  <h4 className="text-[11px] font-bold text-amber-500 uppercase tracking-widest">Warnings (3)</h4>
                </div>
                <EnterpriseTable
                  data={sampleImportRows.filter(r => r.warnings.length > 0)}
                  columns={[
                    { id: "row", header: "Row", accessor: (row) => <span className="text-xs font-mono text-amber-600">{row.id}</span> },
                    { id: "code", header: "Employee Code", accessor: (row) => <span className="text-xs font-mono text-slate-700">{row.data.employee_code}</span> },
                    { id: "warnings", header: "Warnings", accessor: (row) => (
                      <div className="space-y-0.5">
                        {row.warnings.map((w, i) => (
                          <div key={i} className="flex items-center gap-1 text-[10px] text-amber-600">
                            <AlertCircle className="w-3 h-3" /> {w}
                          </div>
                        ))}
                      </div>
                    )},
                    { id: "action", header: "Action", accessor: (row) => row.category === "missing" ? (
                      <Select defaultValue="freeze">
                        <SelectTrigger className="h-6 text-[10px] border-amber-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="freeze">Freeze</SelectItem>
                          <SelectItem value="suspend">Suspend</SelectItem>
                          <SelectItem value="ignore">Ignore</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : null }
                  ]}
                  rowKey={(row) => row.id}
                />
              </EnterpriseCard>

              {/* Error Report Download */}
              <div className="flex justify-end">
                <EnterpriseButton variant="secondary" className="h-8 text-xs border-slate-300">
                  <FileDown className="w-3.5 h-3.5 mr-1" /> Download Error Report (.xlsx)
                </EnterpriseButton>
              </div>
            </div>
          )}

          {/* Step 4: Maker Submit */}
          {wizardStep === 4 && (
            <div className="space-y-4">
              <EnterpriseCard>
                <div className="px-4 py-3 border-b border-slate-200">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Import Summary</h4>
                </div>
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">File:</span>
                      <span className="font-medium text-slate-900">golden_harvest_batch_2026-07-12.xlsx</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Total Rows:</span>
                      <span className="font-medium text-slate-900">45</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">New Employees:</span>
                      <span className="font-medium text-emerald-600">30</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Modified:</span>
                      <span className="font-medium text-blue-600">8</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Correct:</span>
                      <span className="font-medium text-emerald-600">40</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Incorrect:</span>
                      <span className="font-medium text-red-600">5</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <label className="text-xs font-medium text-slate-700">Maker Notes (optional)</label>
                    <Textarea placeholder="Add any notes for the checker reviewer..." className="mt-1 text-xs" rows={3} />
                  </div>
                </div>
              </EnterpriseCard>
            </div>
          )}

          {/* Step 5: Checker Approve */}
          {wizardStep === 5 && (
            <div className="space-y-4">
              <EnterpriseCard>
                <div className="px-4 py-3 border-b border-slate-200">
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Checker Review — Pending Approval</h4>
                </div>
                <div className="p-4 space-y-3">
                  <div className="bg-slate-50 rounded-md p-3 text-xs text-slate-600">
                    <p><strong>Batch:</strong> IMP-2026-001</p>
                    <p><strong>Maker:</strong> Admin HR</p>
                    <p><strong>Submitted:</strong> 2026-07-12 10:30</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Correct rows:</span>
                      <span className="font-medium text-emerald-600">40</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Incorrect rows:</span>
                      <span className="font-medium text-red-600">5</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Missing employees:</span>
                      <span className="font-medium text-amber-600">5 (action needed)</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-200 pt-3">
                    <label className="text-xs font-medium text-slate-700">Checker Decision</label>
                    <Select defaultValue="approve">
                      <SelectTrigger className="mt-1 h-8 text-xs border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approve">Approve</SelectItem>
                        <SelectItem value="reject">Reject</SelectItem>
                        <SelectItem value="return">Return to Maker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-700">Comment / Rejection Reason</label>
                    <Textarea placeholder={wizardStep === 5 ? "Required if rejecting..." : "Optional comment..."} className="mt-1 text-xs" rows={3} />
                  </div>
                </div>
              </EnterpriseCard>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <div>
              {wizardStep > 0 && (
                <EnterpriseButton variant="secondary" className="h-8 text-xs" onClick={() => setWizardStep(wizardStep - 1)}>
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Previous
                </EnterpriseButton>
              )}
            </div>
            <div className="flex items-center gap-2">
              <EnterpriseButton variant="secondary" className="h-8 text-xs" onClick={() => setImportWizardOpen(false)}>
                Cancel
              </EnterpriseButton>
              {wizardStep < 5 ? (
                <EnterpriseButton className="h-8 text-xs bg-[#31d891] hover:bg-[#111111] text-white"
                  onClick={() => setWizardStep(wizardStep + 1)}>
                  Next <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </EnterpriseButton>
              ) : (
                <>
                  <EnterpriseButton variant="secondary" className="h-8 text-xs border-red-300 text-red-600 hover:bg-red-50">
                    <X className="w-3.5 h-3.5 mr-1" /> Reject
                  </EnterpriseButton>
                  <EnterpriseButton className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => setImportWizardOpen(false)}>
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                  </EnterpriseButton>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== ADD SINGLE EMPLOYEE DIALOG ===== */}
      <Dialog open={addEmployeeOpen} onOpenChange={setAddEmployeeOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-[#100841] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-teal-500" />
              Add Employee — Single Onboarding
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Personal Information */}
            <EnterpriseCard>
              <div className="px-4 py-2 border-b border-slate-100">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Personal Information</h4>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-medium text-slate-600">Employee Code <span className="text-red-500">*</span></label>
                    <Input value={employeeForm.employee_code} onChange={e => setEmployeeForm({ ...employeeForm, employee_code: e.target.value })} placeholder="e.g., MTS-007" className="h-8 text-xs mt-0.5" />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-slate-600">Full Name <span className="text-red-500">*</span></label>
                    <Input value={employeeForm.name} onChange={e => setEmployeeForm({ ...employeeForm, name: e.target.value })} placeholder="Full name" className="h-8 text-xs mt-0.5" />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-slate-600">Phone Number <span className="text-red-500">*</span></label>
                    <Input value={employeeForm.phone} onChange={e => setEmployeeForm({ ...employeeForm, phone: e.target.value })} placeholder="09-XXXXXXXXX" className="h-8 text-xs mt-0.5" />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-slate-600">NRC Number</label>
                    <Input value={employeeForm.nrc} onChange={e => setEmployeeForm({ ...employeeForm, nrc: e.target.value })} placeholder="12/NaKaTa(N)123456" className="h-8 text-xs mt-0.5" />
                  </div>
                </div>
              </div>
            </EnterpriseCard>

            {/* Employment Information */}
            <EnterpriseCard>
              <div className="px-4 py-2 border-b border-slate-100">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Employment Information</h4>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-medium text-slate-600">Company <span className="text-red-500">*</span></label>
                    <Select value={employeeForm.company_id} onValueChange={v => setEmployeeForm({ ...employeeForm, company_id: v })}>
                      <SelectTrigger className="h-8 text-xs mt-0.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-slate-600">Department</label>
                    <Input value={employeeForm.department} onChange={e => setEmployeeForm({ ...employeeForm, department: e.target.value })} placeholder="Department" className="h-8 text-xs mt-0.5" />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-slate-600">Branch</label>
                    <Input value={employeeForm.branch_code} onChange={e => setEmployeeForm({ ...employeeForm, branch_code: e.target.value })} placeholder="Branch" className="h-8 text-xs mt-0.5" />
                  </div>
                  <div>
                    <label className="text-[10px] font-medium text-slate-600">Join Date</label>
                    <Input value={employeeForm.join_date} onChange={e => setEmployeeForm({ ...employeeForm, join_date: e.target.value })} placeholder="YYYY-MM-DD" className="h-8 text-xs mt-0.5" />
                  </div>
                </div>
              </div>
            </EnterpriseCard>

            {/* Payroll & Budget */}
            <EnterpriseCard>
              <div className="px-4 py-2 border-b border-slate-100">
                <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Payroll & Budget</h4>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-medium text-slate-600">Monthly Salary (MMK) <span className="text-red-500">*</span></label>
                    <Input value={employeeForm.salary} onChange={e => setEmployeeForm({ ...employeeForm, salary: e.target.value })} placeholder="e.g., 500000" className="h-8 text-xs mt-0.5" />
                  </div>
                </div>
                {employeeForm.salary && Number(employeeForm.salary) > 0 && (
                  <div className="bg-teal-50 border border-teal-200 rounded-md p-3">
                    <p className="text-xs font-medium text-teal-700">Auto-Calculated EWA Cap</p>
                    <p className="text-sm font-bold text-teal-800 mt-0.5">{formatMMK(Math.round(Number(employeeForm.salary) * 0.5))}</p>
                    <p className="text-[10px] text-teal-500 mt-0.5">50% of monthly salary</p>
                  </div>
                )}
                {employeeForm.salary && Number(employeeForm.salary) > 800000 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    <p className="text-xs text-amber-700">Budget overflow detected — this will trigger an automatic Budget Request for approval</p>
                  </div>
                )}
              </div>
            </EnterpriseCard>
          </div>

          <DialogFooter>
            <EnterpriseButton variant="secondary" className="h-8 text-xs" onClick={() => setAddEmployeeOpen(false)}>
              Cancel
            </EnterpriseButton>
            <EnterpriseButton className="h-8 text-xs bg-[#31d891] hover:bg-[#111111] text-white" onClick={() => setAddEmployeeOpen(false)}>
              <UserCheck className="w-3.5 h-3.5 mr-1" /> Submit for Verification
            </EnterpriseButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ===== BATCH DETAIL SHEET ===== */}
      <Sheet open={detailBatchOpen} onOpenChange={setDetailBatchOpen}>
        <SheetContent side="right" className="w-[600px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-base font-bold text-[#100841] flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-teal-500" />
              Import Batch: {selectedBatch?.id}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 mt-4">
            {/* Batch Info */}
            <div className="bg-slate-50 rounded-md p-3 text-xs space-y-1">
              <div className="flex justify-between"><span className="text-slate-500">File:</span><span className="font-medium">{selectedBatch?.fileName}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Uploaded by:</span><span className="font-medium">{selectedBatch?.uploadedBy}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Uploaded at:</span><span className="font-medium">{selectedBatch?.uploadedAt}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Status:</span><StatusBadge status={selectedBatch?.status || ""} /></div>
              {selectedBatch?.checkerName && <div className="flex justify-between"><span className="text-slate-500">Checked by:</span><span className="font-medium">{selectedBatch.checkerName}</span></div>}
              {selectedBatch?.checkedAt && <div className="flex justify-between"><span className="text-slate-500">Checked at:</span><span className="font-medium">{selectedBatch.checkedAt}</span></div>}
              {selectedBatch?.rejectReason && <div className="mt-2 p-2 bg-red-50 rounded text-red-700"><span className="font-bold">Rejection:</span> {selectedBatch.rejectReason}</div>}
            </div>

            {/* Row Summary */}
            <div className="grid grid-cols-5 gap-2">
              <div className="bg-emerald-50 border border-emerald-200 rounded p-2 text-center">
                <p className="text-[9px] text-emerald-600 font-bold uppercase">New</p>
                <p className="text-sm font-bold text-emerald-700">{selectedBatch?.newCount}</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-2 text-center">
                <p className="text-[9px] text-blue-600 font-bold uppercase">Modified</p>
                <p className="text-sm font-bold text-blue-700">{selectedBatch?.modifiedCount}</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded p-2 text-center">
                <p className="text-[9px] text-amber-600 font-bold uppercase">Missing</p>
                <p className="text-sm font-bold text-amber-700">{selectedBatch?.missingCount}</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded p-2 text-center">
                <p className="text-[9px] text-emerald-600 font-bold uppercase">Correct</p>
                <p className="text-sm font-bold text-emerald-700">{selectedBatch?.correctCount}</p>
              </div>
              <div className="bg-red-50 border border-red-200 rounded p-2 text-center">
                <p className="text-[9px] text-red-600 font-bold uppercase">Incorrect</p>
                <p className="text-sm font-bold text-red-700">{selectedBatch?.incorrectCount}</p>
              </div>
            </div>

            {/* Column Mapping */}
            <EnterpriseCard className="p-0 overflow-hidden">
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Column Mapping</h4>
              </div>
              <EnterpriseTable
                data={selectedBatch?.columnMapping || []}
                columns={[
                  { id: "fileColumn", header: "File Column", accessor: (col) => <span className="text-xs text-slate-700">{col.fileColumn}</span> },
                  { id: "systemField", header: "System Field", accessor: (col) => <span className="text-xs font-mono text-teal-600">{col.systemField}</span> },
                  { id: "required", header: "Required", accessor: (col) => (
                    <EnterpriseBadge variant={col.required ? "error" : "neutral"} className="text-[9px]">
                      {col.required ? "Y" : "N"}
                    </EnterpriseBadge>
                  )}
                ]}
                rowKey={(col) => col.fileColumn}
              />
            </EnterpriseCard>

            {/* Sample Rows */}
            <EnterpriseCard className="p-0 overflow-hidden">
              <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
                <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sample Rows (Preview)</h4>
              </div>
              <EnterpriseTable
                data={sampleImportRows}
                columns={[
                  { id: "id", header: "#", accessor: (row) => <span className="text-xs font-mono text-slate-500">{row.id}</span> },
                  { id: "category", header: "Cat", accessor: (row) => <CategoryBadge category={row.category} /> },
                  { id: "validation", header: "Val", accessor: (row) => <ValidationBadge validation={row.validation} /> },
                  { id: "code", header: "Code", accessor: (row) => <span className="text-xs font-mono text-slate-700">{row.data.employee_code}</span> },
                  { id: "name", header: "Name", accessor: (row) => <span className="text-xs text-slate-700">{row.data.name || "—"}</span> },
                  { id: "salary", header: "Salary", accessor: (row) => <span className="text-xs font-mono text-slate-700">{formatMMK(Number(row.data.salary) || 0)}</span> }
                ]}
                rowKey={(row) => row.id}
              />
            </EnterpriseCard>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
